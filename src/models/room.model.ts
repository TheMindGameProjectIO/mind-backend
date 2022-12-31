export interface IRoomCreateForm {
    maxUserCount: number;
    name: string;
}

export interface IInvitationLinkPayload {
    _id: string;
}

export interface IRoom {
    _id: string;
    password: string;
    name: string;
    maxUserCount: number;
    authorId: string;
    expireAfter: number;
    invitationLink: string;
    hasPassword: boolean;
}

