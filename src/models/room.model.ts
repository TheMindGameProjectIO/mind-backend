export interface IRoomCreateForm {
    maxUserCount: number;
    name: string;
}

export interface IRoom {
    name: string;
    maxUserCount: number;
    authorId: string;
    expireAfter: number;
    invitationLink: string;
}