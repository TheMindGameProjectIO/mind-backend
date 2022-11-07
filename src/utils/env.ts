import * as dotenv from 'dotenv';
dotenv.config();

const E = (ENV: string) => process.env[ENV]

const env = {
    DB_ACCESS_URL: String(E('DB_URL')),
    DB_PASSWORD: String(E('DB_PASSWORD')),
    DB_USERNAME: String(E('DB_USERNAME')),
    MODE: String(E('MODE')),
    SECRET_KEY: String(E('SECRET_KEY')),
    TOKEN_AUTH_EXPIRES_IN: Number(E('TOKEN_AUTH_EXPIRES_IN')),

    get DB_URL() {
        return `redis://${this.DB_USERNAME}:${this.DB_PASSWORD}@${this.DB_ACCESS_URL}`
    },
    get IS_DEV() {
        return this.MODE === 'development'
    },
    get IS_PROD() {
        return this.MODE === 'production'
    }
}

export default env;


