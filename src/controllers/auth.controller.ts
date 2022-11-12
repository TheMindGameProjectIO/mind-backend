import {Request, Response} from "express";
import {IUserRegister, IUserLogin} from "@models/user.model";
import User, {IUserDocument} from "@schemas/user.schema";
import {startSession} from "mongoose";
import Token, {ITokenDocument} from "@schemas/token.schema";
import {TokenType} from "@utils/enum";
import {getCurrentDate} from "@utils/datetime";


const register = async (req: Request, res: Response) => {
    const user = req.body as IUserRegister;

    const session = await startSession()
    try{
        session.startTransaction();
        const userEntity = new User(user);
        await userEntity.save({session});
        await Token.createFromUser(userEntity, TokenType.EmailVerification);
        await session.commitTransaction();
        res.send(userEntity);
    } catch (err) {
        await session.abortTransaction();
        res.handleDBError(err);
    } finally {
        await session.endSession();
    }
}

const login = async (req: Request, res: Response) => {
    const user = req.body as IUserLogin;
    const userEntity = await User.findByEmail(user.email);
    if (userEntity) {
        const token = await userEntity.generateAuthToken();
        return res.setHeader('Authorization', token).send(userEntity);
    }
    return res.status(401).send({error: "Invalid credentials"})
}

const me = async (req: Request, res: Response) => {
    const user = req.user;
    return res.send(user);
}

const verify = async (req: Request, res: Response) => {
    const tokenEntity = await Token.findByIdWithUser(req.params.token);
    if (tokenEntity) {
        const userEntity = tokenEntity.userId;
        userEntity.verifiedAt = getCurrentDate();
        return res.send({message: "User verified successfully"});
    }
    return res.status(404).send({error: "Token not found"});
}

export {
    register,
    verify,
    login,
    me,
}