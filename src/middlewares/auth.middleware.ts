import jwt from "jsonwebtoken";
import {IAuthPayload} from "@models/payload.model";
import User from "@schemas/user.schema";
import {Request, Response, NextFunction} from "express";
import {UserRole} from "@utils/enum";


const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization');
    if (!token) res.errors.notEnoughPermissions();
    const {_id} = jwt.verify(token, process.env.SECRET_KEY) as IAuthPayload;
    if (!_id) res.errors.notEnoughPermissions();
    User.findById(_id, (err, user) => {
        if (!user) res.errors.notEnoughPermissions();
        req.user = user;
        next();
    });
}

const role = (role: UserRole) => (req: Request, res: Response, next: NextFunction) => {
    if (req.user.role < role) res.errors.notEnoughPermissions();
    next();
}

export {
    authenticate, role
}