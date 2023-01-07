import { Entity, Schema } from "redis-om";
import { playerRepository } from "./Player";
import { cardRepository } from "./Card";
import client from "../setup";

interface Game {
    totalMistakes: number;
    currentLevel: number;
    roomId: string;
}

class Game extends Entity {
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
        return gameRepository.search().where("roomId").equals(roomId).first();
    }

    findPlayerByUserId(userId: string) {
        return playerRepository
            .search()
            .where("userId")
            .equals(userId)
            .where("gameId")
            .equals(this.entityId)
            .first();
    }

    static async gameExists(roomId: string) {
        return (
            (await gameRepository.search().where("roomId").eq(roomId).count()) >
            0
        );
    }

    static async create({ roomId }: { roomId: string }) {
        const gameEntity = await gameRepository.createAndSave({
            roomId,
            currentLevel: 0,
            totalMistakes: 0,
        });
        return gameEntity;
    }
}

const schema = new Schema(
    Game,
    {
        totalMistakes: { type: "number" },
        currentLevel: { type: "number" },
        roomId: { type: "string" },
    },
    {
        dataStructure: "JSON",
    }
);

const gameRepository = client.fetchRepository(schema);
await gameRepository.createIndex();
export { gameRepository };
export default Game;
