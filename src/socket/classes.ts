import { IUser } from "@/models/user.model";
import { Socket } from "socket.io";

export class SocketData {
    constructor(public user: IUser | { _id: string }) {
        this.user = user;
    }

    get isAuthorized() {
        return !this.isAuthorized;
    }

    get isAnonymous() {
        return "email" in this.user;
    }
}
