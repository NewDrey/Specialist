/** Скрипты чата для  специалиста */

/** Присвоение имени собеседника чату */
document.getElementById('orderH1').innerHTML = localStorage.getItem('chatName')
document.getElementById('orderH1').style['margin-left'] = '3%'

/** Открытие вебсокета и присвоение ему действий*/
var socket = io();
socket.on('message', socketMessage)
socket.emit('create', localStorage.getItem('chatId'));

/** Запрос на все прошлые сообщения в чате*/
function getMessages() {
    var request = new XMLHttpRequest();
    request.open('POST', '/findMassages', true)
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.setRequestHeader("charset", "utf-8")
    request.addEventListener('load', () => {

        /** Добавление сообщений в чат. Из запроса получаем id сообщения,
         * содержание, дата создания, дата изменения, id чата
         */
        addMessages(JSON.parse(request.response));
    });
    request.send('chatId=' + localStorage.getItem('chatId'));
}


/** Передача сообщений в чат и присвоение стороны отправки */
function socketMessage(message, role) {

    /** Создание блока сообщения */
    var divMessage = document.createElement('div');
    divMessage.innerHTML = message;

    /** Настройка вида отправленного сообщения */
    displayMessage(role, divMessage);

    /** Отправка сообщений в чат */
    document.getElementById('chatArea').appendChild(divMessage)
    document.getElementById('chatArea').scrollTop = document.getElementById('chatArea').scrollHeight
    
}

/** Выгрузка сообщений из базы данных */
function addMessages(message) {
    for (i in message) {

        /** Создание блока сообщения */
        var divMessage = document.createElement('div')
        divMessage.innerHTML = message[i].content

        /** Присвоение стороны отправки сообщению */
        var role = message[i].role

        /** Настройка вида отправленного сообщения */
        displayMessage(role, divMessage)

        /** Отправка сообщения в чат */
        document.getElementById('chatArea').appendChild(divMessage)
    }
    document.getElementById('chatArea').scrollTop = document.getElementById('chatArea').scrollHeight
}

/** Настройка вида отправленного сообщения */
const displayMessage = (role, divMessage) => {

    /** Присвоение размеров и стороны положения сообщения в зависимости от роли */
    if (role == 1 && localStorage.getItem('uesrId') == null) {
        divMessage.style['background-color'] = 'background-color: rgba(102, 102, 102, 0.15)'
        divMessage.style['max-width'] = '55%'
        divMessage.style['position'] = 'relative'
        divMessage.style['margin-left'] = '38%'
    } if (role == 0 && localStorage.getItem('uesrId') == null) {
        divMessage.style['max-width'] = '55%'
        divMessage.style['margin-left'] = '-3%'
    } if (role == 0 && localStorage.getItem('uesrId') != null) {
        divMessage.style['background-color'] = 'background-color: rgba(102, 102, 102, 0.15)'
        divMessage.style['max-width'] = '55%'
        divMessage.style['position'] = 'relative'
        divMessage.style['margin-left'] = '38%'
    } if (role == 1 && localStorage.getItem('uesrId') != null) {
        divMessage.style['max-width'] = '55%';
        divMessage.style['margin-left'] = '-3%';
    }
}


/** Задача действия кнопке отправки сообщения */
document.getElementById('sendMessage').addEventListener('click', () => {
    var request = new XMLHttpRequest();
    /** Задача отправителя (0 для пользователя, 1 для специалиста) */
    var role = 0
    if (localStorage.getItem('userId') == null) {
        role = 1
    }

    /** Отправка нового сообщения в БД*/
    request.open('POST', '/newMessage', true)
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.setRequestHeader("charset", "utf-8");
    request.addEventListener('load', () => {
        document.getElementById('messageContent').value = ''
        document.getElementById('chatArea').scrollTop = document.getElementById('chatArea').scrollHeight
    })
    request.send('messageContent=' + document.getElementById('messageContent').value + '&chatId=' + localStorage.getItem('chatId') +
        '&role=' + role)
});

document.getElementById('backButton').addEventListener('click',() => {
    socket.emit('leave', localStorage.getItem('chatId'))
    window.history.back()
})

/** Получение всех прошлых сообщений */
getMessages();
