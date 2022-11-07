interface IUser {
    entityId: string;
    email: string;
    password: string;
    nickname: string;
}


interface IUserRegister {
    email: string;
    password: string;
    nickname: string;
}

interface IUserLogin {
    password: string;
    email: string;
}

export {
    IUserRegister, IUserLogin, IUser
}