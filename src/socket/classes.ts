import { IUser } from "@/models/user.model";
import { ISocketAuthType } from "@/utils/enum";
import { Socket } from "socket.io";

export class SocketData<T = any> {
  constructor(public user: IUser | { _id: string }, public type: ISocketAuthType, public data?: T) {
    this.user = user;
    this.data = data;
    this.type = type;
  }

  get isAuthorized() {
    return "email" in this.user;
  }

  get isAnonymous() {
    return !this.isAuthorized;
  }
}
