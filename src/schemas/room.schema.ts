import { Model, Schema, HydratedDocument, model } from "mongoose";
import { DBCollections } from "@utils/enum";
import { IInvitationLinkPayload, IRoom } from "@models/room.model";
import env from "@/utils/env";
import { signPayload, verifyPayload } from "@/utils/token";

interface IRoomMethods {
}

interface IRoomDocument extends IRoom, HydratedDocument<IRoom, IRoomMethods> {
}

interface RoomModel extends Model<IRoom, {}, IRoomMethods> {
  getRoomFromInvitationLinkPayload: (payload: string) => Promise<IRoomDocument>;
}

const roomSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: DBCollections.User,
    },
    expireAfter: {
      // in seconds
      type: Number,
      required: true,
      default: 600,
    },
    maxUserCount: {
      type: Number,
      required: true,
    },
  },
  {
    statics: {
      getRoomFromInvitationLinkPayload(payload: string) {
        try {
          const { _id } = verifyPayload<IInvitationLinkPayload>(payload);
          return Room.findById(_id);
        } catch {
          return null;
        }
      },
    },
    virtuals: {
      invitationLink: {
        get() {
          return `${
            env.APP_API_URL
          }/game/room/join/invitation/${signPayload<IInvitationLinkPayload>(
            { _id: this._id },
            env.TOKEN_ROOM_INVITE_EXPIRES_IN
          )}`;
        },
      },
    },
    toJSON: {
      virtuals: true,
    },
  }
);

const Room: RoomModel = model<IRoom, RoomModel>(DBCollections.Room, roomSchema);
export default Room;

// interface ITokenMethods {
//     verify: () => Promise<void>;
// }

// interface TokenModel extends Model<IToken, {}, ITokenMethods> {
//     createFromUser(user: IUserDocument, type: TokenType): Promise<ITokenDocument>;
//     findByIdWithUser(token: string): Promise<ITokenDocument & { userId: IUserDocument }>;
// }

// interface ITokenDocument extends IToken, HydratedDocument<IToken, ITokenMethods> {}

// const tokenSchema = new Schema<IToken, TokenModel, ITokenMethods>(
//     {
//         value: {
//             type: String,
//             required: true,
//         },
//         expiresAt: {
//             type: Date,
//             required: false,
//             default: () => new Date(),
//         },
//         userId: {
//             type: Schema.Types.ObjectId,
//             ref: DBCollections.User,
//         },
//         type: {
//             type: Number,
//             required: true,
//             enum: getValuesFromEnum(TokenType),
//         },
//         verifiedAt: {
//             type: Date,
//             required: false,
//             default: null,
//         },
//     },
//     {
//         virtuals: {},
//         methods: {
//             verify() {
//                 return Token.updateOne({ _id: this._id }, { verifiedAt: getCurrentDate() });
//             },
//         },
//         statics: {
//             createFromUser(user: IUserDocument, type: TokenType): Promise<ITokenDocument> {
//                 const token = new Token({
//                     value: crypto.randomBytes(32).toString("hex"),
//                     expiresAt: getExpireDate(env.TOKEN_USER_VERIFICATION_EXPIRES_IN),
//                     userId: user._id,
//                     type: type,
//                 });
//                 return token.save({ session: user.$session() });
//             },
//             async findByIdWithUser(token: string): Promise<ITokenDocument & { user: IUserDocument }> {
//                 return Token.findOne({
//                     value: token,
//                     type: TokenType.EmailVerification,
//                     expiresAt: { $gt: getCurrentDate() },
//                 }).populate("user");
//             },
//         },
//     }
// );

// tokenSchema.virtual("user", {
//     ref: DBCollections.User,
//     localField: "userId",
//     foreignField: "_id",
//     justOne: true,
// });

// tokenSchema.post("save", async function (doc, next) {
//     const user = await User.findById(doc.userId).session(doc.$session());

//     if (doc.type === TokenType.EmailVerification) {
//         const html = await render('email_verification', {
//             verification_link: `${env.APP_API_URL}/auth/verify/${doc.value}`,
//             web_url: env.APP_WEB_URL,
//         });
//         await sendEmail({ email: user.email, html, subject: "Email Verification" });
//     } else if (doc.type === TokenType.PasswordReset) {
//         const html = await render("password_reset", {
//             reset_link: `${env.APP_WEB_URL}/auth/password/reset/${doc.value}`,
//         });
//         await sendEmail({ email: user.email, html, subject: "Password Reset" });
//     }

//     next();
// });

// const Token: TokenModel = model<IToken, TokenModel>(DBCollections.Token, tokenSchema);

// export default Token;
// export { ITokenDocument };
