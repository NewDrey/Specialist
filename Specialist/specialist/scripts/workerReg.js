/** Скрипты для страницы регистрации специалиста */

/** Запрос списка всех доступных усулуг для выпадающего списка */
fetch('/services').then(response => response.json())
    .then(text => {

        /** Получаем данные: id услуги, название услуги, тип услуги */
        var my_list = services;
        for (i = 0; i < Object.keys(text).length; i++) {
            var li = document.createElement('option');
            li.value = text[i];
            li.id = 'option_' + (i + 1)
            li.className = 'serviceListElement';
            li.append(text[i]);
            my_list.append(li);
        }
    }).then(result => {
        for (let option of services.options) {

            /** Добавление действия всем опциям в выпаадющем списке */
            option.onclick = function () {
                input.value = option.value;
                services.style.display = 'none';
                input.style.borderRadius = "20px";
            }
        };

    });

/** Добавление действия полю ввода. При вводе выдает подобные по буквам значения в выпадающем списке */
input.oninput = function () {
    services.style.display = 'block';
    input.style.borderRadius = "0";
    var text = input.value.toUpperCase();
    for (let option of services.options) {
        if (option.value.toUpperCase().indexOf(text) > -1) {
            option.style.display = "block";
        } else {
            option.style.display = "none";
        };
    };
};



/** Добавление опциям в выпдаюащем списке действие при нажатии*/
const optionGroup = document.getElementById("services");
const optionGroupPressed = e => {
    const isOption = e.target.nodeName === 'OPTION';

    if (!isOption) {
        return
    }
    
    optId = e.target.id
    document.getElementById('addService').disabled = false
}
optionGroup.addEventListener("click", optionGroupPressed);

/** Блокируем кнопку добавления услуги пока пользователь не выберет из списка*/
input.addEventListener('input', () => {
    document.getElementById('addService').disabled = true;
});


mas = []
iServices = 0

/** Присвоение кнопке добавить услугу действия */
document.getElementById('addService').addEventListener('click', function (e) {
    e.preventDefault();

    /** Открывется окно с пустой формой подробного описания заказа*/
    document.getElementById('darknessDiv').style.display = 'block';
    document.getElementById('serviceExtraInfo').style.display = 'block'
    document.getElementById('extraInfoHeader').innerHTML = document.getElementById('input').value   
    document.getElementById('serviceDataButtonChange').style['display'] = 'none'
    document.getElementById('serviceDataButton').style['display'] = 'block'
})

/** Присвоение кнопке в вспылваюшем окне действия добавлени я в бд*/
document.getElementById('serviceForm').addEventListener('submit', function (e) {
    e.preventDefault();
    serviceMas = []

    /** Получаем все данные формы*/
    serviceMas.push(optId.substr(7))
    serviceMas.push(document.getElementById('priceInput').value)
    serviceMas.push(document.getElementById('checkDistance').checked)
    serviceMas.push(document.getElementById('workerRegTextArea').value)

    /** Очистка формы, закрытие окна дополнительной информации, создание кнопки добавленной
     * услуги в общее поле регистрации
     */
    document.getElementById('input').value = ''
    document.getElementById(optId).remove()
    document.getElementById('darknessDiv').style.display = 'none'
    document.getElementById('serviceExtraInfo').style.display = 'none'
    serviceButton = document.createElement('button')
    serviceButton.className = 'workerService'
    serviceButton.style['margin-left'] = '3%'
    serviceButton.innerHTML = document.getElementById('extraInfoHeader').innerHTML
    serviceButton.id = 'service'+ iServices
    iServices += 1

    /** Добавление в кабинет специалиста новых улсуг */
    document.getElementById('servicesButtons').appendChild(serviceButton)
    mas.push(serviceMas)
    document.getElementById('priceInput').value=''
    document.getElementById('workerRegTextArea').value = ''
    document.getElementById('checkDistance').checked = false
    document.getElementById('addService').disabled = true;
    
})

/** Присвоение действия кнопке затемнения - очистка формы и закрыти окна при нажатии */
document.getElementById('darknessDiv').addEventListener('click', function () {
    document.getElementById('darknessDiv').style.display = 'none'
    document.getElementById('serviceExtraInfo').style.display = 'none'
    document.getElementById('priceInput').value = ''
    document.getElementById('workerRegTextArea').value = ''
    document.getElementById('checkDistance').checked = false
    document.getElementById('input').value = ''
    document.getElementById('addService').disabled = true;
});

