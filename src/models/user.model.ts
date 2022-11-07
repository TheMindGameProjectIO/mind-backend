import {Types} from "mongoose";

interface IUser {
    _id: Types.ObjectId | string;
    nickname: string;
    email: string;
    password: string;
    verifiedAt: Date;
    role: number;
}

interface IUserRegister {
    email: string;
    password: string;
    nickname: string;
}

interface IUserLogin {
    password: string;
    email: string;
}

export {
    IUserRegister, IUserLogin, IUser
}