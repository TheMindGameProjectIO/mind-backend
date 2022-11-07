import CryptoJS from "crypto-js";

const hashPassword = (password: string): string => {
    return CryptoJS.SHA256(password).toString();
}

const comparePassword = (password: string, hash: string): boolean => {
    return hashPassword(password) === hash;
}

export {
    hashPassword,
    comparePassword,
}