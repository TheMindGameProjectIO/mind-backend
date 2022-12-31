import { ISocketAuthType } from "@/utils/enum";
import { UserRoomRole } from "@/utils/types";

export interface IAuthPayload {
    _id: string;
}

export interface ISocketAuthPayloadData {
    [ISocketAuthType.GAME]: {
        roomId: string;
        role:UserRoomRole;
    },
    [ISocketAuthType.RESET_PASSWORD]: undefined,
    [ISocketAuthType.VERIFY_EMAIL]: undefined,
}

export interface ISocketAuthPayload<T extends keyof ISocketAuthPayloadData> {
    _id: string;
    type: T;
    data: ISocketAuthPayloadData[T];
}


