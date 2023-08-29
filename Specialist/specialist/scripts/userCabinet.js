/** Скрипты для личного кабинета пользователя*/

/** Кнопка выхода пользователя, переводит на домашний жкран */
document.getElementById('logoutButton').addEventListener('click', function () {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userPhone');
    window.location = ('/logout');
});

/** Кнопка удаления аккаунта пользователя. Переводит на домашний экран*/
document.getElementById('deleteUserButton').addEventListener('click', function () {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userPhone');
    window.location.replace('/deleteUser');
});

/** Кнопка изменения имени пользователя */
document.getElementById('changeName').addEventListener('submit', function (e) {
    e.preventDefault();
    let nameValue = document.getElementById('name').value
    let requestValue = String('userId=' + localStorage.getItem('userId') + "&columnName=" + 'name' + '&value=' + nameValue );
    let request = new XMLHttpRequest();
    request.open('POST', '/changeUser', true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.addEventListener('load', function () {
        if (request.status == 501) {

            /** При ответе ошибкой появляется подпись ошибки */
            document.getElementById('nameComment').innerHTML = 'Что-то пошло не так, попробуйте снова <br /><br />'
            document.getElementById('nameComment').style['display'] = 'block'
        } else {

            /** При успешном изменении появляетс янадпись подтверждения */
            document.getElementById('nameComment').innerHTML = 'Изменения внесены &#10003; <br /><br />'
            document.getElementById('nameComment').style['display'] = 'block'
        }
    })
    request.send(requestValue);
});

/** Кнопка изменения телефона пользователя */
document.getElementById('changePhoneButton').addEventListener('click', function (e) {
    e.preventDefault();
    let phoneValue = document.getElementById('phone').value.replace(/[^0-9]/g, '')
    let requestValue = String('userId=' + localStorage.getItem('userId') + "&columnName=" + 'phone' + '&value=' + phoneValue);
    let request = new XMLHttpRequest();
    request.open('POST', '/changeUser', true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.addEventListener('load', function () {
        if (request.status == 501) {

            /** При ответе ошибкой появляется подпись ошибки */
            document.getElementById('phoneComment').innerHTML = 'Что-то пошло не так, попробуйте снова <br /><br />'
            document.getElementById('phoneComment').style['display'] = 'block'
        } else {

            /** При успешном изменении появляетс янадпись подтверждения */
            document.getElementById('phoneComment').innerHTML = 'Изменения внесены &#10003; <br /><br />'
            document.getElementById('phoneComment').style['display'] = 'block'
        }
    })
    request.send(requestValue);
});

/** Запрос на максимум 3 заказа в кабинете пользователя */
var request = new XMLHttpRequest();
request.open('POST', '/userCabinetOrders', true)
request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
request.setRequestHeader("charset", "utf-8");

/** Из запроса приходят список с id заказа, название услуги  */
request.addEventListener('load', function () {
    var jsonLength = (Object.keys(JSON.parse(request.response)).length)
    for (i = 0; i < jsonLength; i++) {

        /** Создание блока заднего фона заказа*/
        var orderDiv = document.createElement('div')
        orderDiv.className = 'orderDivUserCabinet'
        orderDiv.id = 'order' + Object.keys(JSON.parse(request.response))[i]

        /** Создание заголовка с id заказа */
        var orderId = document.createElement('h2')
        orderId.id = 'head1' + Object.keys(JSON.parse(request.response))[i]
        orderId.innerHTML = 'Заказ #' + Object.keys(JSON.parse(request.response))[i]

        /** Создание текста с название услуги*/
        var serviceName = document.createElement('h3')
        serviceName.id = 'head2' + Object.keys(JSON.parse(request.response))[i]
        serviceName.innerHTML=(JSON.parse(request.response)[Object.keys(JSON.parse(request.response))[i]])

        orderDiv.appendChild(orderId)
        orderDiv.appendChild(serviceName)
        document.getElementById('userCabinetOrders').appendChild(orderDiv)
    }

    /** Создание кнопки просмотра всех заказов*/
    var showAllOrders = document.createElement('button');
    showAllOrders.id = 'showAllOrdersButton'
    showAllOrders.className = 'showAllOrdersButton'
    showAllOrders.onclick = findAllOrders
    showAllOrders.innerHTML='Показать все'
    document.getElementById('userCabinetOrders').appendChild(showAllOrders)
})
request.send('userId=' + localStorage.getItem('userId'))

/** Присвоение действий блокам заказов. При нажатии открывается страница подробной информации по заказу и чатов */
const buttonGroup = document.getElementById("userCabinetOrders");
const buttonGroupPressed = e => {
    const isDiv = (e.target.nodeName === 'DIV' || e.target.nodeName === 'H2' || e.target.nodeName === 'H3');
    if (!isDiv) {
        return
    }
    if (e.target.id == 'userCabinetOrders') {
        return
    }
    headerId = e.target.id

    /** Внесение id заказа в localStorage */
    localStorage.setItem('orderId', headerId.substr(5));
    window.location = ('/orderPage')
}
buttonGroup.addEventListener("click", buttonGroupPressed);


/** Запрос на получение информации пользователя */
requestUserData = new XMLHttpRequest();
requestUserData.open('POST', '/userInfo', true)
requestUserData.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
requestUserData.setRequestHeader("charset", "utf-8");
requestUserData.addEventListener('load', function () {

    /** Из запроса приходя имя пользователя, id, email, пароль, телефон, имя */
    userData = JSON.parse(requestUserData.response)

    /** Подставляем данные в поля ввода в данных пользователя*/
    if (userData.name == 'null') {
        document.getElementById('name').placeholder = 'Давайте знакомиться'
    } else {
        document.getElementById('name').value = userData.name
    }
    if (userData.phone == 'null') {
        document.getElementById('phone').placeholder = 'Ваш номер телефона'
    } else {
        document.getElementById('phone').value =  userData.phone
    }
})
requestUserData.send('userId=' + localStorage.getItem('userId'))

/** Скрипт перехода ко всем заказам пользователя */
const findAllOrders = () => {
    window.location ='/findAllOrdersByUser'
}
