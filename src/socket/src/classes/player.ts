import Card from "./card";

interface IPlayer {
    id: number;
    userId: string;
    cards: Card[];
}


export default class Player implements IPlayer {
    public static _id: number = 0;
    id: number;
    userId: string;
    cards: Card[];
    constructor({id, userId, cards = []}: {id?: number, userId: string, cards: Card[]}) {
        this.id = id ?? Player._id++;
        this.userId = userId;
        this.cards = cards;
    }
}
