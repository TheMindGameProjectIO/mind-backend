import { Permission } from "@utils/types";

export interface IAuthPayload {
    _id: string;
}

export interface IPermissionPayload {
    _id: string;
    permissions: Permission[];
}

export interface ISocketAuthPayload {
    _id: string;
}