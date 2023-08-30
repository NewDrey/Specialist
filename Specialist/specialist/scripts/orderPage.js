/** Подробности заказа от лица пользователя из личного кабинета */

/** Запрос на поулчение данных по заказу из БД*/
var request = new XMLHttpRequest();
request.open('POST', '/availableOrderDescription', true)
request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
request.setRequestHeader("charset", "utf-8");

/** Из запроса получаем id заказа, описание, возможность дистанционной работы, город заказа,
 * дата исполнения, id услуги, id пользователя, статус заказа, дата создания, дата обновления
 */
request.addEventListener('load', function () {
    responseValue = JSON.parse(request.response)

    /** Внесение полученных данных в поле заказа */
    document.getElementById('orderDescriptionHeader').innerHTML = responseValue.Service.serviceName
    document.getElementById('descriptionField').value = responseValue.description
    document.getElementById('checkDistance').checked = responseValue.distance
    if (responseValue.date == 'false') {
        document.getElementById('checkDate').checked = true
        document.getElementById('dateField').value = ''
        document.getElementById('dateField').disabled = true
    } else {
        document.getElementById('dateField').value = responseValue.date
    }

    /** Если заказ не активен, появится кнопка возобновить. Если активен, будут кнопки
     * деактивировать и изменить
     */
    if (responseValue.isActive == true) {
        document.getElementById('restartOrder').style['display'] = 'none'
        document.getElementById('closeOrder').style['display'] = 'block'
    } else {
        document.getElementById('changeOrder').style['display'] = 'none'
        document.getElementById('closeOrder').style['display'] = 'none'
        document.getElementById('restartOrder').style['display'] = 'block'
    }
})
request.send('orderId=' + localStorage.getItem('orderId'))

/** Открытие вебсокета и присвоение ему действий*/
var socket = io();
socket.on('message', socketMessage)

/** Запрос на получение данных о чатах, связанных с заказом*/
requestChats = new XMLHttpRequest();
requestChats.open('POST', '/userChats', true)
requestChats.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
requestChats.setRequestHeader("charset", "utf-8");

/** Получаем id заказа, id пользователя, id откликнувшихся работников, имена работников, email работников,
 * пароль работников, телефон работников, фамилию работников, города работников, id доступных чатов, 
 * даты создания, даты обновления
 */
requestChats.addEventListener('load', function () {
    responseValueChats = JSON.parse(requestChats.response)

    /** Создаем кнопки перехода в чаты с работниками*/
    for (i in responseValueChats) {
        var chatBtn = document.createElement('Button');
        chatBtn.className = 'chatAnsweredButtons'
        chatBtn.id = responseValueChats[i].id
        chatBtn.innerHTML = responseValueChats[i].Worker.name 
        document.getElementById('sidenav').appendChild(chatBtn)
    }
})
requestChats.send('orderId=' + localStorage.getItem('orderId'))

/** Добавляем действия перехода в чат для бокового меню */
const buttonGroup = document.getElementById("sidenav");
const buttonGroupPressed = e => {
    const isDiv = e.target.nodeName === 'BUTTON';

    if (!isDiv) {
        return
    }

    /** Очищаем поле заказа*/
    document.getElementById('field').innerHTML = ''
    if (localStorage.getItem('chatId')  != null) {
        socket.emit('leave', localStorage.getItem('chatId'))
    }
    document.getElementById('orderDescriptionField').style['display'] = 'none'
    document.getElementById('orderDescription').style['display'] = 'none'

    /** Добавляем в localStorage id чата, к которому обращаемся */
    localStorage.setItem('chatId', e.target.id)

    /** Создаем веб сокет соединение, заходим  в комнату по id чата*/
    socket.emit('create', localStorage.getItem('chatId'));

    /** Открываем чат и наполняем его сообщениями*/
    var chatName = document.createElement('h2')
    var messageInput = document.createElement('textarea')
    var sendButton = document.createElement('button')
    var chatField = document.createElement('div')
    chatName.innerHTML = e.target.innerHTML
    chatName.style['margin-left'] = '3%'
    messageInput.id = 'messageContent'
    messageInput.className = 'chatTextArea'
    messageInput.placeholder ='Введите ваше сообщение'
    sendButton.id = 'sendMessage'
    chatField.id = 'chatField'
    chatField.className = 'chatDiv'
    sendButton.className = 'chatButtonSend'
    sendButton.innerHTML = 'Отправить'
    document.getElementById('field').appendChild(chatName)
    document.getElementById('field').appendChild(chatField)
    document.getElementById('field').appendChild(sendButton)
    document.getElementById('field').appendChild(messageInput)

    /** Получаем сообщения по id чата */
    getMessages(e.target.id)
}
buttonGroup.addEventListener("click", buttonGroupPressed);

/** Запрос на все прошлые сообщения в чате*/
function getMessages(chatId) {
    var request = new XMLHttpRequest();
    request.open('POST', '/findMessages', true)
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.setRequestHeader("charset", "utf-8")
    request.addEventListener('load', () => {
        /** Добавление сообщений в чат. Из запроса получаем id сообщения,
         * содержание, дата создания, дата изменения, id чата
         */
        addMessages(JSON.parse(request.response))
    })
    request.send('&chatId=' + chatId)
}

/** Выгрузка сообщений из базы данных */
function addMessages(message) {
    for (i in message) {

        /** Создание блока сообщения */
        divMessage = document.createElement('div')
        divMessage.innerHTML = message[i].content

        /** Присвоение стороны отправки сообщению */
        role = message[i].role

        /** Настройка вида отправленного сообщения */
        displayMessage(role, divMessage)

        /** Отправка сообщения в чат */
        document.getElementById('chatField').appendChild(divMessage)
    }
    document.getElementById('chatField').scrollTop = document.getElementById('chatField').scrollHeight
}

