/** Скрипты для личного кабинета специалиста */

/** Скрипт выхода из аккаунта специалиста, перехода на домашнюю страницу */
document.getElementById('logoutButtonWorker').addEventListener('click', function () {
    localStorage.removeItem('workerId');
    localStorage.removeItem('workerName');
    localStorage.removeItem('workerPhone');
    window.location = '/logout'
});

/** Скрипт удаления аккаунта специалиста, перехода на домашнюю страницу */
document.getElementById('deleteUserButton').addEventListener('click', function () {
    localStorage.removeItem('workerId');
    localStorage.removeItem('workerName');
    localStorage.removeItem('workerPhone');
    window.location.replace('/deleteWorker');
});

/** Запрос получения списка всех услуг
 * Выходные значения: id услуги, название услуги, тип услуги
 */
fetch('/services').then(responseServices => responseServices.json())
    .then(text => {

        /** Наполнение выпадающего списка доступными услугами */
        var my_list = document.getElementById('services')
        for (i = 0; i < Object.keys(text).length; i++) {
            li = document.createElement('option');
            li.id = 'option_' + (i + 1)
            li.className = 'serviceListElement'
            li.append(text[i]);
            my_list.append(li);
        } 
    }).then(() => {
        for (let option of document.getElementById('services').options) {

            /** Назначение действия вариантом в  выпадающем списке */
            option.onclick = function () {
                input.value = option.value;
                document.getElementById('services').style.display = 'none';
                input.style.borderRadius = "20px";
            }
        };
    }).then(() => {

        /** Запрос всех услуг,  предоставляемых специалистом
         * Выходные значения: id услуги, название услуги, тип услуги
         */
        var request = new XMLHttpRequest();
        request.open('POST', '/workerCabinetServices', true)
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.setRequestHeader("charset", "utf-8");
        request.addEventListener('load', async function () {
            if (request.status == 501) {
                console.log('Ошибка')
            } else {
                var jsonLength = Object.keys(JSON.parse(request.response)).length
                for (i = 0; i < jsonLength; i++) {

                    /** Создание кнопок услуг */
                    key = (Object.keys(JSON.parse(request.response))[i])
                    var serviceButton = document.createElement('button')
                    serviceButton.id = 'service' + key
                    serviceButton.className = 'workerService'
                    serviceButton.innerHTML = JSON.parse(request.response)[key]
                    document.getElementById('workerCabinetServices').appendChild(serviceButton)
                };
            };
        });
        request.send('workerId=' + localStorage.getItem('workerId'))
    })

/** Присвоение кнопкам действие - открытие окна с подробным описание услуги */
const buttonGroup = document.getElementById("workerCabinetServices");
const buttonGroupPressed = e => {
    const isButton = e.target.nodeName === 'BUTTON';
    
    if (!isButton) {
        return
    }

    btnId = e.target.id
    document.getElementById('darknessDiv').style['display'] = 'block';
    document.getElementById('serviceExtraInfo').style['display'] = 'block'
    document.getElementById('extraInfoHeader').innerHTML = document.getElementById(btnId).innerHTML
    document.getElementById('serviceDataButton').style.display = 'block'
    document.getElementById('serviceDataButtonAdd').style.display = 'none'

    /** Запрос на получение подробного описания услуги-работника */
    var requestService = new XMLHttpRequest();
    requestService.open('POST', '/serviceMoreInfo', true)
    requestService.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    requestService.setRequestHeader("charset", "utf-8");
    requestService.addEventListener('load', function () {

        /** Получение данных - id улсуги-работника, название, цена, комментарий, город, дистанционная работа*/
        document.getElementById('priceInput').value = JSON.parse(requestService.response).price
        document.getElementById('checkDistance').checked = JSON.parse(requestService.response).distance
        document.getElementById('workerRegTextArea').value = JSON.parse(requestService.response).comment
    })
    requestService.send('serviceId=' + btnId.substr(7) + '&workerId=' + localStorage.getItem('workerId'))
}
buttonGroup.addEventListener("click", buttonGroupPressed);

/** Присвоение блоку затемнения действия на закрытия окна подробного описания*/
document.getElementById('darknessDiv').addEventListener('click', function () {
    document.getElementById('darknessDiv').style['display'] = 'none'
    document.getElementById('serviceExtraInfo').style['display'] = 'none'
    document.getElementById('serviceDataButton').style['display'] = 'block'
    document.getElementById('input').value = ''
    document.getElementById('priceInput').value = ''
    document.getElementById('workerRegTextArea').value = ''
    document.getElementById('checkDistance').checked = false
    document.getElementById('addService').disabled = true;
})

