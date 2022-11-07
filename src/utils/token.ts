import jwt from "jsonwebtoken";
import env from "@utils/env";
import {IUser} from "@models/user.model";
import {IAuthPayload} from "@models/payload.model";

const generateAuthToken = async (user: IUser) => {
    const payload: IAuthPayload = {_id: user._id.toString()};
    return jwt.sign(payload, env.SECRET_KEY, {expiresIn: env.TOKEN_AUTH_EXPIRES_IN});
}

const verifyAuthToken = async (token: string) => {
    return jwt.verify(token, env.SECRET_KEY) as IAuthPayload;
}

export {
    generateAuthToken, verifyAuthToken
}