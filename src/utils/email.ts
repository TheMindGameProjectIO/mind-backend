import env from "@utils/env";
import nodemailer from "nodemailer"

const sendEmail = async (recipient: string, html: string, subject: string) => {

    nodemailer.createTransport({
        service: 'mail',
        host: env.EMAIL_HOST,
        port: env.EMAIL_PORT,
        secure: env.EMAIL_IS_SECURE,
        auth: {
            user: env.EMAIL_USER,
            pass: env.EMAIL_PASSWORD
        }
    })
        .sendMail(
            {
                from: env.EMAIL_USER,
                to: recipient,
                subject,
                html,
                attachments: [],
            },
            (error, info) => {
                if (error) {
                    console.log({error});
                } else {
                    console.log('Email sent: ' + info.response);
                }
            })
}

export {
    sendEmail
}