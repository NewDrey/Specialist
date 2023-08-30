import nodemailer from 'nodemailer';
import crypto from 'crypto';

import { Sequelize } from 'sequelize';


const transporter = nodemailer.createTransport({
    host: 'smtp.mail.ru',
    port: 465,
    secure: true,
    auth: {
        user: 'Specialist_am@list.ru',
        pass: 't0T1e54P7YiycHJvRhaj'
    }
});

export const mailerUser = (emailReg, code) => {
    const message = {
        from: 'Check <Specialist_am@list.ru>',
        to: emailReg,
        subject: 'registration',
        text: 'http://localhost:1337/confirmationUser/' + code

    };
    transporter.sendMail(message, (err, info) => {
        if (err) return console.log(err)
        console.log('Email sent: ', info)
    });
};

export const mailerWorker = (emailReg, code) => {
    const message = {
        from: 'Check <Specialist_am@list.ru>',
        to: emailReg,
        subject: 'registration',
        text: 'http://localhost:1337/confirmationWorker/' + code

    };
    transporter.sendMail(message, (err, info) => {
        if (err) return console.log(err)
        console.log('Email sent: ', info)
    });
};

