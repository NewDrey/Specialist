/** Скрипты для страницы со всеми доступными заказами для специалиста */

/** Запрос на получение информации по доступным работнику заказам */
var request = new XMLHttpRequest();
request.open('POST', '/findAvailableOrders', true)
request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
request.setRequestHeader("charset", "utf-8");

var socket = io();
request.addEventListener('load', function () {

    /**Получаем данные по всем заказам: id заказа, описание, статус дистанционной работы, статус заказа, город, дата создания,
         * дата обновления, id пользователя, email пользователя, телефон пользователя
         */

    if (request.status == 200) {
        for (i in JSON.parse(request.response).dict) {


            /** Создание блока фона для доступных заказов */
            var order = document.createElement('div');
            order.id = "order" + JSON.parse(request.response).dict[i].id;
            order.className = "orderDivUserCabinet";

            /** Присвоение названию блока вида услуги */
            var orderHeader = document.createElement('h2');
            orderHeader.id = "order" + JSON.parse(request.response).dict[i].id;
            orderHeader.className = 'availableOrderHeader';
            orderHeader.innerHTML = JSON.parse(request.response).dict[i].Service.serviceName;

            /** Присвоение возможности дистанционной работы по заказу */
            var distanceValue = 'Возможна дистаницонная работа'
            if (JSON.parse(request.response).dict[i].distance == false) {
                distanceValue = '';
            }

            /** Подпись города исполнения в заказе */
            var orderCity = document.createElement('a');
            orderCity.id = "city_" + JSON.parse(request.response).dict[i].id;
            orderCity.innerHTML = (JSON.parse(request.response).dict[i].city + '<br />' + distanceValue);

            order.appendChild(orderHeader);
            order.appendChild(orderCity);
            document.getElementById('listOfServices').appendChild(order);
        }
    } else {
        console.log('Ошибка')
    }
})
request.send('workerId=' + localStorage.getItem('workerId'))

/** Добавление события кнопкам для открытия подробного описания заказа */
const buttonGroup = document.getElementById("listOfServices");
const buttonGroupPressed = e => {
    const isDiv = (e.target.nodeName === 'H2' || e.target.nodeName === 'A' || e.target.nodeName === 'DIV');

    if (!isDiv) {
        return
    }

    if (e.target.id == 'listOfServices') {
        return
    }

    var headerId = e.target.id;

    /** Показ блока полной информации по заказу */
    document.getElementById('darknessDiv').style.display = 'block';
    document.getElementById('orderExtraInfo').style.display = 'block';
    document.getElementById('extraInfoHeader').innerHTML = document.getElementById(headerId).innerHTML;

    /** Запрос на получение полной информации по заказу */
    var request = new XMLHttpRequest();
    request.open('POST', '/availableOrderDescription', true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.setRequestHeader("charset", "utf-8");
    request.addEventListener('load', function () {
        if (request.status == 200) {
            /** Приходят: id заказа, описание, статус дистанционной работы, статус заказа, город, дата создания,
             * дата обновления, id пользователя, id услуги, название услуги, id вида услуги
             */
            responseValue = JSON.parse(request.response);
            localStorage.setItem('userOrder', responseValue.UserUserId)


            /** Внесение данных в подробное описание заказа*/
            document.getElementById('extraInfoHeader').innerHTML = responseValue.Service.serviceName;
            document.getElementById('availableOrderDescription').innerHTML = responseValue.description;
            document.getElementById('dateField').disabled = true;
            document.getElementById('checkDate').disabled = true;
            document.getElementById('checkDistance').checked = responseValue.distance;
            document.getElementById('checkDistance').disabled = true;

            if (responseValue.date == 'false') {
                document.getElementById('dateField').value = '';
                document.getElementById('checkDate').checked = true;
            } else {
                document.getElementById('dateField').value = responseValue.date;;
                document.getElementById('checkDate').checked = false;

            }
        } else {
            console.log('Ошибка')
        }
    });
    /** Добавление в localStorage номера заказа */
    localStorage.setItem('orderId', headerId.substr(5));

    request.send('orderId=' + headerId.substr(5))

}
buttonGroup.addEventListener("click", buttonGroupPressed);

/** Присвоения события клика для закрытия окна подробного писания заказа*/
document.getElementById('darknessDiv').addEventListener('click', function () {
    document.getElementById('darknessDiv').style.display = 'none'
    document.getElementById('orderExtraInfo').style.display = 'none'
})

/** Запрос данных при нажатии на кнопку перехода в чат */
document.getElementById('sendMessage').addEventListener('click', async () => {
    var request = new XMLHttpRequest();
    request.open('POST', '/orderChats', true)
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.setRequestHeader("charset", "utf-8");
    request.addEventListener('load', function () {

        /** Получение данных: id заказа, id пользователя, имя пользователя, email пользователя,
         * пароль пользователя, телефон пользователя, id работника, id чата, дата создания чата,
         * дата обновления чата
         */
        var answer = JSON.parse(request.response);
        socket.emit('leave', localStorage.getItem('chatId'));
        localStorage.setItem('chatId', answer.id);
        localStorage.setItem('chatName', document.getElementById('extraInfoHeader').innerHTML);
        
        /** Кнопка для перехода в чат с пользоватлем */
        window.location = '/orderChats'
    });
    var body = String('workerId=' + localStorage.getItem('workerId') + '&userId=' + localStorage.getItem('userOrder') + '&orderId=' + localStorage.getItem('orderId'));
    request.send(body)
});










