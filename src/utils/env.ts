import * as dotenv from 'dotenv';

dotenv.config();

const E = (ENV: string) => process.env[ENV]

const env = {
    REDIS_DB_ACCESS_URL: String(E('REDIS_DB_URL')),
    REDIS_DB_PASSWORD: String(E('REDIS_DB_PASSWORD')),
    REDIS_DB_USERNAME: String(E('REDIS_DB_USERNAME')),
    MONGO_DB_ACCESS_URL: String(E('MONGO_DB_URL')),
    MONGO_DB_PASSWORD: String(E('MONGO_DB_PASSWORD')),
    MONGO_DB_USERNAME: String(E('MONGO_DB_USERNAME')),
    MODE: String(E('MODE')),
    SECRET_KEY: String(E('SECRET_KEY')),
    TOKEN_AUTH_EXPIRES_IN: Number(E('TOKEN_AUTH_EXPIRES_IN')),

    get REDIS_DB_URL() {
        return `redis://${this.REDIS_DB_USERNAME}:${this.REDIS_DB_PASSWORD}@${this.REDIS_DB_ACCESS_URL}`
    },
    get MONGO_DB_URL() {
        return `mongodb+srv://${this.MONGO_DB_USERNAME}:${this.MONGO_DB_PASSWORD}@${this.MONGO_DB_ACCESS_URL}`
    },
    get IS_DEV() {
        return this.MODE === 'development'
    },
    get IS_PROD() {
        return this.MODE === 'production'
    }
}

export default env;


