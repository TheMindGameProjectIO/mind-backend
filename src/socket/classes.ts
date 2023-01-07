import { IUser } from "@/models/user.model";
import { ISocketAuthType } from "@/utils/enum";

export class SocketData<T = any> {
  public user: Omit<IUser, '_id'> & {_id: string}
  constructor(user: IUser, public type: ISocketAuthType, public data?: T) {
    this.user = {...user, _id: user._id.toString()};
    this.data = data
    this.type = type;
  }

  get isAuthorized() {
    return "email" in this.user;
  }

  get isAnonymous() {
    return !this.isAuthorized;
  }
}
