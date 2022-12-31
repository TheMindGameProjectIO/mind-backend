import jwt from "jsonwebtoken";
import env from "@utils/env";
import { IUser } from "@models/user.model";
import { IAuthPayload, ISocketAuthPayload, ISocketAuthPayloadData } from "@models/payload.model";

export const generateAuthToken = (user: IUser) => {
    const payload: IAuthPayload = { _id: user._id.toString() };
    return jwt.sign(payload, env.SECRET_KEY, { expiresIn: env.TOKEN_AUTH_EXPIRES_IN });
};

export const generateSocketToken = <T extends keyof ISocketAuthPayloadData = any>(type: T, payload: Pick<ISocketAuthPayload<T>, '_id' | 'data'>) => {
    return jwt.sign({...payload, type}, env.SECRET_KEY, { expiresIn: env.TOKEN_SOCKET_EXPIRES_IN });
};

export const verifySocketToken = <T extends keyof ISocketAuthPayloadData = any>(token: string) => {
    return jwt.verify(token, env.SECRET_KEY) as ISocketAuthPayload<T>;
}

export const verifyAuthToken = (token: string) => {
    return jwt.verify(token, env.SECRET_KEY) as IAuthPayload;
};

export const signPayload = <T extends object>(payload: T, expiresIn: number) => {
    return jwt.sign(payload, env.SECRET_KEY, { expiresIn });
}

export const verifyPayload = <T extends object>(token: string) => {
    return jwt.verify(token, env.SECRET_KEY) as T;
}

