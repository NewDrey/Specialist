/** Регистрация нового пользователя*/

/** Кнопка регистрации отправляет запрос на авторизацию пользователя */
document.getElementById('regUser').addEventListener('submit', function (e) {
    e.preventDefault();

    /** Получение данных формы */
    let email = document.getElementById('email').value
    let password = document.getElementById('password').value

    let user = String("email=" + email + "&password=" + password);
    let request = new XMLHttpRequest();
    request.open('POST', '/reg', true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.setRequestHeader("charset", "utf-8");
    request.addEventListener('load', function () {
        if (request.status == 200) {

            /** При удачной аутенфикации возвращает на домашнюю страницу */
            window.location = '/'
        } else {

            /** При ошибке открывает окно с ошибкой */
            document.getElementById('errorDarkness').style['display'] = 'block'
        }
    })
    request.send(user)
})

/** При нажатии на блок затемнения, очищает форму, закрывает окно ошибки */
document.getElementById('errorDarkness').addEventListener('click', () => {
    document.getElementById('errorDarkness').style['display'] = 'none';
});

/** При нажатии на кнопку в окне ошибки, закрывает окно, очищает форму */
document.getElementById('closeErrorButton').addEventListener('click', () => {
    document.getElementById('errorDarkness').style['display'] = 'none';
})