import * as dotenv from 'dotenv';

dotenv.config();

const E = (ENV: string) => process.env[ENV]

const env = {
    REDIS_DB_HOST: String(),
    REDIS_DB_PASSWORD: String(),
    REDIS_DB_USERNAME: String(),
    MONGO_DB_HOST: String(),
    MONGO_DB_PASSWORD: String(),
    MONGO_DB_USERNAME: String(),
    MODE: String(),
    SECRET_KEY: String(),
    TOKEN_AUTH_EXPIRES_IN: Number(),
    TOKEN_USER_VERIFICATION_EXPIRES_IN: Number(),
    EMAIL_HOST: String(),
    EMAIL_PORT: Number(),
    EMAIL_USER: String(),
    EMAIL_PASSWORD: String(),
    EMAIL_IS_SECURE: Boolean(),
    APP_URL: String(),
    APP_WEB_URL: String(),

    get APP_API_URL() {
        return `${this.APP_URL}/api`;
    },
    get REDIS_DB_URL() {
        return `redis://${this.REDIS_DB_USERNAME}:${this.REDIS_DB_PASSWORD}@${this.REDIS_DB_HOST}`
    },
    get MONGO_DB_URL() {
        return `mongodb+srv://${this.MONGO_DB_USERNAME}:${this.MONGO_DB_PASSWORD}@${this.MONGO_DB_HOST}`
    },
    get IS_DEV() {
        return this.MODE === 'development'
    },
    get IS_PROD() {
        return this.MODE === 'production'
    },
    load: () => {
        for (let key in env) {
            const desc = Object.getOwnPropertyDescriptor(env, key);
            if (desc && !desc.get && !desc.set) {
                switch (typeof env[key]) {
                    case 'string':
                        env[key] = String(E(key));
                        break;
                    case 'number':
                        env[key] = Number(E(key));
                        break;
                    case 'boolean':
                        env[key] = Boolean(E(key));
                        break;
                }
            }

        }
    }
}

env.load()

export default env;


