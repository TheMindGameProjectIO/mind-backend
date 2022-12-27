export interface IRoomCreateForm {
    maxUserCount: number;
}

export interface IRoom {
    maxUserCount: number;
    authorId: string;
    expireAfter: number;
}