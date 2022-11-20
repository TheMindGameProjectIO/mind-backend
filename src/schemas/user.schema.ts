import {Model, Schema, HydratedDocument, model, PreSaveMiddlewareFunction, Query} from 'mongoose';
import {hashPassword} from "@utils/password";
import {DBCollections, UserRole} from "@utils/enum";
import {generateAuthToken} from "@utils/token";
import {IUser} from "@models/user.model";
import Token from "@schemas/token.schema";
import * as util from "util";
import {getCurrentDate} from "@utils/datetime";
import socketHandler from "@/socket";
import {isModified} from "@utils/query";


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
    passwordUpdatedAt: {
        type: Date,
        required: true,
        default: () => getCurrentDate(),
    },
    password: {
        type: String,
        required: true,
        set: (value: string) => {
            return hashPassword(value)
        },
    },
    nickname: {
        type: String,
        required: true,
    },
    verifiedAt: {
        type: Date,
        required: false,
        default: null,
    },
    role: {
        type: Number,
        default: UserRole.Guest,
        enum: Object.values(UserRole).filter(value => typeof value === 'number')
    },
}, {
    timestamps: true,
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

userSchema.post('save', async function (doc, next) {
    next();
})

userSchema.post('updateOne', async function(doc, next) {
    if (isModified(this, 'verifiedAt')) {
        // @ts-ignore
        socketHandler.emitEventToUser(this.getQuery(), 'auth:verified:email');
    }
    next();
});

userSchema.pre('updateOne', async function(next) {
    if (isModified(this, 'password')) {
        this.set({passwordUpdatedAt: getCurrentDate()});
    } if (isModified(this, 'verifiedAt')) {
        this.set({role: UserRole.User});
    }
    next();
});

const User: UserModel = model<IUser, UserModel>(DBCollections.User, userSchema);
export {IUserDocument}
export default User;