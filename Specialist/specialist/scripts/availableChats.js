/** Скрипты для страницы всех чатов для специалиста */

/** Запрос на получения списка всех доступных работнику чатов */
var request = new XMLHttpRequest();
request.open('POST', '/availableChats', true)
request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
request.setRequestHeader("charset", "utf-8");
request.addEventListener('load', async () => {
    for (i in JSON.parse(request.response)) {
        var chatId = "order" + JSON.parse(request.response)[i].id
        orderHeader = document.createElement('h2')
        orderHeader.id = chatId
        orderHeader.className = 'availableOrderHeader'
        await findServiceName(JSON.parse(request.response)[i].Order.ServiceServiceId, orderHeader)
        
        /** Задний фон для каждого чата */
        order = document.createElement('div')
        order.id = chatId
        order.className = 'orderDivUserCabinet'
        
        /** Подпись статуса заказа (открыт/закрыт) */
        var activeStatus = document.createElement('a')
        activeStatus.className = 'commentText';
        activeStatus.id = chatId;
        activeStatus.style['display'] = 'block';
        if (JSON.parse(request.response)[i].Order.isActive == true) {
            activeStatus.innerHTML = 'Заказ Активен';
            activeStatus.style['color'] = 'green';
        } else {
            activeStatus.innerHTML = 'Заказ закрыт';
            activeStatus.style['color'] = 'red';
        }

        /** Переменная показывает есть ли возможность дистанционной работы по заказу */
        var distanceValue = 'Возможна дистаницонная работа'
        if (JSON.parse(request.response)[i].distance == false) {
            distanceValue = ''
        }

        /** Подпись с указанием города заказа */
        orderCity = document.createElement('a')
        orderCity.innerHTML = (JSON.parse(request.response)[i].Order.city + '<br />' + distanceValue)

        order.appendChild(orderHeader)
        order.appendChild(activeStatus)
        order.appendChild(orderCity)
        document.getElementById('listOfOrders').appendChild(order)
    }
})
request.send('workerId=' + localStorage.getItem('workerId'))

/** Функция определяет название услуги для заказа. Выводит значения в список название заказа  */
const findServiceName = async (serviceId, orderHeader) => {
    var requestService = new XMLHttpRequest()
    requestService.open('POST', '/getServiceName', true)
    requestService.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    requestService.setRequestHeader("charset", "utf-8");
    requestService.addEventListener('load', async function () {
        /** Присвоение значения header для блока чатов */
        orderHeader.innerHTML = JSON.parse(requestService.response).serviceName
    });
    requestService.send('serviceId=' + serviceId);
}

/** Функция создающая события клика для перехода в чат из общего списка на странице */
const buttonGroup = document.getElementById("listOfOrders");
const buttonGroupPressed = e => {
    const isDiv = (e.target.nodeName === 'DIV' || e.target.nodeName === 'H2' ||
        e.target.nodeName === 'H3' || e.target.nodeName === 'A');
    if (!isDiv) {
        return
    }
    if (e.target.id == 'listOfOrders') {
        return
    }
    headerId = e.target.id
    localStorage.setItem('chatId', headerId.substr(5));
    window.location = ('/orderChats')
}
buttonGroup.addEventListener("click", buttonGroupPressed);