/** Присвоение кнопке действия - отправка данных в БД, очистка формы, закрытие окна */
document.getElementById('workerRegForm').addEventListener('submit', function (e) {
    e.preventDefault();
    let workerRegForm = document.forms['workerRegForm'];
    let emailValue = workerRegForm.elements['email'].value;
    let passwordValue = workerRegForm.elements['password'].value;
    let nameValue = workerRegForm.elements['name'].value;
    let surnameValue = workerRegForm.elements['surname'].value;
    let phoneValue = document.getElementById('phone').value.replace(/[^0-9]/g, '')
    let cityValue = workerRegForm.elements['cityListReg'].value;
    let services = mas

    /** Запрос на добавление работника в БД*/
    let requestValue = String("email=" + emailValue + '&password=' + passwordValue
        + '&name=' + nameValue + '&surname=' + surnameValue + '&phone=' + phoneValue
        + '&city=' + cityValue + '&services=' + services)
    let request = new XMLHttpRequest();
    request.open('POST', '/workers_reg', true)
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.addEventListener('load', () => {
        if (request.status == 200) {

            /** При удачной аутенфикации возвращает на домашнюю страницу */
            window.location = '/'
        } else if (request.status == 403) {

            /** При ошибке открывает окно с ошибкой */
            document.getElementById('errorDarkness').style['display'] = 'block'
        } else {
            document.getElementById('errorComment').value = 'Проверьте правильность данных'
            document.getElementById('errorDarkness').style['display'] = 'block'
        }
    })
    request.send(requestValue)

    /** При успешной регистрации переход на главную страницу*/
    /*window.location.replace('/');*/
})

/** Запрос на получение списка городов Армении*/
fetch('/cities').then(response => response.json())
    .then(text => {
        for (var i = 0; i < text.city.length; i++) {

            /**Получаем id города, название, заносим в выпадающий список городов*/
            var x = document.getElementById("cityListReg");
            var option = document.createElement("option");
            option.text = JSON.stringify(text.city[i].ru).replaceAll('"', '');
            option.className = 'serviceListElement'
            x.appendChild(option)
        }
    });

/** Присвоение кнопкам  добавленных услуг действия при нажатии*/
const serviceGroup = document.getElementById("servicesButtons");
const serviceGroupPressed = e => {
    const isButton = e.target.nodeName === 'BUTTON';
    e.preventDefault()

    if (!isButton) {
        return
    }

    btnId = e.target.id

    /** Открывается окно  подробной информации услуи-работника с возможностью изменения*/
    document.getElementById('darknessDiv').style['display'] = 'block'
    document.getElementById('serviceExtraInfo').style['display'] = 'block'
    document.getElementById('serviceDataButtonChange').style['display'] = 'block'
    document.getElementById('serviceDataButton').style['display'] = 'none'
    numberId = btnId.substr(7)
    localStorage.setItem('serviceChange', numberId)
    document.getElementById('extraInfoHeader').innerHTML = document.getElementById(btnId).innerHTML
    document.getElementById('priceInput').value = mas[numberId][1]
    document.getElementById('checkDistance').checked = mas[numberId][2]
    document.getElementById('workerRegTextArea').value = mas[numberId][3]
}
serviceGroup.addEventListener("click", serviceGroupPressed);


/** Кнопка в всплывающем окней получает действие - изменение уже добавненой услуги, после нажатия
 * очищает форму. закрывает окно
 */
document.getElementById('serviceDataButtonChange').addEventListener('click', (e) => {
    e.preventDefault();
    if (document.getElementById('priceInput').value < 0) {
        document.getElementById('positiveComment').style['display'] = 'block'
        return
    }
    buttonId = localStorage.getItem('serviceChange');
    mas[buttonId][1] = document.getElementById('priceInput').value
    mas[buttonId][2] = document.getElementById('checkDistance').checked
    mas[buttonId][3] = document.getElementById('workerRegTextArea').value
    document.getElementById('darknessDiv').style.display = 'none'
    document.getElementById('serviceExtraInfo').style.display = 'none'
    document.getElementById('priceInput').value = ''
    document.getElementById('workerRegTextArea').value = ''
    document.getElementById('checkDistance').checked = false
    document.getElementById('serviceDataButtonChange').style['display'] = 'none'
    document.getElementById('serviceDataButton').style['display'] = 'block'
});

/** При нажатии на блок затемнения, очищает форму, закрывает окно ошибки */
document.getElementById('errorDarkness').addEventListener('click', () => {
    document.getElementById('errorDarkness').style['display'] = 'none';
});

/** При нажатии на кнопку в окне ошибки, закрывает окно, очищает форму */
document.getElementById('closeErrorButton').addEventListener('click', () => {
    document.getElementById('errorDarkness').style['display'] = 'none';
})
