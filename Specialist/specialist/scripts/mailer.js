async function check() {
    const nodemailer = require('nodemailer');
    const directTransport = require('nodemailer-direct-transport');
    const fromHost = `bk.ru`;
    const from = 'andrew_shapov' + '@' + fromHost; //придумываете свою почту(может быть несуществующая)
    const to = 'andrewoxfordshapov@gmail.com';
    const transport = nodemailer.createTransport(directTransport({
        host: "bk.ru",
        port: 465,
        secure: true,
        auth: {
            // TODO: replace `user` and `pass` values from <https://forwardemail.net>
            user: 'andrew_shapov@bk.ru',
            pass: 'Saimon676'
        }

    }));
   await transport.sendMail({
        from: 'andrew_shapov@bk.ru',
        to,
        subject: 'Заголовок письма',
        html: `
         <h1>Ваше письмо</h1>
        `
   }, (err, data) => {
        console.log(data)
        if (err) {
            console.error('Ошибка при отправке:', err);
        } else {
            console.log('Письмо отправлено');
            return
        }
    });
}
check()