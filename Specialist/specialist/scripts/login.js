/** Скрипты для страницы авторизации пользователя */


/** Присвоение действия кнопки логина (авторизация пользователя) */
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    let loginForm = document.forms['loginForm'];
    let email = loginForm.elements['email'].value
    let password = loginForm.elements['password'].value

    /** Запрос на аутенфикацию пользователя */
    let user = String("email=" + email + "&password=" + password);
    let request = new XMLHttpRequest();
    request.open('POST', '/login', true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.setRequestHeader("charset", "utf-8");
    request.addEventListener('load', function () {
        if (request.status == 200) {

            /** В случае успеха получаем id пользователя, имя, телефон, вносим всё в localStorage*/
            userData = JSON.parse(request.response)
            localStorage.setItem('userId', userData['userId']);
            localStorage.setItem('userName', request.response['userName']);
            localStorage.setItem('userPhone', request.response['userPhone']);

            /** Переход на домашнюю страницу*/
            window.location.replace('/')
        } else {

            /** В случае ошибки выводим окно ошибки*/
            document.getElementById('errorDarkness').style['display'] = 'block'
        }
    });
    request.send(user);
});

/** Задаем действие блоку затемнения. Закрытие окна ошибки и очистка формы */
document.getElementById('errorDarkness').addEventListener('click', () => {
    document.getElementById('errorDarkness').style['display'] = 'none';
});

/** Задаем действие кнопке в окне ошибки. Закрытие окна и очистка формы */
document.getElementById('closeErrorButton').addEventListener('click', () => {
    document.getElementById('errorDarkness').style['display'] = 'none';
});
    