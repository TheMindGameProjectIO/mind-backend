import { Types } from "mongoose";
import { TokenType } from "@utils/enum";

interface IToken {
    expiresAt: Date;
    value: string;
    userId: Types.ObjectId;
    type: TokenType;
    verifiedAt: Date | null;
}

export { IToken };
