import { Entity, Schema } from "redis-om";
import { playerRepository } from "./Player";
import lodash from "lodash";
import client from "../setup";
// import { cardRepository } from "./Card";

interface Game {
    totalMistakes: number;
    _currentLevel: number;
    roomId: string;
    cards: string[];
    shootingStars: number;
}

class Game extends Entity {
    public static LAST_LEVEL_NUMBER: number = 0;
    get hasStarted() {
        return this.currentLevel > 0;
    }

    get currentLevel() {
        return this._currentLevel;
    }

    set currentLevel(level: number) {
        if (level > this._currentLevel) {
            this.shootingStars++;
        }
        this._currentLevel = level;
    }

    get playersCount() {
        return playerRepository
            .search()
            .where("gameId")
            .eq(this.entityId)
            .count();
    }

    get players() {
        return playerRepository
            .search()
            .where("gameId")
            .eq(this.entityId)
            .all();
    }

    static findById(id: string) {
        return playerRepository.fetch(id);
    }

    async start() {
        this.currentLevel = 1;
        await this.startLevel()
        gameRepository.save(this);
    }

    async startLevel() {
        this.cards = [];
        const players = await playerRepository.search().where("gameId").eq(this.entityId).all();
        const array = lodash.range(1, 101).map((number) => number.toString());
        const shuffledArray = lodash.shuffle(array);
        for (const player of players) {
            player.cards = shuffledArray.splice(0, this.currentLevel);
            await playerRepository.save(player);
        }
    }

    static async findPlayersByRoomId(roomId: string) {
        const game = await this.findByRoomId(roomId);
        if (!game) return [];
        return await game.players;
    }

    static async findPlayerByRoomIdAndUserId(roomId: string, userId: string) {
        return playerRepository.search().where("userId").eq(userId).where("gameId").eq(roomId).first();
    }
    static async findPlayerByGameIdAndUserId(gameId: string, userId: string) {
        return playerRepository.search().where("userId").eq(userId).where("entityId").eq(gameId).first();
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
            _currentLevel: 0,
            totalMistakes: 0,
        });
        return gameEntity;
    }

    async addCard(...card: string[]) {
        this.cards.push(...card);
        await gameRepository.save(this);
    }

}

const schema = new Schema(
    Game,
    {
        totalMistakes: { type: "number" },
        _currentLevel: { type: "number" },
        roomId: { type: "string" },
        cards: { type: "string[]" },
        shootingStars: { type: "number" },
    },
    {
        dataStructure: "JSON",
    }
);

const gameRepository = client.fetchRepository(schema);
await gameRepository.createIndex();
export { gameRepository };
export default Game;
