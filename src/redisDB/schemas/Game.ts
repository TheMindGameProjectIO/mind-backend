import { Entity, Schema } from "redis-om";
import Player, { playerRepository } from "./Player";
import lodash from "lodash";
import client from "../setup";
import Room from "@/schemas/room.schema";
// import { cardRepository } from "./Card";

interface Game {
    totalMistakes: number;
    currentLevel: number;
    roomId: string;
    cards: string[];
    authorId: string;
    shootingStars: number;
    shootingStarVotingUserId: string;
}

class Game extends Entity {
    public static LAST_LEVEL_NUMBER: number = 12; //TODO: make dynamic based on player length
    protected _players: Player[] = null;
    get hasStarted() {
        return this.currentLevel > 0;
    }

    get lastLevelNumber(): Promise<number> {
        return new Promise((resolve) => {
            this.players.then((players) => {
                resolve((players.length - 1) * 4);
            });
        });
    }

    get mistakesLeft(): Promise<number> {
        return new Promise((resolve) => {
            this.players.then((players) => {
                resolve(Math.max(players.length - this.totalMistakes, 0));
            });
        });
    }

    get hasLost(): Promise<boolean> {
        return new Promise((resolve) =>
            this.mistakesLeft.then((mistakesLeft) => {
                resolve(mistakesLeft === 0);
            })
        );
    }

    static isShootingStar(card: string) {
        return card === "0";
    }

    async handleMistake(card: string) {
        this.totalMistakes++;
        card &&
            (await Promise.all(
                (
                    await this.players
                ).map(async (player) => {
                    await player.removeCardsLessThanOrEqual(card);
                })
            ));
        await gameRepository.save(this);
    }

    get hasShootingStar() {
        return this.shootingStars > 0;
    }

    get playerCards(): Promise<string[]> {
        return new Promise((resolve) => {
            this.players.then((players) => {
                resolve(players.map((player) => player.cards).flat(2));
            });
        });
    }

    get playersCount() {
        return playerRepository
            .search()
            .where("gameId")
            .eq(this.entityId)
            .count();
    }

    public getPlayers(isConnected: boolean = null) {
        let query = playerRepository
            .search()

            .where("gameId")
            .eq(this.entityId);
        if (isConnected != null) {
            query = query.where("isConnected").eq(isConnected);
        }
        return query.sortBy("userNickname").return.all();
    }

    get players(): Promise<Player[]> {
        return new Promise((resolve) => {
            if (this._players) return resolve(this._players);
            this.getPlayers()
                .then((players) => {
                    this._players = players;
                    resolve(players);
                })
                .catch(() => resolve([] as Player[]));
        });
    }

    static findById(id: string) {
        return gameRepository.fetch(id);
    }

    async start() {
        this.currentLevel = 1;
        await this.startLevel();
        gameRepository.save(this);
    }

    async startLevel() {
        this.cards = [];
        this.shootingStars++;
        const players = await this.players;
        const array = lodash.range(1, 101).map((number) => number.toString());
        const shuffledArray = lodash.shuffle(array);
        for (const player of players) {
            player.cards = shuffledArray.splice(0, this.currentLevel);
            await playerRepository.save(player);
        }
        await gameRepository.save(this);
    }

    static async findPlayersByRoomId(roomId: string) {
        const game = await this.findByRoomId(roomId);
        if (!game) return [];
        return await game.players;
    }

    static async findPlayerByRoomIdAndUserId(roomId: string, userId: string) {
        const game = await this.findByRoomId(roomId);
        if (!game) return null;
        return playerRepository
            .search()
            .where("userId")
            .eq(userId)
            .where("gameId")
            .eq(game.entityId)
            .first();
    }
    static async findPlayerByGameIdAndUserId(gameId: string, userId: string) {
        return playerRepository
            .search()
            .where("userId")
            .eq(userId)
            .where("gameId")
            .eq(gameId)
            .first();
    }

    get shootingStarVotingPlayer() {
        if (!this.shootingStarVotingUserId) return null;
        return playerRepository
            .search()
            .where("userId")
            .eq(this.shootingStarVotingUserId)
            .return.first();
    }

    get hasGameEnded(): Promise<boolean> {
        return new Promise(async (resolve) => {
            this.hasRoundEnded.then((hasRoundEnded) => {
                this.lastLevelNumber.then((lastLevelNumber) => {
                    resolve(
                        hasRoundEnded && this.currentLevel >= lastLevelNumber
                    );
                });
            });
        });
    }

    flushCache() {
        this._players = null;
    }

    get hasRoundEnded(): Promise<boolean> {
        return new Promise(async (resolve) => {
            this.playerCards.then((playerCards) => {
                resolve(playerCards.length === 0);
            });
        });
    }

    get hasWon(): Promise<boolean> {
        return new Promise(async (resolve) => {
            this.hasLost.then((hasLost) => {
                resolve(!hasLost && this.hasGameEnded);
            });
        });
    }

    static findByRoomId(roomId: string) {
        return gameRepository
            .search()
            .where("roomId")
            .equals(roomId)
            .return.first();
    }

    findPlayerByUserId(userId: string) {
        return playerRepository
            .search()
            .where("userId")
            .equals(userId)
            .where("gameId")
            .equals(this.entityId)
            .return.first();
    }

    static async gameExists(roomId: string) {
        return (
            (await gameRepository.search().where("roomId").eq(roomId).count()) >
            0
        );
    }

    async startShootingStarVoting(userId: string) {
        this.shootingStarVotingUserId = userId;
        await gameRepository.save(this);
    }

    async endShootingStarVoting(success: boolean = true) {
        this.shootingStarVotingUserId = null;
        (await this.players).forEach((player) => {
            player.set({ hasVotedShootingStar: false });
        });
        success && this.shootingStars--;
        await gameRepository.save(this);
    }

    get shootingStarVoted(): Promise<number> {
        return new Promise((resolve) => {
            this.players.then((players) => {
                resolve(
                    players.filter((player) => player.hasVotedShootingStar)
                        .length
                );
            });
        });
    }

    get shootingStarTotal(): Promise<number> {
        return new Promise((resolve) => {
            this.players.then((players) => {
                resolve(players.length);
            });
        });
    }

    static async create({ roomId }: { roomId: string }) {
        const authorId = await Room.findById(roomId).then((room) =>
            room.authorId.toString()
        );
        const gameEntity = await gameRepository.createAndSave({
            roomId,
            authorId,
            currentLevel: 0,
            totalMistakes: 0,
            shootingStarVotingUserId: null,
        });
        return gameEntity;
    }

    get isShootingStarVoting() {
        return !!this.shootingStarVotingUserId;
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
        currentLevel: { type: "number" },
        roomId: { type: "string" },
        cards: { type: "string[]" },
        shootingStars: { type: "number" },
        shootingStarVotingUserId: { type: "string" },
        authorId: { type: "string" },
    },
    {
        dataStructure: "JSON",
    }
);

const gameRepository = client.fetchRepository(schema);
await gameRepository.createIndex();
export { gameRepository };
export default Game;
