import env from "@utils/env";
import Queue from "bull";
import {sendEmail as sendEmailUtil} from "@utils/email";

const send_email_queue = new Queue('email sending', env.REDIS_DB_URL);

send_email_queue.process(async (job, done) => {
    const {email, html, subject} = job.data;
    await sendEmailUtil(email, html, subject);
    done();
});

const sendEmail = async (data: {email: string, html: string, subject: string}) => {
    await send_email_queue.add(data);
}

export {
    sendEmail
};