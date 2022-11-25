enum UserRole {
    Guest = 0,
    User = 1,
    Admin = 2,
}

enum DBCollections {
    User = 'users',
    Token = 'tokens',
}

enum TokenType {
    EmailVerification = 0,
    PasswordReset = 1,
}

enum Header {
    Authorization = 'Authorization',
}

type Permission = 'auth:password:reset'

const getKeysFromEnum = (enumObject: any) => {
    return Object.keys(enumObject).filter(key => typeof enumObject[key] === 'number');
}

const getValuesFromEnum = (enumObject: any) => {
    return Object.keys(enumObject).filter(key => typeof enumObject[key] === 'number').map(key => enumObject[key]);
}

export {
    getKeysFromEnum,
    getValuesFromEnum,
    Header,
    UserRole,
    TokenType,
    Permission,
    DBCollections,
}