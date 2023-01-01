import client from "@/redisDB/setup";
import Card from "./card";
import Player from "./player";


class IGame {
    id: number;
    totalMistakes: number;
    currentLevel: number;
    roomId: string;
    players: Player[];
    cards: Card[];
}

export default class Game implements IGame  {
    public static LAST_LEVEL_NUMBER: number = 0;
    public static _id: number = 0;
    id: number;
    totalMistakes: number;
    currentLevel: number;
    roomId: string;
    players: Player[];
    cards: Card[];
    constructor({id, totalMistakes = 0, currentLevel = 0, roomId, players=[], cards=[]}: {totalMistakes?: number, currentLevel?: number, id?: number, roomId: string, players?: Player[], cards?: Card[]}) {
        this.id = id ?? Game._id++;
        this.totalMistakes = totalMistakes;   
        this.currentLevel = currentLevel;
        this.roomId = roomId;
        this.players = players;
        this.cards = cards;
    }
    public hasGameStarted() {
        return this.currentLevel > 0;
    }

    public hasGameEnded() {
        return this.currentLevel > Game.LAST_LEVEL_NUMBER;
    }

    public async save() {
        await client.set(this.redisKey, JSON.stringify(this));
    }

    get socketKey() {
        return `game:${this.roomId}`;
    }

    public static getSocketKey(roomId: string) {
        return `game:${roomId}`;
    }

    get redisKey() {
        return `game:${this.id}`;
    }

    public static getRedisKey(id: number) {
        return `game:${id}`;
    }

    public startGame() {
        this.currentLevel = 1;
    }

    public addPlayer(player: Player) {
        this.players.push(player);
    }

    public removePlayer(player: Player) {
        this.players = this.players.filter((p) => p.id !== player.id);
    }

    public async get(roomId: string) {
        // return client.get(`game:${roomId}`).catch(() => null).then((gameAsString) => {
        //     const game = JSON.parse(gameAsString) as IGame;
        //     const gameCards = game.cards.map((card) => new Card(card));
        //     const gamePlayers = game.players.map((player) => {
        //         const playerCards = player.cards.map((card) => new Card(card));
        //         return new Player({...player, cards: playerCards})
        //     });
        //     return new Game({...game, cards: gameCards, players: gamePlayers});
        // });
        const gameAsString = await client.get(`game:${roomId}`);
        const game = JSON.parse(gameAsString) as IGame;
        const gameCards = game.cards.map((card) => new Card(card));
        const gamePlayers = game.players.map((player) => {
            const playerCards = player.cards.map((card) => new Card(card));
            return new Player({...player, cards: playerCards})
        });
        return new Game({...game, cards: gameCards, players: gamePlayers});
    }
}