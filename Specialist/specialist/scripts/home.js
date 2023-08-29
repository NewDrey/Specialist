/** Скрипты для домашней страницы*/

/** Обращение к внешнему скрипту на определение города в котором находится пользователь */
$(document).ready(function () {
	ymaps.ready(function () {
		if (localStorage.getItem('chosen_city_id') == null) {
			var geolocation = ymaps.geolocation;
			for (i = 0; i < 48; i++) {

				if (localStorage.getItem('city_ru' + i) == geolocation.city) {
					localStorage.setItem('chosen_city_id', i)

				} else {
					localStorage.setItem('chosen_city_id', 0)
				}
			}

		}
		headerData(localStorage.getItem('chosen_city_id'));
	});
});

/** Проверка на правильное написание слова специалист в зависимости от количества специалистов
 * в городе
 */
const checkSpecialist = (i) => {
	if (String(i).length >= 2) {
		var lastTwoNumbers = Number(String(i)[String(i).length - 2] + String(i)[String(i).length - 1])
	} else {
		lastTwoNumbers = 0
	}
	var lastNumber = Number(String(i)[String(i).length - 1]);
	if (lastTwoNumbers == 11 || lastTwoNumbers == 12 || lastTwoNumbers == 13 || lastTwoNumbers == 14) {
		return 'специалистов';
	} else if (lastNumber == 1) {
		return 'специалист';
	} else if (lastNumber == 2 || lastNumber == 3 || lastNumber == 4) {
		return 'специалиста';
	} else {
		return 'специалистов'
	}
};

/** Функция присвоения кнопке города в верхнем меню значения и количества специалистов в 
 * основном заголовке домашней страицы
 */
const headerData = (id) => {
	localStorage.setItem('chosen_city_id', id)
	var h1 = document.getElementsByTagName('h1')[0];
	h1.innerHTML = 'Доверь работу<br> специалисту в ' + localStorage.getItem('city_ru_' + id);
	var h2 = document.getElementsByTagName('h2')[0];
	h2.innerHTML = 'В вашем городе ' + localStorage.getItem('AOW' + id) + ' ' + checkSpecialist(localStorage.getItem('AOW' + id));
	$('#tow').html(localStorage.getItem('city_ru' + id) + ' &#9207;');
};

/** Запрос на список городов Армении*/
fetch('/cities').then(response => response.json())
	.then(text => {
		for (var i = 0; i < text.city.length; i++) {
			var x = document.getElementById("cityList");
			let li = document.createElement('li');
			let btn = document.createElement('button');
			btn.id = i;
			btn.className = 'ui_listButton'
			var city = JSON.stringify(text.city[i].ru).replaceAll('"', '');
			localStorage.setItem('city_ru' + (i), text.city[i]['ru']);
			localStorage.setItem('city_ru_' + (i), text.city[i]['ru2']);
			localStorage.setItem('AOW' + (i), text.city[i]['amountOfWorkers']);

			btn.onclick = () => {
				headerData(btn.id);
				document.getElementById('zatemnenie').style['display'] = 'none'
			}
			btn.append(city);
			li.append(btn)
			cityList.append(li);
		};

	});

/** Задача действия  кнопке города (вызов затемнения и списка городов) */
document.getElementById('tow').onclick = () => {
	document.getElementById('zatemnenie').style['display'] = 'block'
	document.getElementById('cityList').style['display'] = 'block'
};

/** Запрос на получение всех доступных услуг для поисковой строки */
fetch('/services').then(response => response.json())
	/** Получаем id услуги и ее название */
	.then(text => {
		var my_list = browsers

		/** Добавление данных в выпадающий список услуг */
		for (i = 0; i < Object.keys(text).length; i++) {
			li = document.createElement('option');
			li.value = text[i];
			li.id = 'option_' + (i + 1)
			li.append(text[i]);
			li.className = 'serviceListElement'
			my_list.append(li);
		}

	}).then(result => {

		/** Задание внешнего вида и текста варианта услуг в списке */
		for (let option of browsers.options) {
			option.onclick = function () {
				input.value = option.value;
				browsers.style.display = 'none';
				input.style.borderRadius = "20px";
			}
		};

	});


/** присвоение действия поисковой строке, реагирующей на ввод, поиск по символам*/
input.oninput = function () {
	/** Показ списка услуг */
	browsers.style.display = 'block';
	var text = input.value.toUpperCase();
	for (let option of browsers.options) {
		if (option.value.toUpperCase().indexOf(text) > -1) {
			option.style.display = "block";
		} else {
			option.style.display = "none";
		};
	};
};

/** Присовение действия вариантам в выпадающем списке. На клик значение варианта
 *  появляется в поисковой строке 
 * */
const optionGroup = document.getElementById("browsers");
const optionGroupPressed = e => {
	const isOption = e.target.nodeName === 'OPTION';

	if (!isOption) {
		return
	}
	const optId = e.target.id

	localStorage.setItem('optId', optId.substr(7))
	document.getElementById('createOrder').disabled = false
};
optionGroup.addEventListener("click", optionGroupPressed);

/** Блокируем кнопку добавления заказа пока пользователь не выберет из списка*/
input.addEventListener('input', () => {
	document.getElementById('createOrder').disabled = true;
});

/** Действие кнопки создания заказа*/
document.getElementById('createOrder').addEventListener('click', async function (e) {
	e.preventDefault();
	var service = document.getElementById('input').value

	/** Защита от пустого поля */
	if (localStorage.optId == undefined) {
		return
	} else {

		/** Запрос на переход на страницу создания нового заказа*/
		var url = '/createOrder'
		var optIdValue = localStorage.getItem('optId')

		/** Вненение названия и id услуги в localStorage */
		localStorage.setItem('serviceOrderId', optIdValue)
		localStorage.setItem('serviceOrderName', service)
		fetch(url, {
			method: 'get',
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
		}).then(response => {

			/** Переход на страницу создания нового заказа */
			window.location = ('/createOrder')
		})

	}
});

/** Нажатие на блок затемнения ведет к его закрытию*/
document.getElementById('zatemnenie').addEventListener('click', function () {
	document.getElementById('zatemnenie').style.display = 'none'
})

/** Если сессия закреплена за работником, то поисковая строка заменяется на кнопки заказов*/
if (localStorage.getItem('workerId') != null) {
	document.getElementById('searchField').style['display'] ='none'
	document.getElementById('showAvailableOrders').style['display'] ='block'
	document.getElementById('showAvailableChats').style['display'] ='block'
}

/** Присвоение кнопке заказов действия перехода на страницу доступных заказов */
document.getElementById('showAvailableOrders').addEventListener('click', () => {
	window.location = '/availableOrders'
})

/** Присвоение кнопке чатов действия перехода на страницу доступных чатов */
document.getElementById('showAvailableChats').addEventListener('click', () => {
	window.location = '/availableChats'
})