import {NextFunction, Request, Response} from "express";

const errorHandler = (error, request: Request, response: Response) => {
    console.log(`error ${error.message}`) // log the error
    const status = error.status || 400
    response.status(status).send(error.message)
}

const injectErrorDBHandlerToResponse = (request: Request, response: Response, next: NextFunction) => {
    response.handleDBError = (error) => {
        let message: string, status_code: number;
        if (error.code === 11000) {
            const errors = Object.keys(error.keyValue);
            message = `${errors} already exist${errors.length > 1 ? 's' : ''}`;
            status_code = 409;
        }
        return response.status(status_code).send({message});
    }
    next()
}

const injectDefaultErrors = (request: Request, response: Response, next: NextFunction) => {
    response.errors = {
        notEnoughPermissions: (message) => {
            response.status(401).send({error: message || "You are not authorized to access this resource"})
        },
    }
    next()
}

export {errorHandler, injectErrorDBHandlerToResponse, injectDefaultErrors};