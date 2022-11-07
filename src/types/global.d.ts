import {IUser} from "@models/user.model";

export {}

type ErrorHandlerFunction = (message?: string) => void

declare global {
    namespace Express {
        export interface Request {
            user?: IUser
        }
        export interface Response {
            handleDBError?: (err: any) => void;
            errors: {
                notEnoughPermissions?: ErrorHandlerFunction
            }
        }
    }
}