import {IUserDocument} from "@schemas/user.schema";

export {}

type ErrorHandlerFunction = (message?: string) => void

declare global {
    namespace Express {
        export interface Request {
            user?: IUserDocument
        }
        export interface Response {
            handleDBError?: (err: any) => void;
            errors: {
                notEnoughPermissions?: ErrorHandlerFunction
            }
        }
    }
}