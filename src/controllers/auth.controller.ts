import {Request, Response} from "express";
import {IUserRegister, IUserLogin} from "@models/user.model";
import User from "@schemas/user.schema";


const register = async (req: Request, res: Response) => {
    const user = req.body as IUserRegister;
    const userEntity = new User(user);
    await userEntity.save((err, user) => {
        err ? res.handleDBError(err) : res.status(201).send(user);
    })
}

const login = async (req: Request, res: Response) => {
    const user = req.body as IUserLogin;
    const userEntity = await User.findByEmail(user.email);
    if (userEntity) {
        const token = await userEntity.generateAuthToken();
        return res.setHeader('Authorization', token).send(userEntity.toJSON());
    }
    return res.status(401).send({error: "Invalid credentials"})
}

const me = async (req: Request, res: Response) => {
    const user = req.user;
    return res.send(user);
}

const verify = async (req: Request, res: Response) => {
    const user = req.user;
    user.verifiedAt = new Date();
    await user.save();
    return res.send(user);
}

export {
    register,
    verify,
    login,
    me,
}