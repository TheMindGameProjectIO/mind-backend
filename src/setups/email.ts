import nodemailer from "nodemailer";
import env from "@/utils/env";

const emailTransport = nodemailer.createTransport({
    service: 'mail',
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    secure: env.EMAIL_IS_SECURE,
    auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASSWORD
    }
});

export default emailTransport;