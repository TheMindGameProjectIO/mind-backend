import client from "../setup";
import { Entity, Schema } from "redis-om";
import { cardRepository } from "./Card";

export default class User extends Entity {
    userId: string;
    gameId: string;
    isConnected: boolean;
    get cards() {
        return cardRepository
            .search()
            .where("playerId")
            .eq(this.entityId)
            .all();
    }

    async set({ isConnected }: { isConnected: boolean }) {
        this.isConnected = isConnected;
        await playerRepository.save(this);
    }

    static async create({
        userId,
        gameId,
    }: {
        userId: string;
        gameId: string;
    }) {
        const userEntity = playerRepository.createEntity();
        userEntity.userId = userId;
        userEntity.gameId = gameId;
        userEntity.isConnected = true;
        await playerRepository.save(userEntity);
        return userEntity;
    }

    static async findByUserId(userId: string) {
        return playerRepository.search().where("userId").eq(userId).first();
    }
}

const schema = new Schema(User, {
    userId: { type: "string" },
    gameId: { type: "string" },
    _isConnected: { type: "boolean" },
});

const playerRepository = client.fetchRepository(schema);
await playerRepository.createIndex();

export { playerRepository };
