import { Permission } from "@utils/enum";

interface IAuthPayload {
    _id: string;
}

interface IPermissionPayload {
    _id: string;
    permissions: Permission[];
}

export {
    IAuthPayload,
    IPermissionPayload,
}