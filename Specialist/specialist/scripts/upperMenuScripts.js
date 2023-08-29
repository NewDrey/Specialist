/** Скрипты верхнего меню */

/** Если авторизирован пользователь, убирает кнопки специалиста*/
if (localStorage.getItem('userId') != null) {
	document.getElementById('loginButton').textContent = 'Личный кабинет'
	document.getElementById('regButton').style['display'] = 'none';
	document.getElementById('specialistChoiceButton').style['display'] = 'none';
};

/** Если авторизирован специалист, убирает кнопки пользователя*/
if (localStorage.getItem('workerId') != null) {
	document.getElementById('specialistButton').style['display'] = 'none';
	document.getElementById('loginButton').style['display'] = 'none'
	document.getElementById('regButton').style['display'] = 'none'
	document.getElementById('specialistCabinetButton').style['display'] = 'block';
};

/** Кнопка логина пользователя*/
document.getElementById('specialistCabinetButton').addEventListener('click', () => {
	window.location.replace('/workers_log')
});

/** Выпадающий список действий специалиста - появление */
document.getElementById('specialistButton').onpointerover = () => {
	document.getElementById('specialistChoice').style['visibility'] = 'visible'
};

/** Выпадающий список действий специалиста - исчезание */
document.getElementById('specialistButton').onpointerout = () => {
	document.getElementById('specialistChoice').style['visibility'] = 'hidden'
};
