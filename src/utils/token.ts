import jwt from "jsonwebtoken";
import env from "@utils/env";
import { IUser } from "@models/user.model";
import { IAuthPayload, ISocketAuthPayload } from "@models/payload.model";

export const generateAuthToken = (user: IUser) => {
    const payload: IAuthPayload = { _id: user._id.toString() };
    return jwt.sign(payload, env.SECRET_KEY, { expiresIn: env.TOKEN_AUTH_EXPIRES_IN });
};

// const generatePermissonToken = (user: IUser, permissions: Permission[]) => {
//     const payload: IRestPayload = { _id: user._id.toString(), permissions };
//     return jwt.sign(payload, env.SECRET_KEY, { expiresIn: env.TOKEN_PERMISSION_EXPIRES_IN });
// }

export const generateSocketToken = (payload: ISocketAuthPayload) => {
    return jwt.sign(payload, env.SECRET_KEY, { expiresIn: env.TOKEN_SOCKET_EXPIRES_IN });
};

export const verifyAuthToken = (token: string) => {
    return jwt.verify(token, env.SECRET_KEY) as IAuthPayload;
};

export const signPayload = <T extends object>(payload: T, expiresIn: number) => {
    return jwt.sign(payload, env.SECRET_KEY, { expiresIn });
}

export const verifyPayload = <T extends object>(token: string) => {
    return jwt.verify(token, env.SECRET_KEY) as T;
}

