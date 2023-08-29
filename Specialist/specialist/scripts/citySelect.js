/** —крипты получени€ данным по городам и изменени€ верхнего меню*/

/** ќбращение к внешнему скрипту на определение города в котором находитс€ пользователь */
$(document).ready(function () {
    ymaps.ready(function () {
        if (localStorage.getItem('chosen_city_id') == null) {

            /** ѕолучение геолокации пользовател€ */
            var geolocation = ymaps.geolocation;

            /** ѕроверка есть ли данный город в спивке доступных*/
            for (i = 0; i < 48; i++) {
                if (localStorage.getItem('city_ru' + i) == geolocation.city) {
                    localStorage.setItem('chosen_city_id', i)
                } else {
                    localStorage.setItem('chosen_city_id', 0)
                }
            }

        }
        /** ѕрисвоение кнопке города значени€*/
        headerData(localStorage.getItem('chosen_city_id'));
    });
});

/** ‘ункци€ присвоени€ кнопке города в верхнем меню значени€ */
const headerData = (id) => {
    localStorage.setItem('chosen_city_id', id)
    $('#tow').html(localStorage.getItem('city_ru' + id) + ' &#9207;');
};

/** «апрос на список городов јрмении*/
fetch('/cities').then(response => response.json())
    .then(text => {
        /** Ќа выходе получаем JSON список городов с id города, названием, названием в родительном
         * падеже, количество специалиство в городе
         */
        for (var i = 0; i < text.city.length; i++) {
            let li = document.createElement('li');
            let btn = document.createElement('button');

            /** Ќаполнение выпадающего списка городов, помещение данных запроса в localStorage*/
            btn.id = i;
            btn.className = 'ui_listButton'
            var city = JSON.stringify(text.city[i].ru).replaceAll('"', '');
            localStorage.setItem('city_ru' + (i), text.city[i]['ru']);
            localStorage.setItem('city_ru_' + (i), text.city[i]['ru2']);
            localStorage.setItem('AOW' + (i), text.city[i]['amountOfWorkers']);

            

            /** ƒобавление действи€ списку городов (замена города в меню и закрытие затемнени€) */
            btn.onclick = () => {
                headerData(btn.id);
                document.getElementById('zatemnenie').style['display'] = 'none'
            }

            btn.append(city);
            li.append(btn)
            cityList.append(li);
            
        };

    });

/** «адача действи€  кнопке города (вызов затемнени€ и списка городов) */
document.getElementById('tow').onclick = () => {
    document.getElementById('zatemnenie').style['display'] = 'block'
    document.getElementById('cityList').style['display'] = 'block'
};

/** Ќажатие на блок затемнени€ ведет к его закрытию*/
document.getElementById('zatemnenie').onclick = () => {
    document.getElementById('zatemnenie').style['display'] = 'none'
    document.getElementById('cityList').style['display'] = 'none'
};