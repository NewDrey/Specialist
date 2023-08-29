/** ������� ��������� ������ �� ������� � ��������� �������� ����*/

/** ��������� � �������� ������� �� ����������� ������ � ������� ��������� ������������ */
$(document).ready(function () {
    ymaps.ready(function () {
        if (localStorage.getItem('chosen_city_id') == null) {

            /** ��������� ���������� ������������ */
            var geolocation = ymaps.geolocation;

            /** �������� ���� �� ������ ����� � ������ ���������*/
            for (i = 0; i < 48; i++) {
                if (localStorage.getItem('city_ru' + i) == geolocation.city) {
                    localStorage.setItem('chosen_city_id', i)
                } else {
                    localStorage.setItem('chosen_city_id', 0)
                }
            }

        }
        /** ���������� ������ ������ ��������*/
        headerData(localStorage.getItem('chosen_city_id'));
    });
});

/** ������� ���������� ������ ������ � ������� ���� �������� */
const headerData = (id) => {
    localStorage.setItem('chosen_city_id', id)
    $('#tow').html(localStorage.getItem('city_ru' + id) + ' &#9207;');
};

/** ������ �� ������ ������� �������*/
fetch('/cities').then(response => response.json())
    .then(text => {
        /** �� ������ �������� JSON ������ ������� � id ������, ���������, ��������� � �����������
         * ������, ���������� ������������ � ������
         */
        for (var i = 0; i < text.city.length; i++) {
            let li = document.createElement('li');
            let btn = document.createElement('button');

            /** ���������� ����������� ������ �������, ��������� ������ ������� � localStorage*/
            btn.id = i;
            btn.className = 'ui_listButton'
            var city = JSON.stringify(text.city[i].ru).replaceAll('"', '');
            localStorage.setItem('city_ru' + (i), text.city[i]['ru']);
            localStorage.setItem('city_ru_' + (i), text.city[i]['ru2']);
            localStorage.setItem('AOW' + (i), text.city[i]['amountOfWorkers']);

            

            /** ���������� �������� ������ ������� (������ ������ � ���� � �������� ����������) */
            btn.onclick = () => {
                headerData(btn.id);
                document.getElementById('zatemnenie').style['display'] = 'none'
            }

            btn.append(city);
            li.append(btn)
            cityList.append(li);
            
        };

    });

/** ������ ��������  ������ ������ (����� ���������� � ������ �������) */
document.getElementById('tow').onclick = () => {
    document.getElementById('zatemnenie').style['display'] = 'block'
    document.getElementById('cityList').style['display'] = 'block'
};

/** ������� �� ���� ���������� ����� � ��� ��������*/
document.getElementById('zatemnenie').onclick = () => {
    document.getElementById('zatemnenie').style['display'] = 'none'
    document.getElementById('cityList').style['display'] = 'none'
};