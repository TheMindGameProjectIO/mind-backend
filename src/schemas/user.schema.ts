import {Entity, Schema} from "redis-om";
import client from "@/setups/db";
import {IUserRegister} from "@models/user.model";
import {hashPassword} from "@utils/password";
import {generateAuthToken, verifyAuthToken} from "@utils/token";


interface User {
    entityId: string;
    email: string;
    hashedPassword: string;
    nickname: string;
    isActive: boolean;
    role: number;
}

class User extends Entity{
    static async create(user: IUserRegister) {
        const userEntity = await userRepository.createEntity();
        userEntity.email = user.email;
        userEntity.nickname = user.nickname;
        userEntity.hashedPassword = hashPassword(user.password);
        userEntity.isActive = false;
        userEntity.role = 0;
        return userEntity;
    }

    set password(password: string) {
        this.hashedPassword = hashPassword(password);
    }

    get password() {
        return this.hashedPassword;
    }

    async generateAuthToken() {
        return generateAuthToken(this);
    }

    static async verifyAuthToken(token: string) {
        return await verifyAuthToken(token);
    }

    static async findByEmail(email: string) {
        return await userRepository.search().where("email").equals(email).return.first();
    }


}


const userSchema = new Schema(User, {
    role: {
        type: "number",
    },
    nickname: {
        type: 'string',
    },
    email: {
        type: 'string',
    },
    hashedPassword: {
        type: 'string',
    },
    isActive: {
        type: 'boolean',
    },
}, {
    dataStructure: 'JSON',
})

const userRepository = client.fetchRepository(userSchema)
await userRepository.createIndex()

export {User}
export default userRepository;
