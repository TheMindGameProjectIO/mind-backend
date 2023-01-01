import client from "../setup";
import { Entity, Schema } from "redis-om";
import { playerRepository } from "./Player";
import { cardRepository } from "./Card";

export default class Game extends Entity {
    public totalMistakes: number = 0;
    public currentLevel: number = 0;
    public roomId: string;
    public static LAST_LEVEL_NUMBER: number = 0;
    get hasGameStarted() {
        return this.currentLevel > 0;
    }

    get players() {
        return playerRepository
            .search()
            .where("gameId")
            .eq(this.entityId)
            .all();
    }

    get cards() {
        return cardRepository.search().where("gameId").eq(this.entityId).all();
    }

    public startGame() {
        this.currentLevel = 1;
        gameRepository.save(this);
    }

    get hasGameEnded() {
        return this.currentLevel > Game.LAST_LEVEL_NUMBER;
    }

    static findByRoomId(roomId: string) {
        return gameRepository.search().where("roomId").eq(roomId).first();
    }

    findPlayerByUserId(userId: string) {
        return playerRepository.search().where("userId").eq(userId).where('gameId').eq(this.entityId).first();
    }

    static async gameExists(roomId: string) {
        return (
            (await gameRepository.search().where("roomId").eq(roomId).count()) >
            0
        );
    }

    static async create({ roomId }: { roomId: string }) {
        const gameEntity = gameRepository.createEntity();
        gameEntity.roomId = roomId;
        gameEntity.currentLevel = 0;
        gameEntity.totalMistakes = 0;
        await gameRepository.save(gameEntity);
        return gameEntity;
    }
}

const schema = new Schema(Game, {
    totalMistakes: { type: "number" },
    currentLevel: { type: "number" },
    roomId: { type: "string" },
});

const gameRepository = client.fetchRepository(schema);
await gameRepository.createIndex();

export { gameRepository };
