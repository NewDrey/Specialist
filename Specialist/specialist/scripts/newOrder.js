/** Скрипты для страницы создания нового заказа */

/** Вносим название услуги в верхний заголовок*/
document.getElementById('serviceName').innerHTML = localStorage.getItem('serviceOrderName');

/** Добавляем действие чекбоксу "по договоренности с исполнителем". В случае нажатия
 * блокирует изменение даты заказа
 */
document.getElementById('checkDate').addEventListener('change', (e) => {
    if (e.currentTarget.checked) {
        document.getElementById('dateField').value = '';
        document.getElementById('dateField').disabled = true;
    } else {

        /** При повторнорм нажатии снова активирует поле ввода даты */
        document.getElementById('dateField').disabled = false;
    }
})

/**Задаем минимальную дату для нового заказа*/
let today = new Date();
let year = today.getFullYear();
let month = String("0" + (today.getMonth() + 1));
let day = today.getDate();
var dateStr = String(year + '-' + month + '-' + day);
document.getElementById('dateField').min = dateStr;

/** Если дата введенная пользователем меньше сегодняшней, возвращаем к сегодняшней*/
document.getElementById('dateField').addEventListener('focusout', () => {
    if (Date.parse(Date()) > Date.parse(document.getElementById('dateField').value)) {
        document.getElementById('dateField').value = dateStr;
    }
})

/** Присвоение действия кнопке создания заказа */
document.getElementById('newOrderButton').addEventListener('click', function (e) {
    e.preventDefault();

    /** Получение данных формы */
    let newOrderForm = document.forms['newOrderForm'];
    let descriptionValue = newOrderForm.elements['descriptionField'].value;
    var dateValue = '';
    if (document.getElementById('dateField').disabled == true) {
        dateValue = 'false'
    } else {
        dateValue = newOrderForm.elements['dateField'].value;
    }
    let distanceValue = newOrderForm.elements['newOrderDistance'].checked;
    let cityId = localStorage.getItem('chosen_city_id');
    let cityValue = localStorage.getItem('city_ru' + cityId);

    /** Запрос на добавление заказа */
    let requestValue = String("&serviceId=" + localStorage.getItem('serviceOrderId')
        + '&description=' + descriptionValue + '&date=' + dateValue + '&distance=' + distanceValue + '&city=' + cityValue);
    let request = new XMLHttpRequest();
    request.open('POST', '/createOrder', true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.setRequestHeader("charset", "utf-8");
    request.addEventListener('load', function () {
        if (request.status == 200) {
            /** При успешном создании заказа открываем блок подтверждения, скрываем форму*/
            document.getElementById('mainDiv').style['display'] = 'none';
            document.getElementById('returnHomeDiv').style['display'] = 'block';
        } else {
            console.log('Ошибка');
        };
    });
    request.send(requestValue);
    
})

/** присвоения действия на возврат на домашнюю страницу кнопке возврата (скрыта по умолчанию) */
document.getElementById('returnHomeButton').addEventListener('click', function () {
    window.location.replace('/');
})
