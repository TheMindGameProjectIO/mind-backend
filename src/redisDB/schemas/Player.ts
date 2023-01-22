import User from "@schemas/user.schema";
import { Entity, Schema } from "redis-om";
import client from "../setup";
import { gameRepository } from "./Game";

interface Player {
    userId: string;
    gameId: string;
    isConnected: boolean;
    // cards: number[];
    cards: string[];
    userNickname: string;
    hasVotedShootingStar: boolean;
    reaction: string;
}

class Player extends Entity {
    get user() {
        return User.findById(this.userId);
    }

    async remove() {
        await playerRepository.remove(this.entityId);
    }

    static async disconnectAll() {
        const players = await playerRepository
            .search()
            .where("isConnected")
            .eq(true)
            .returnAll();
        players.forEach(async (player) => {
            await player.disconnect();
        });
    }

    async set({ isConnected, hasVotedShootingStar }: Partial<Player>) {
        if (isConnected != null) this.isConnected = isConnected;
        if (hasVotedShootingStar != null)
            this.hasVotedShootingStar = hasVotedShootingStar;
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

    async;

    async playCard(card: string) {
        const game = await gameRepository.fetch(this.gameId);
        await game.addCard(card);
        await this.removeCard(card);
    }

    static async create({
        userId,
        gameId,
        userNickname,
    }: Pick<Player, "userId" | "gameId" | "userNickname">) {
        const userEntity = await playerRepository.createAndSave({
            userId,
            gameId,
            isConnected: false,
            cards: [],
            userNickname,
            hasVotedShootingStar: false,
            reaction: null,
        });
        return userEntity;
    }

    async setReaction(reaction: string) {
        this.reaction = reaction;
        await playerRepository.save(this);
    }

    static async findByUserId(userId: string) {
        return playerRepository.search().where("userId").eq(userId).first();
    }

    async removeCardsLessThanOrEqual(card: string) {
        const cards = this.cards.filter((c) => +c > +card);
        this.cards = cards;
        await playerRepository.save(this);
    }

    async voteShootingStar() {
        this.hasVotedShootingStar = true;
        await playerRepository.save(this);
    }
}

const schema = new Schema(Player, {
    userId: { type: "string" },
    gameId: { type: "string" },
    isConnected: { type: "boolean" },
    cards: { type: "string[]" },
    userNickname: { type: "string" },
    hasVotedShootingStar: { type: "boolean" },
    reaction: { type: "string" },
});

const playerRepository = client.fetchRepository(schema);
await playerRepository.createIndex();

export { playerRepository };
export default Player;
