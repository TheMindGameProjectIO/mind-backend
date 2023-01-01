interface ICard {
    id: number;
    value: number;
}

export default class Card {
    public static _id: number = 0;
    id: number;
    value: number;
    constructor({id, value}: {id?: number, value: number}) {
        this.id = id ?? Card._id++;
        this.value = value;
    }
}