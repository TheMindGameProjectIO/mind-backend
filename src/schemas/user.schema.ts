import {Model, Schema, HydratedDocument, model} from 'mongoose';
import {hashPassword} from "@utils/password";
import {UserRole} from "@utils/enum";
import {generateAuthToken} from "@utils/token";
import {IUser} from "@models/user.model";


interface IUserMethods {
    generateAuthToken: () => Promise<string>;
    // fullName(): string;
}

interface UserModel extends Model<IUser, {}, IUserMethods> {
    findByEmail(email: string): Promise<HydratedDocument<IUser, IUserMethods>>;
}

interface IUserDocument extends IUser, HydratedDocument<IUser, IUserMethods> {

}

const userSchema = new Schema<IUser, UserModel, IUserMethods>({
    email: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    password: {
        type: String,
        required: true,
        set: (value: string) => {
            return hashPassword(value)
        }
    },
    nickname: {
        type: String,
        required: true,
    },
    verifiedAt: {
        type: Date,
        required: false,
        default: () => new Date(),
    },
    role: {
        type: Number,
        default: UserRole.Guest,
        enum: Object.values(UserRole).filter(value => typeof value === 'number')
    },
}, {
    methods: {
        async generateAuthToken() {
            return await generateAuthToken(this);
        },
        // findSimilarTypes(cb) {
        //     return User.find({ type: this.type }, cb);
        // }
    },
    statics: {
        findByEmail(email: string) {
            return User.findOne({email})
        },
    },
});


// schema.static('createWithFullName', function createWithFullName(name: string) {
//     const [firstName, lastName] = name.split(' ');
//     return User.create({ firstName, lastName });
// });
//
// schema.method('fullName', function fullName(): string {
//     return this.firstName + ' ' + this.lastName;
// });

const User: UserModel = model<IUser, UserModel>('users', userSchema);
// User.createWithFullName('Jean-Luc Picard').then(doc => {
//     console.log(doc.firstName); // 'Jean-Luc'
//     doc.fullName(); // 'Jean-Luc Picard'
// });
export {IUserDocument}
export default User;