/** Присвоение кнопке в подробном описании заказа действия на изменение улсуги-работника*/
document.getElementById('serviceDataButton').addEventListener('click', (e) => {
    e.preventDefault();
    var optId = localStorage.getItem('optId')
    if (document.getElementById('priceInput').value < 0) {
        document.getElementById('positiveComment').style['display'] = 'block';
        return
    } else {
        /** Получение данных полей подробного описания услуги-работника  */
        priceValue = document.getElementById('priceInput').value
        distanceValue = document.getElementById('checkDistance').checked
        commentValue = document.getElementById('workerRegTextArea').value

        /**Запрос на измененние улсуги-работника*/
        var requestService = new XMLHttpRequest();
        requestService.open('POST', '/changeServiceWorker', true)
        requestService.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        requestService.setRequestHeader("charset", "utf-8");
        requestService.send('serviceId=' + btnId.substr(7) + '&workerId=' + localStorage.getItem('workerId') +
            '&price=' + priceValue + '&distance=' + distanceValue + '&comment=' + commentValue)

        /** Очистка и закрытие окна подробного описания услуги-работника */
        document.getElementById('input').value = ''
        document.getElementById('priceInput').value = ''
        document.getElementById('workerRegTextArea').value = ''
        document.getElementById('checkDistance').checked = false
        document.getElementById('darknessDiv').style.display = 'none'
        document.getElementById('serviceExtraInfo').style.display = 'none'
        document.getElementById('serviceDataButton').style.display = 'none'
        document.getElementById('serviceDataButtonAdd').style.display = 'none'
    }
})

/** Создание действия на ввод для поля добавления услуги*/
input.oninput = function () {
    document.getElementById('services').style.display = 'block';
    var text = input.value.toUpperCase();
    for (let option of services.options) {
        if (option.value.toUpperCase().indexOf(text) > -1) {
            option.style.display = "block";
        } else {
            option.style.display = "none";
        };
    };
};

/** Присвоение опциям выпадающего списка действия - внесении данных  в строку*/
const optionGroup = document.getElementById("services");
const optionGroupPressed = e => {
    const isOption = e.target.nodeName === 'OPTION';

    if (!isOption) {
        return
    }
    document.getElementById('addService').disabled = false;
    localStorage.setItem('optId', e.target.id)
}
optionGroup.addEventListener("click", optionGroupPressed);


/** Присвоение действия Добавить услугу-рабника*/
document.getElementById('addService').addEventListener('click', function (e) {
    e.preventDefault();

    /** При нажатии открывает пустое окно информации по услуге для заполнения */
    document.getElementById('darknessDiv').style.display = 'block';
    document.getElementById('serviceExtraInfo').style.display = 'block'
    document.getElementById('extraInfoHeader').innerHTML = document.getElementById('input').value
    document.getElementById('serviceDataButton').style.display = 'none'
    document.getElementById('serviceDataButtonAdd').style.display = 'block'
});
 
/** Присовение кнопке (через форму) в окне подробной информации - функции добавления услуги-работника */
document.getElementById('changeServiceData').addEventListener('submit', function (e) {
    e.preventDefault()
    var optId = localStorage.getItem('optId').substring(7)

    /** Получение данных из полей формы */
    priceValue = document.getElementById('priceInput').value
    distanceValue = document.getElementById('checkDistance').checked
    commentValue = document.getElementById('workerRegTextArea').value

    /** Запрос на добавление услуги-работника в бд*/
    request = new XMLHttpRequest();
    request.open('POST', '/addServiceWorker', true)
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.setRequestHeader("charset", "utf-8");
    request.addListener('load', () => {
        if (request.status == 501) {
            console.log('Ошибка')
        } else {

            /** После нажатия происходит отчистка формы в окней подробной информации и закрытие окна*/
            document.getElementById('input').value = ''
            document.getElementById('priceInput').value = ''
            document.getElementById('workerRegTextArea').value = ''
            document.getElementById('checkDistance').checked = false
            document.getElementById('darknessDiv').style.display = 'none'
            document.getElementById('serviceExtraInfo').style.display = 'none'
            document.getElementById('serviceDataButton').style.display = 'block'
            document.getElementById('serviceDataButtonAdd').style.display = 'none'
            document.getElementById('addService').disabled = true;
            window.location.reload();
        }
    })
    request.send('serviceId=' + optId + '&workerId=' + localStorage.getItem('workerId') +
        '&price=' + priceValue + '&distance=' + distanceValue + '&comment=' + commentValue)
});



