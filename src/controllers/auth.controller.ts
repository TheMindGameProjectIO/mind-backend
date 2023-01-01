import { Request, Response } from "express";
import { IUserRegister, IUserLogin } from "@models/user.model";
import User from "@schemas/user.schema";
import { startSession } from "mongoose";
import Token from "@schemas/token.schema";
import { Header, ISocketAuthType, TokenType } from "@utils/enum";
import { getCurrentDate } from "@utils/datetime";
import { generateSocketToken } from "@/utils/token";
import socketHandler from "@/socket";

const register = async (req: Request, res: Response) => {
    const user = req.body as IUserRegister;

    const session = await startSession();
    try {
        session.startTransaction();
        const prevUser = await User.findByEmail(user.email);
        if (prevUser) {
            if (prevUser.verifiedAt) {
                return res.status(400).send({ error: "User already exists" });
            } else {
                await User.deleteOne({ _id: prevUser._id }).session(session);
                await Token.deleteOne({ userId: prevUser._id }).session(session);
            }
        }
        const userEntity = new User(user);
        await userEntity.save({ session });
        await Token.createFromUser(userEntity, TokenType.EMAIL_VERIFICATION);
        const token = userEntity.generateAuthToken();
        res.setHeader(Header.AUTHORIZATION, token).send(userEntity);
        await session.commitTransaction();
    } catch (err) {
        await session.abortTransaction();
        res.handleDBError(err);
    } finally {
        await session.endSession();
    }
};

const login = async (req: Request<{}, {}, IUserLogin>, res: Response) => {
    const { email, password } = req.body as IUserLogin;
    const userEntity = await User.findByEmail(email);
    if (!userEntity) return res.status(404).send({ error: "Invalid email or password" });
    if (!userEntity.verifiedAt) return res.status(400).send({ error: "User is not verified" });
    if (!userEntity.checkPassword(password)) return res.status(400).send({ error: "Invalid email or password" });

    const token = userEntity.generateAuthToken();
    return res.setHeader(Header.AUTHORIZATION, token).send(userEntity);
};

const me = async (req: Request, res: Response) => {
    const user = req.user;
    return res.send(user);
};

const verify = async (req: Request, res: Response) => {
    const tokenEntity = await Token.findOne({ value: req.params.token });
    if (tokenEntity) {
        await User.updateOne({ _id: tokenEntity.userId }, { verifiedAt: getCurrentDate() });
        return res.send({ message: "User verified successfully" });
    }
    return res.status(404).send({ error: "Token not found" });
};

const passwordResetToken = async (req: Request<{}, {}, { email: string }>, res: Response) => {
    const email = req.body.email;
    const userEntity = await User.findByEmail(email);
    if (!userEntity) return res.status(404).send({ error: "User not found" });
    await Token.deleteOne({ userId: userEntity._id, type: TokenType.RESET_PASSWORD });
    await Token.createFromUser(userEntity, TokenType.RESET_PASSWORD);
    const token = generateSocketToken(ISocketAuthType.RESET_PASSWORD, { _id: req.session.id, data: null });
    res.setHeader(Header.SOCKET_AUTHORIZATION, token).send({ message: "Password reset token sent on your email" });
};

export const passwordResetVerify = async (req: Request<{ token: string }>, res: Response) => {
    const token = req.params.token as string;
    const tokenEntity = await Token.findOne({ value: token });
    console.log({ tokenEntity });
    if (!tokenEntity) return res.status(404).send({ error: "Token not found" });
    await tokenEntity.verify();

    socketHandler.emitTo(req.session.id, "auth:verified:password:reset", { token });

    res.send({ message: "Password can be reset" });
};

const passwordReset = async (req: Request<{}, {}, { token: string; password: string }>, res: Response) => {
    const { token, password } = req.body;

    const tokenEntity = await Token.findOne({ value: token });
    if (!tokenEntity) return res.status(404).send({ error: "Token not found" });
    if (tokenEntity.type !== TokenType.RESET_PASSWORD) return res.status(400).send({ error: "Invalid token" });
    if (tokenEntity.expiresAt < getCurrentDate()) return res.status(400).send({ error: "Token has expired" });
    if (!tokenEntity.verifiedAt) return res.status(400).send({ error: "Token is not verified" });

    await User.changePassword({ _id: tokenEntity.userId }, password);

    res.send({ message: "Password reset successfully" });
};

const passwordChange = async (req: Request, res: Response) => {
    res.send({ message: "Password changed successfully" });
};

const test = async (req: Request, res: Response) => {
    req.session.id;
    res.send({ message: "Test", id: req.session.id });
};

const test1 = async (req: Request, res: Response) => {
    req.session.id;
    res.send({ message: "Salam Javid Muellim", });
};

export { test1, passwordResetToken, passwordChange, passwordReset, register, verify, login, test, me };
