/** ����������� ������ ������������*/

/** ������ ����������� ���������� ������ �� ����������� ������������ */
document.getElementById('regUser').addEventListener('submit', function (e) {
    e.preventDefault();

    /** ��������� ������ ����� */
    let email = document.getElementById('email').value
    let password = document.getElementById('password').value

    let user = String("email=" + email + "&password=" + password);
    let request = new XMLHttpRequest();
    request.open('POST', '/reg', true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.setRequestHeader("charset", "utf-8");
    request.addEventListener('load', function () {
        if (request.status == 200) {

            /** ��� ������� ������������ ���������� �� �������� �������� */
            window.location = '/'
        } else {

            /** ��� ������ ��������� ���� � ������� */
            document.getElementById('errorDarkness').style['display'] = 'block'
        }
    })
    request.send(user)
})

/** ��� ������� �� ���� ����������, ������� �����, ��������� ���� ������ */
document.getElementById('errorDarkness').addEventListener('click', () => {
    document.getElementById('errorDarkness').style['display'] = 'none';
});

/** ��� ������� �� ������ � ���� ������, ��������� ����, ������� ����� */
document.getElementById('closeErrorButton').addEventListener('click', () => {
    document.getElementById('errorDarkness').style['display'] = 'none';
})