/** Кнопка изменения имени сотрудника*/
document.getElementById('changeName').addEventListener('submit', function (e) {
    e.preventDefault();
    request = new XMLHttpRequest();
    var value = document.getElementById('name').value
    request.open('POST', '/changeWorker', true)
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.setRequestHeader("charset", "utf-8");
    request.addEventListener('load', () => {
        if (request.status == 501) {

            /** Если ответ отрицательный - появлется текст ошибки */
            document.getElementById('nameComment').innerHTML = 'Что-то пошло не так, попробуйте снова <br /><br />'
            document.getElementById('nameComment').style['display'] = 'block'
        } else {

            /** Если ответ положительный - появлется текст подтверждения */
            document.getElementById('nameComment').innerHTML = 'Изменения внесены &#10003; <br /><br />'
            document.getElementById('nameComment').style['display'] = 'block'
        };
    });
    request.send('workerId=' + localStorage.getItem('workerId') + '&columnName=' + 'name' + '&value=' + value)
});

/** Кнопка изменения фамилии сотрудника*/
document.getElementById('changeSurname').addEventListener('submit', function (e) {
    e.preventDefault();
    request = new XMLHttpRequest()
    var value = document.getElementById('surname').value
    request.open('POST', '/changeWorker', true)
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.setRequestHeader("charset", "utf-8");
    request.addEventListener('load', () => {
        if (request.status == 501) {

            /** Если ответ отрицательный - появлется текст ошибки */
            document.getElementById('surnameComment').innerHTML = 'Что-то пошло не так, попробуйте снова <br /><br />'
            document.getElementById('surnameComment').style['display'] = 'block'
        } else {

            /** Если ответ положительный - появлется текст подтверждения */
            document.getElementById('surnameComment').innerHTML = 'Изменения внесены &#10003; <br /><br />'
            document.getElementById('surnameComment').style['display'] = 'block'
        };
    });
    request.send('workerId=' + localStorage.getItem('workerId') + '&columnName=' + 'surname' + '&value=' + value)
});

/** Кнопка изменения телефона сотрудника*/
document.getElementById('changePhone').addEventListener('submit', function (e) {
    e.preventDefault();
    let phoneValue = document.getElementById('phone').value.replace(/[^0-9]/g, '')
    request = new XMLHttpRequest()
    var value = document.getElementById('phone').value
    request.open('POST', '/changeWorker', true)
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.setRequestHeader("charset", "utf-8");
    request.addEventListener('load', () => {
        if (request.status == 501) {

            /** Если ответ отрицательный - появлется текст ошибки */
            document.getElementById('phoneComment').innerHTML = 'Что-то пошло не так, попробуйте снова <br /><br />'
            document.getElementById('phoneComment').style['display'] = 'block'
        } else {

            /** Если ответ положительный - появлется текст подтверждения */
            document.getElementById('phoneComment').innerHTML = 'Изменения внесены &#10003; <br /><br />'
            document.getElementById('phoneComment').style['display'] = 'block'
        }
    });
    request.send('workerId=' + localStorage.getItem('workerId') + '&columnName=' + 'phone' + '&value=' + phoneValue)
})

/**Запрос данных работника*/
requestUserData = new XMLHttpRequest();
requestUserData.open('POST', '/workerInfo', true);
requestUserData.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
requestUserData.setRequestHeader("charset", "utf-8");


/** Получаем id работника, имя, фамилия, телефон, город, пароль, email */
requestUserData.addEventListener('load', function () {
    if (requestUserData.status == 501) {
        console.log('Что-то пошло не так');
    } else { 
        var userData = JSON.parse(requestUserData.response);
        
    /** Внесени данных в поля ввода в кабинете специлаиста */
        if (userData.name == 'null') {
            document.getElementById('name').placeholder = 'Давайте знакомиться';
        } else {
            document.getElementById('name').value = userData.name;
        }

        if (userData.surname == 'null') {
            document.getElementById('surname').placeholder = 'Ваша фамилия';
        } else {
            document.getElementById('surname').value = userData.surname;;
        }
        if (userData.phone == 'null') {
            document.getElementById('phone').placeholder = 'Ваш номер телефона'
        } else {
            document.getElementById('phone').value = userData.phone;
        };
    };
})
requestUserData.send('workerId=' + localStorage.getItem('workerId'))


/** Блокируем кнопку добавления услуги пока пользователь не выберет из списка*/
input.addEventListener('input', () => {
    document.getElementById('addService').disabled = true;
});