/** Настройка вида отправленного сообщения */
const displayMessage = (role, divMessage) => {

    /** Присвоение размеров и стороны положения сообщения в зависимости от роли */
    if (role == 1 && localStorage.getItem('uesrId') == null) {
        divMessage.style['max-width'] = '55%'
        divMessage.style['margin-left'] = '-3%'
    } if (role == 0 && localStorage.getItem('uesrId') == null) {
        divMessage.style['background-color'] = 'background-color: rgba(102, 102, 102, 0.15)'
        divMessage.style['max-width'] = '55%'
        divMessage.style['position'] = 'relative'
        divMessage.style['margin-left'] = '38%'
    } if (role == 0 && localStorage.getItem('uesrId') != null) {
        divMessage.style['max-width'] = '55%'
        divMessage.style['margin-left'] = '-3%'
    } if (role == 1 && localStorage.getItem('uesrId') != null) {
        divMessage.style['background-color'] = 'background-color: rgba(102, 102, 102, 0.15)'
        divMessage.style['max-width'] = '55%'
        divMessage.style['position'] = 'relative'
        divMessage.style['margin-left'] = '38%'
    }
}

/** Передача сообщений в чат и присвоение стороны отправки */
function socketMessage(message, role) {

    /** Создание блока сообщения */
    var divMessage = document.createElement('div')
    divMessage.innerHTML = message

    /** Настройка вида отправленного сообщения */
    displayMessage(role, divMessage)

    /** Отправка сообщений в чат */
    document.getElementById('chatField').appendChild(divMessage)
    document.getElementById('chatField').scrollTop = document.getElementById('chatField').scrollHeight
}

/** Задача действия кнопке отправки сообщения */
const sendButton = document.getElementById("field");
const sendButtonPressed = e => {
    const isButton = e.target.nodeName === 'BUTTON';

    if (!isButton) {
        return
    }

    /** Задача отправителя (0 для пользователя, 1 для специалиста) */
    
    
    var role = 0
    if (localStorage.getItem('userId') == null) {
        role = 1
    }

    /** Отправка нового сообщения в БД*/
    var request = new XMLHttpRequest();
    request.open('POST', '/newMessage', true)
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.setRequestHeader("charset", "utf-8");
    request.addEventListener('load', () => {
        document.getElementById('messageContent').value =''
        document.getElementById('chatField').scrollTop = document.getElementById('chatField').scrollHeight
    })
    request.send('messageContent=' + document.getElementById('messageContent').value + '&chatId=' + localStorage.getItem('chatId') +
        '&role=' + role)
}
sendButton.addEventListener("click", sendButtonPressed);

/** При нажатии на детали заказа, показывает блок деталей заказа, скрывает чат*/
document.getElementById('orderDetails').addEventListener('click', (e) => {
    document.getElementById('chatField').style['display'] = 'none'
    document.getElementById('sendMessage').style['display'] = 'none'
    document.getElementById('messageContent').style['display'] = 'none'
    document.getElementById('orderDescriptionField').style['display'] = 'block'
    document.getElementById('orderDescription').style['display'] = 'block'
})

/** Добавляем действие чекбоксу "по договоренности с исполнителем". В случае нажатия
 * блокирует изменение даты заказа
 */
document.getElementById('checkDate').addEventListener('change', (e) => {
    if (e.currentTarget.checked) {
        document.getElementById('dateField').value = ''
        document.getElementById('dateField').disabled = true
    } else {

        /** При повторнорм нажатии снова активирует поле ввода даты */
        document.getElementById('dateField').disabled = false
    }
})

/** Запрос на изменение заказа от пользователя*/
document.getElementById('orderDescription').addEventListener('submit', (e) => {
    e.preventDefault();
    var request = new XMLHttpRequest
    var dateValue = ''
    if (document.getElementById('dateField').disabled == true) {
        dateValue = 'false'
    } else {
        dateValue = document.getElementById('dateField').value
    }
    request.open('POST', '/changeOrder', true)
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.setRequestHeader("charset", "utf-8");
    var dataValue = String('orderId=' + localStorage.getItem('orderId') +
        '&description=' + document.getElementById('descriptionField').value +
        '&distance=' + document.getElementById('checkDistance').checked +
        '&date=' + dateValue)
    request.addEventListener('load', () => {
        if (request.status == 501) {

            /** При сбое на сервере, отправляет ошибку, пояляется надпись ошибки */
            document.getElementById('orderComment').innerHTML = 'Что-то пошло не так, попробуйте снова <br /><br />'
            document.getElementById('orderComment').style['display'] = 'block'
        } else {

            /** При удачном изменении, появляется надпись подтверждения */
            document.getElementById('orderComment').innerHTML = 'Изменения внесены &#10003; <br /><br />'
            document.getElementById('orderComment').style['display'] = 'block'
        }
    })
    request.send(dataValue)
})

/** Кнопка закрытия закзаа, изменяет статус заказа. Возвращает в личный кабинет*/
document.getElementById('closeOrder').addEventListener('click', () => {
    request = new XMLHttpRequest
    request.open('POST', '/changeOrderStatus', true)
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.setRequestHeader("charset", "utf-8");
    request.send('orderId=' + localStorage.getItem('orderId') + '&status=' + false)
    window.location = '/login'
})

/** При возобновлении заказа меняется статус заказа, отправляет в ЛК */
document.getElementById('restartOrder').addEventListener('click', () => {
    request = new XMLHttpRequest
    request.open('POST', '/changeOrderStatus', true)
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.setRequestHeader("charset", "utf-8");
    request.send('orderId=' + localStorage.getItem('orderId') + '&status=' + true)
    window.location = '/login'
});


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
