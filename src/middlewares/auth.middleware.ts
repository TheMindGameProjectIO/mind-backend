import jwt from "jsonwebtoken";
import {IAuthPayload} from "@models/payload.model";
import User from "@schemas/user.schema";
import {Request, Response, NextFunction} from "express";
import {UserRole} from "@utils/enum";


const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization');
    if (!token) return res.errors.notAuthorized();
    let payload: IAuthPayload;
    try{
        payload = jwt.verify(token, process.env.SECRET_KEY) as IAuthPayload;
    } catch (error) {
        payload = {} as IAuthPayload;
    }
    const {_id} = payload;
    if (!_id) return res.errors.notAuthorized();
    const user = await User.findById(_id).catch(() => null);
    if (!user) return res.errors.notAuthorized();
    req.user = user;
    next();
}

const role = (role: UserRole) => (req: Request, res: Response, next: NextFunction) => {
    if (req.user.role < role)
        return res.errors.notEnoughPermissions();
    next();
}

export {
    authenticate, role
}