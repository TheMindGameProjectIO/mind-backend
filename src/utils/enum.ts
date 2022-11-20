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
    EmailVerification = 'email_verification',
    PasswordReset = 'password_reset',
}

export {
    UserRole,
    DBCollections,
    TokenType
}