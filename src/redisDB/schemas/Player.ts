import User from "@schemas/user.schema";
import { Entity, Schema } from "redis-om";
// import { cardRepository } from "./Card";
import client from "../setup";
import { gameRepository } from "./Game";

interface Player {
    userId: string;
    gameId: string;
    isConnected: boolean;
    // cards: number[];
    cards: string[];
    userNickname: string;
}

class Player extends Entity {
    get user() {
        return User.findById(this.userId);
    }


    static async disconnectAll() {
        const players = await playerRepository.search().where("isConnected").eq(true).returnAll()
        players.forEach(async (player) => {
            await player.disconnect();
        })

    }

    async set({ isConnected }: { isConnected: boolean }) {
        this.isConnected = isConnected;
        await playerRepository.save(this);
    }

    async disconnect() {
        //TODO: start counter to remove player from game after a certain time if he doesn't reconnect
        this.isConnected = false;
        await playerRepository.save(this);
    }

    async connect() {
        //TODO: reset counter if player reconnects
        this.isConnected = true;
        await playerRepository.save(this);
    }

    async removeCard(card: string) {
        this.cards = this.cards.filter((cardId) => cardId !== card);
        await playerRepository.save(this);
    }

    async hasCard(card: string) {
        return this.cards.includes(card);
    }

    async playCard(card: string) {
        const game = await gameRepository.fetch(this.gameId);
        await game.addCard(card);
        await this.removeCard(card);
    }

    static async create({
        userId,
        gameId,
        userNickname,
    }: Pick<Player, 'userId' | 'gameId' | 'userNickname'>) {
        const userEntity = await playerRepository.createAndSave({
            userId,
            gameId,
            isConnected: false,
            cards: [],
            userNickname,
        });
        return userEntity;
    }

    static async findByUserId(userId: string) {
        return playerRepository.search().where("userId").eq(userId).first();
    }
}

const schema = new Schema(Player, {
    userId: { type: "string" },
    gameId: { type: "string" },
    isConnected: { type: "boolean" },
    cards: { type: "string[]" },
    userNickname: { type: "string" },
});

const playerRepository = client.fetchRepository(schema);
await playerRepository.createIndex();

export { playerRepository };
export default Player;