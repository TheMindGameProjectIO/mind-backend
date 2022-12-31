enum UserRole {
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
    Authorization = "Authorization",
    SocketAuthorization = "Socket-Authorization",
    SOCKET_GAME_AUTHORATION = "Socket-Game-Authorization",
}

const getKeysFromEnum = (enumObject: any) => {
    return Object.keys(enumObject);
};

const getValuesFromEnum = (enumObject: any) => {
    return Object.keys(enumObject)
        .map((key) => enumObject[key]);
};

export { getKeysFromEnum, getValuesFromEnum, Header, UserRole, TokenType, DBCollections };
