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
    EmailVerification = 0,
    PasswordReset = 1,
}

enum Header {
    Authorization = "Authorization",
    SocketAuthorization = "Socket-Authorization",
}

const getKeysFromEnum = (enumObject: any) => {
    return Object.keys(enumObject);
};

const getValuesFromEnum = (enumObject: any) => {
    return Object.keys(enumObject)
        .map((key) => enumObject[key]);
};

export { getKeysFromEnum, getValuesFromEnum, Header, UserRole, TokenType, DBCollections };
