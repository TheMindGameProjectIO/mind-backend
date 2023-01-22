import { Model, Schema, HydratedDocument, model, PreSaveMiddlewareFunction, Query } from "mongoose";
import { hashPassword } from "@utils/password";
import { DBCollections, getKeysFromEnum, getValuesFromEnum, UserRole } from "@utils/enum";
import { generateAuthToken } from "@utils/token";
import { IUser, IUserRegister } from "@models/user.model";
import Token from "@schemas/token.schema";
import * as util from "util";
import { getCurrentDate } from "@utils/datetime";
import socketHandler from "@/socket";
import { isModified } from "@utils/query";

interface IUserMethods {
    generateAuthToken(): string;
    checkPassword(password: string): boolean;
}

interface UserModel extends Model<IUser, {}, IUserMethods> {
    findByEmail(email: string): Promise<HydratedDocument<IUser, IUserMethods>>;
    changePassword(user: { _id: Pick<IUser, "_id"> }, password: string);
}

interface IUserDocument extends IUser, HydratedDocument<IUser, IUserMethods> {}

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
    {
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
                return hashPassword(value);
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
        },
    },
    {
        timestamps: true,
        methods: {
            generateAuthToken() {
                return generateAuthToken(this);
            },
            checkPassword(password: string) {
                return hashPassword(password) === this.password;
            },
            // findSimilarTypes(cb) {
            //     return User.find({ type: this.type }, cb);
            // }
        },
        statics: {
            create(user: IUserRegister) {
                return User.create({...user, role: UserRole.Guest});
            },
            findByEmail(email: string) {
                return User.findOne({ email });
            },
            changePassword(user: { _id: Pick<IUser, "_id"> }, password: string) {
                return User.updateOne(
                    { _id: user._id },
                    {
                        password,
                        passwordUpdatedAt: getCurrentDate(),
                    }
                );
            },
        },
    }
);

userSchema.post("save", async function (doc, next) {
    next();
});

userSchema.post("updateOne", async function (doc, next) {
    if (isModified(this, "verifiedAt")) {
        // @ts-ignore
        const user = await User.findById(this.getQuery());
        socketHandler.emitEventToUser(user, "auth:verified:email");
        Token.updateOne({ userId: user._id }, { verifiedAt: user.verifiedAt }, { multi: true }).exec();
    }
    next();
});

userSchema.pre("updateOne", async function (next) {
    if (isModified(this, "password")) {
        this.set({ passwordUpdatedAt: getCurrentDate() });
    }
    if (isModified(this, "verifiedAt")) {
        this.set({ role: UserRole.User });
    }
    next();
});

const User: UserModel = model<IUser, UserModel>(DBCollections.User, userSchema);
export { IUserDocument };
export default User;
