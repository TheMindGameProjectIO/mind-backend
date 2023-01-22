import { Model, Schema, HydratedDocument, model } from "mongoose";
import { DBCollections, getValuesFromEnum, TokenType } from "@utils/enum";
import { IToken } from "@models/token.model";
import User, { IUserDocument } from "@schemas/user.schema";
import { getCurrentDate, getExpireDate } from "@utils/datetime";
import env from "@utils/env";
import * as crypto from "crypto";
import { sendEmail } from "@queues/email.queue";
import { render } from "@/utils/html";

interface ITokenMethods {
    verify: () => Promise<void>;
}

interface TokenModel extends Model<IToken, {}, ITokenMethods> {
    createFromUser(user: IUserDocument, type: TokenType): Promise<ITokenDocument>;
    findByIdWithUser(token: string): Promise<ITokenDocument & { userId: IUserDocument }>;
}

interface ITokenDocument extends IToken, HydratedDocument<IToken, ITokenMethods> {}

const tokenSchema = new Schema<IToken, TokenModel, ITokenMethods>(
    {
        value: {
            type: String,
            required: true,
        },
        expiresAt: {
            type: Date,
            required: false,
            default: () => new Date(),
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: DBCollections.User,
        },
        type: {
            type: Number,
            required: true,
        },
        verifiedAt: {
            type: Date,
            required: false,
            default: null,
        },
    },
    {
        virtuals: {},
        methods: {
            verify() {
                return Token.updateOne({ _id: this._id }, { verifiedAt: getCurrentDate() });
            },
        },
        statics: {
            createFromUser(user: IUserDocument, type: TokenType): Promise<ITokenDocument> {
                const token = new Token({
                    value: crypto.randomBytes(32).toString("hex"),
                    expiresAt: getExpireDate(env.TOKEN_USER_VERIFICATION_EXPIRES_IN),
                    userId: user._id,
                    type: type,
                });
                return token.save({ session: user.$session() });
            },
            async findByIdWithUser(token: string): Promise<ITokenDocument & { user: IUserDocument }> {
                return Token.findOne({
                    value: token,
                    type: TokenType.EMAIL_VERIFICATION,
                    expiresAt: { $gt: getCurrentDate() },
                }).populate("user");
            },
        },
    }
);

tokenSchema.virtual("user", {
    ref: DBCollections.User,
    localField: "userId",
    foreignField: "_id",
    justOne: true,
});

tokenSchema.post("save", async function (doc, next) {
    const user = await User.findById(doc.userId).session(doc.$session());

    if (doc.type === TokenType.EMAIL_VERIFICATION) {
        const html = await render('email_verification', {
            verification_link: `${env.APP_API_URL}/auth/verify/${doc.value}`,
            web_url: env.APP_WEB_URL,
        });
        await sendEmail({ email: user.email, html, subject: "Email Verification" });
    } else if (doc.type === TokenType.RESET_PASSWORD) {
        const html = await render("password_reset", {
            reset_link: `${env.APP_WEB_URL}/auth/password/reset/${doc.value}`,
        });
        await sendEmail({ email: user.email, html, subject: "Password Reset" });
    }

    next();
});

const Token: TokenModel = model<IToken, TokenModel>(DBCollections.Token, tokenSchema);

export default Token;
export { ITokenDocument };
