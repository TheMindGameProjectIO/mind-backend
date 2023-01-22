export enum UserRole {
    Guest = 0,
    User = 1,
    Admin = 2,
}

export type HbsTemplate = "email_verification" | "password_reset" | "contactus_form_submitted_successfully" | "contactus_form"

enum DBCollections {
    User = "users",
    Token = "tokens",
    Room = "rooms",
}

enum TokenType {
    EMAIL_VERIFICATION = 0,
    RESET_PASSWORD = 1,
}

export enum ISocketAuthType {
    RESET_PASSWORD = 'reset-password',
    VERIFY_EMAIL = 'verify-email',
    GAME = 'game',
}

enum Header {
    AUTHORIZATION = "authorization",
    SOCKET_AUTHORIZATION = "socket-authorization",
    SOCKET_GAME_AUTHORIZATION = "socket-game-authorization",
}

const getKeysFromEnum = (enumObject: any) => {
    return Object.keys(enumObject);
};

const getValuesFromEnum = (enumObject: any) => {
    return Object.keys(enumObject)
        .map((key) => enumObject[key]);
};

export { getKeysFromEnum, getValuesFromEnum, Header, TokenType, DBCollections };
