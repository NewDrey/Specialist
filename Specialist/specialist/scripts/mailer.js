import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp.mail.ru',
    port: 465,
    secure: true,
    auth: {
        user: 'Specialist_am@list.ru',
        pass: 't0T1e54P7YiycHJvRhaj'
    }
});

export const mailer = (emailReg) => {
    const message = {
        from: 'Check <Specialist_am@list.ru>',
        to: emailReg,
        subject: 'registration',
        text: 'Проверка'

    };
    transporter.sendMail(message, (err, info) => {
        if (err) return console.log(err)
        console.log('Email sent: ', info)
    });
};

