import Joi from "joi";

export const ContactUsForm = Joi.object({
    email: Joi.string().email(),
    firstname: Joi.string().min(3).required(),
    lastname: Joi.string().min(3).required(),
    message: Joi.string().min(3).required(),
});
