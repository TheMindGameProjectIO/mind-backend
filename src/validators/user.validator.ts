import Joi from "joi";

const UserRegister = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.any().valid(Joi.ref('password')).required(),
    nickname: Joi.string().min(3).required(),
});

const UserLogin = Joi.object({
    password: Joi.string().min(6).required(),
    email: Joi.string().email().required(),
});

export {
    UserRegister, UserLogin
};