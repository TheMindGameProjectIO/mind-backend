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
        const prevUser = await User.findByEmail(user.email);
        if (prevUser) {
            if (prevUser.verifiedAt) {
                return res.status(400).send({error: "User already exists"});
            } else {
                await User.deleteOne({_id: prevUser._id}).session(session);
            }
        }
        const userEntity = new User(user);
        await userEntity.save({session});
        await Token.createFromUser(userEntity, TokenType.EmailVerification);
        const token = await userEntity.generateAuthToken();
        res.setHeader('Authorization', token).send(userEntity);
        await session.commitTransaction();
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
    const tokenEntity = await Token.findOne({value: req.params.token});
    if (tokenEntity) {
        await User.updateOne({_id: tokenEntity.userId}, {verifiedAt: getCurrentDate()});
        return res.send({message: "User verified successfully"});
    }
    return res.status(404).send({error: "Token not found"});
}

const passwordResetToken = async (req: Request, res: Response) => {
    res.send({message: "Password reset token sent successfully"});
}

const passwordReset = async (req: Request, res: Response) => {
    res.send({message: "Password reset successfully"});
}

const passwordChange = async (req: Request, res: Response) => {
    res.send({message: "Password changed successfully"});
}

export {
    passwordResetToken,
    passwordChange, 
    passwordReset,
    register,
    verify,
    login,
    me,
}