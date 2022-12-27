export interface IRoomCreateForm {
    maxUserCount: number;
    name: string;
}

export interface IInvitationLinkPayload {
    _id: string;
}

export interface IRoom {
    name: string;
    maxUserCount: number;
    authorId: string;
    expireAfter: number;
    invitationLink: string;
}

