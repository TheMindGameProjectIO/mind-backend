import {Model, Schema, HydratedDocument, model, Types, SaveOptions} from 'mongoose';
import {hashPassword} from "@utils/password";
import {DBCollections, TokenType, UserRole} from "@utils/enum";
import {generateAuthToken} from "@utils/token";
import {IToken} from "@models/token.model";
import User, {IUserDocument} from "@schemas/user.schema";
import {getCurrentDate, getExpireDate} from "@utils/datetime";
import env from "@utils/env";
import * as crypto from "crypto";
import {sendEmail} from "@utils/email";
import hbs from "@setups/view";

interface ITokenMethods {
}

interface TokenModel extends Model<IToken, {}, ITokenMethods> {
    createFromUser(user: IUserDocument, type: TokenType): Promise<ITokenDocument>;
    findByIdWithUser(token: string): Promise<ITokenDocument & {userId: IUserDocument}>;
}

interface ITokenDocument extends IToken, HydratedDocument<IToken, ITokenMethods> {
}

const tokenSchema = new Schema<IToken, TokenModel, ITokenMethods>({
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

}, {
    virtuals: {

    },
    methods: {},
    statics: {
        createFromUser(user: IUserDocument, type: TokenType): Promise<ITokenDocument> {
            const token = new Token({
                value: crypto.randomBytes(32).toString('hex'),
                expiresAt: getExpireDate(env.TOKEN_USER_VERIFICATION_EXPIRES_IN),
                userId: user._id,
                type: type,
            });
            return token.save({session: user.$session()});
        },
        async findByIdWithUser(token: string): Promise<ITokenDocument & {user: IUserDocument}> {
            return Token.findOne({
                    value: token,
                    type: TokenType.EmailVerification,
                    expiresAt: {$gt: getCurrentDate()}
                }
            ).populate('user');
        }
    },
});

tokenSchema.virtual('user', {
    ref: DBCollections.User,
    localField: 'userId',
    foreignField: '_id',
    justOne: true,
});


tokenSchema.post('save', async function (doc, next) {
    const user = await User.findById(doc.userId).session(doc.$session());
    const html = await hbs.render("./public/views/email_verification.handlebars",
        {verification_link:`${env.APP_API_URL}/auth/verify/${doc.value}`, web_url: env.APP_WEB_URL}
    )
    await sendEmail(user.email, html);
    next();
})


const Token = model<IToken, TokenModel>(DBCollections.Token, tokenSchema);


export default Token;
export {
    ITokenDocument,
}