import Joi from "joi";

const UserEmail = Joi.string().email().required();
const UserPassword = Joi.string().min(6).required();

const UserRegister = Joi.object({
    email: UserEmail,
    password: UserPassword,
    nickname: Joi.string().min(3).required(),
});

const UserLogin = Joi.object({
    password: UserPassword,
    email: UserEmail,
});

export {
    UserRegister, UserLogin
};