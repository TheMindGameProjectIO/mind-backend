import { Request, RequestHandler } from 'express';
import { IContactUsForm } from '@/models/general.model';
import { sendEmail } from '@queues/email.queue';
import { render } from '@/utils/html';
import env from '@/utils/env';

export const contactus: RequestHandler = async (req: Request<{}, {}, IContactUsForm>, res) => {
    const { firstname, lastname, email, message } = req.body;
    const formItself = await render('contactus_form', { firstname, lastname, email, message });
    const formSuccess = await render('contactus_form_submitted_successfully', {})
    await sendEmail({email, html: formSuccess, subject: 'Contact Us Form'});
    await sendEmail({email: env.EMAIL_USER, html: formItself, subject: 'Contact Us Form'});
    res.send({message: "Contact us form submitted successfully"});
}
