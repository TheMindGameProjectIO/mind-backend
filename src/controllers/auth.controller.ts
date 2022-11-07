import {Request, Response} from "express";
import {IUserRegister, IUserLogin} from "@models/user.model";
import userRepository, {User} from "@schemas/user.schema";


const register = async (req: Request, res: Response) => {
    const user = req.body as IUserRegister;
    const userEntity = await User.create(user);
    await userRepository.save(userEntity);
    res.send(req.body)
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

}

export {
    register,
    login
}