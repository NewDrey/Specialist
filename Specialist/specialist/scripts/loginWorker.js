/** Скрипты для страницы ваторизации специалисьа */

/** Присвоение действия кнопки логина (авторизация специлиста) */
document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    /** Получение данных формы авторизации специлиста */
    let loginForm = document.forms['loginForm'];
    let email = document.getElementById('email').value
    let password = document.getElementById('password').value

    /** Запрос на аутенфикацию специлиста */
    let worker = String("email=" + email + "&password=" + password);
    let request = new XMLHttpRequest();
    request.open('POST', '/workers_log', true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.setRequestHeader("charset", "utf-8");
    request.addEventListener('load', function () {
        if (request.status == 200) {

            /** В случае успеха получаем id пользователя, имя, телефон, вносим всё в localStorage*/
            workerData = JSON.parse(request.response)
            localStorage.setItem('workerId', workerData['workerId']);
            localStorage.setItem('workerName', request.response['workerName']);
            localStorage.setItem('workerPhone', request.response['workerPhone']);
            window.location.replace('/')
        } else {

            /** В случае ошибки выводим окно ошибки*/
            document.getElementById('errorDarkness').style['display'] = 'block'
        }
    })
    request.send(worker)
})

/** Задаем действие блоку затемнения. Закрытие окна ошибки и очистка формы */
document.getElementById('errorDarkness').addEventListener('click', () => {
    document.getElementById('errorDarkness').style['display'] = 'none';
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
})

/** Задаем действие кнопке в окне ошибки. Закрытие окна и очистка формы */
document.getElementById('closeErrorButton').addEventListener('click', () => {
    document.getElementById('errorDarkness').style['display'] = 'none';
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
})
