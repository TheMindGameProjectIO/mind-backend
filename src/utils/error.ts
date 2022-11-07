import {Response} from "express";

const handleDBError = (error, response: Response) => {
    let message: string, status_code: number;
    if (error.code === 11000) {
        console.log(error.keyValue)
        const errors = Object.keys(error.keyValue);
        message = `${errors} already exist${errors.length > 1 ? 's' : ''}`;
        status_code = 409;
    }
    return { message, status_code };
}

export {
    handleDBError
}
