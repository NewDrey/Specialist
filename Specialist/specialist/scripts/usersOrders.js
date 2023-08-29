/**Скрипты для страницы со всеми заказами пользователя*/

/** Запрос на поиск всех заказов от пользователя*/
request = new XMLHttpRequest();
request.open('POST', '/findAllOrdersByUser', true)
request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
request.setRequestHeader("charset", "utf-8");

/** Из запроса получаем id заказа, название услуги, тип услуги, id услуги, статус заказа, описание заказа, 
 * статус дистанционной работы, город заказа, id пользователя 
 */
request.addEventListener('load', function () {
    var jsonLength = (Object.keys(JSON.parse(request.response)).length)
    for (i = 0; i < jsonLength; i++) {

        /**Создание блока заднего фона для заказов*/
        var orderDiv = document.createElement('div');
        orderDiv.className = 'orderDivUserCabinet';
        orderDiv.id = 'order' + JSON.parse(request.response)[i].id;

        /** Заголовк с id заказа */
        var orderId = document.createElement('h2');
        orderId.id = 'head1' + JSON.parse(request.response)[i].id;
        orderId.innerHTML = 'Заказ #' + JSON.parse(request.response)[i].id

        /** Текст с названием услуги*/
        var serviceName = document.createElement('h3')
        serviceName.id = 'head2' + JSON.parse(request.response)[i].id
        serviceName.innerHTML = (JSON.parse(request.response)[i].Service.serviceName)

        /** Текст с подтверждением статуса заказа*/
        var activeStatus = document.createElement('a')
        activeStatus.className = 'commentText';
        activeStatus.style['display'] = 'block'
        activeStatus.id = 'label' + JSON.parse(request.response)[i].id
        if (JSON.parse(request.response)[i].isActive == true) {
            activeStatus.innerHTML = 'Заказ Активен'
            activeStatus.style['color'] = 'green'
        } else {
            activeStatus.innerHTML = 'Заказ закрыт'
            activeStatus.style['color'] = 'red'
        }

        orderDiv.appendChild(orderId)
        orderDiv.appendChild(activeStatus)
        orderDiv.appendChild(serviceName)
        document.getElementById('listOfOrders').appendChild(orderDiv)  
    }
})
request.send('userId=' + localStorage.getItem('userId'))

/** Присвоение действия нажатия заказам. Переход на страницу заказа и чатов */
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
    localStorage.setItem('orderId', headerId.substr(5));
    window.location = ('/orderPage')
}
buttonGroup.addEventListener("click", buttonGroupPressed);