import env from "@utils/env";
import Queue from "bull";
import {sendEmail as sendEmailUtil} from "@utils/email";

const send_email_queue = new Queue('email sending', env.REDIS_DB_URL);

send_email_queue.process(async (job, done) => {
    const {email, html} = job.data;
    await sendEmailUtil(email, html);
    done();
});

const sendEmail = async (data: {email: Email, html: Html}) => {
    await send_email_queue.add(data);
}

export {
    sendEmail
};