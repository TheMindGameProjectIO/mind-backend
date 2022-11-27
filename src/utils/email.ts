import { emailTransport } from "@/setups";
import env from "@utils/env";


const sendEmail = async (recipient: string, html: string, subject: string) => {

    emailTransport.sendMail(
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