import Game from "@redisDB/schemas/Game";
import Player from "@redisDB/schemas/Player";
import logger from "@setups/winston";
import socketHandler from "@/socket";
import {
    IGameLobbySocketData,
    IGameSocket,
    IGameSocketData,
} from "@/socket/types";
import Room from "@schemas/room.schema";
import EventEmitter from "events";
import { IRoom } from "@/models/room.model";

type IPlayed = Pick<
    IGameSocketData["played"],
    "card" | "isSmallest" | "isShootingStar"
>;

const getGameSocketData = async ({
    game,
    player,
    currentPlayer = null,
    played = null,
}: {
    played?: IPlayed;
    game: Game;
    player: Player;
    currentPlayer?: Player;
}): Promise<IGameSocketData> => {
    const data = {} as IGameSocketData;
    if (played && currentPlayer) {
        data.played = {
            ...played,
            player: {
                _id: currentPlayer.userId,
                nickname: currentPlayer.userNickname,
            },
        };
    }
    if (player) {
        data.player = {
            _id: player.userId,
            nickname: player.userNickname,
            cards: player.cards,
        };
    }
    data.game = {
        _id: game.entityId,
        cards: game.cards,
        hasWon: await game.hasWon,
        hasLost: await game.hasLost,
        mistakesLeft: await game.mistakesLeft,
        totalMistakes: game.totalMistakes,
        hasShootingStar: game.hasShootingStar,
        currentLevel: game.currentLevel,
        players: (await game.players).map((player) => {
            return {
                _id: player.userId,
                nickname: player.userNickname,
                cards: player.cards.length,
                isOnline: player.isConnected,
            };
        }),
    };
    return data;
};

const getGameLobbySocketData = async (
    game: Game,
    room: IRoom
): Promise<IGameLobbySocketData> => {
    return {
        name: room.name,
        authorId: room.authorId.toString(),
        invitationLink: room.invitationLink,
        roomId: game.roomId,
        users: (await game.getPlayers(true)).map((player) => {
            return {
                _id: player.userId,
                nickname: player.userNickname,
            };
        }),
        maxUserCount: room.maxUserCount,
    };
};

const gameHandler = {
    events: {
        gameStart(roomId: string) {
            return `game:start:${roomId}`;
        },
    },
    emitter: new EventEmitter(),
    async handle(socket: IGameSocket) {
        const userId = socket.data.user._id.toString();
        const roomId = socket.data.data.roomId;
        const room = await Room.findById(roomId).catch();


        //TODO: sync isConnected using rooms

        //TODO: check if room is full

        // ROOM
        /**
         * If room is not found, delete socket and return
         */
        if (!room) {
            logger.error(`room:${roomId} is not found`);
            return socketHandler.delete(socket, "Room not found");
        }

        // GAME
        /**
         * If room is found, check if game exists
         */
        let game: Game;
        if (!(await Game.gameExists(roomId))) {
            game = await Game.create({ roomId: roomId });
            socket.emit("game:created");
            logger.info(`game:${game.entityId} is created by user:${userId}`);
            /**
             * If game exists, find it
             */
        } else {
            game = await Game.findByRoomId(roomId);
            logger.info(`game:${game.entityId} is found by user:${userId}`);
        }

        // PLAYER
        /**
         * Find player by userId
         */
        let player = await game.findPlayerByUserId(userId);
        /**
         * If player is not found, create it
         */
        if (!player) {
            if ((await game.players).length >= room.maxUserCount) {
                logger.error(
                    `game:${game.entityId} is full, user:${userId} cannot join`
                );
                return socketHandler.delete(
                    socket,
                    "Game is full, please try again later"
                );
            }
            player = await Player.create({
                userId,
                gameId: game.entityId,
                userNickname: socket.data.user.nickname,
            });
            logger.info(
                `user:${userId} player with nickname:${socket.data.user.nickname} is created`
            );
            /**
             * If player is found, and is already connected, delete current socket and return
             */
        } else if (player.isConnected) {
            logger.error(`user:${userId} player is already connected`);
            return socketHandler.delete(socket, "Player already connected");
            /**
             * If player is found, but is not connected, connect it
             */
        } else {
            logger.info(`user:${userId} player is found`);
        }
        logger.info(`user:${userId} player is connected`);
        await player.connect();

        game = await Game.findByRoomId(roomId);

        /**
         * notify the user that it has joined the game
         */

        /**
         * join the game room
         */
        socket.join(roomId);

        /**
         * notify the room that a new player has joined
         */
        socketHandler.io
            .in(roomId)
            .emit(
                "game:lobby:changed",
                await getGameLobbySocketData(game, room)
            );

        const gameLoop = async () => {
            logger.info(`user:${userId} has started the game`);

            //TODO: implement when user leaves the game

            const game = await Game.findById(gameId);
            const player = await game.findPlayerByUserId(userId);

            socket.emit(
                "game:started",
                await getGameSocketData({ game, player })
            );

            socket.on("game:player:play", async (card) => {
                logger.info(`user:${userId} has played ${card}`);
                const game = await Game.findById(gameId);
                let currentPlayer = await game.findPlayerByUserId(userId);
                const played: IPlayed = {
                    isShootingStar: false,
                    isSmallest: false,
                    card,
                };

                const sockets = await socketHandler.io
                    .in(roomId)
                    .fetchSockets();

                if ((await game.hasLost) || (await game.hasWon)) {
                    return await Promise.all(
                        sockets.map(async (socket) => {
                            const player = await game.findPlayerByUserId(
                                socket.data.user._id
                            );
                            socket.emit(
                                "game:changed",
                                await getGameSocketData({
                                    game,
                                    player,
                                    played,
                                    currentPlayer,
                                })
                            );
                        })
                    );
                }

                // is shooting star
                //TODO: implement
                if (Game.isShootingStar(card) && game.hasShootingStar) {
                    logger.info(
                        `user:${currentPlayer.userNickname}:${userId} played the shooting card`
                    );
                    played["isShootingStar"] = true;
                    const players = await game.players;
                    const smallestCards = players.map((player) =>
                        Math.min(...player.cards.map((card) => +card))
                    );
                    players.forEach((player, index) =>
                        player.removeCard(smallestCards[index].toString())
                    );
                } else {
                    // find smallest card
                    const cards = (await game.playerCards).map((card) => +card);
                    const smallestCard = Math.min(...cards);

                    // if card is bigger than smallest card, add mistake and remove card from player
                    if (smallestCard < +card) {
                        logger.info(
                            `user:${currentPlayer.userNickname}:${userId} has made a mistake, smallest card is ${smallestCard}`
                        );
                        await game.handleMistake(card);
                        currentPlayer = await game.findPlayerByUserId(userId);
                        await game.addCard(card);
                    }
                    // if card is bigger than smallest card, remove card from player and add card to game
                    else {
                        logger.info(
                            `user:${currentPlayer.userNickname}:${userId} played the smallest card`
                        );
                        played["isSmallest"] = true;
                        await currentPlayer.removeCard(card);
                        await game.addCard(card);
                    }
                }

                //TODO: replace socketHandler.io.in to socket.in

                game.flushCache();

                await Promise.all(
                    sockets.map(async (socket) => {
                        const player = await game.findPlayerByUserId(
                            socket.data.user._id
                        );
                        socket.emit(
                            "game:changed",
                            await getGameSocketData({
                                game,
                                player,
                                played,
                                currentPlayer,
                            })
                        );
                    })
                );

                if (
                    (await game.hasRoundEnded) &&
                    !(await game.hasWon) &&
                    !(await game.hasLost)
                ) {
                    game.currentLevel++;
                    await game.startLevel();

                    await Promise.all(
                        sockets.map(async (socket) => {
                            const player = await game.findPlayerByUserId(
                                socket.data.user._id
                            );
                            socket.emit(
                                "game:changed",
                                await getGameSocketData({
                                    game,
                                    player,
                                    played,
                                    currentPlayer,
                                })
                            );
                        })
                    );
                }
            });
        };

        /**
         * if user disconnects, disconnect the player
         */
        socket.on("disconnect", async () => {
            logger.info(`user:${userId} player is disconnected`);
            const player = await game.findPlayerByUserId(userId);
            await player.disconnect();
            // const player = await Player.findByUserId(userId);
            // if (game.hasStarted) {
            //     await player.disconnect();
            //     const game = await Game.findByRoomId(gameId);
            //     socketHandler.io
            //         .in(roomId)
            //         .emit(
            //             "game:changed",
            //             await getGameSocketData({ game, player })
            //         );
            // } else {
            //     const game = await Game.findByRoomId(gameId);
            //     await player.disconnect();
            //     socketHandler.io
            //         .in(roomId)
            //         .emit(
            //             "game:lobby:changed",
            //             await getGameLobbySocketData(game, room)
            //         );
            // }
            gameHandler.emitter.off(
                gameHandler.events.gameStart(roomId),
                gameLoop
            );
        });

        const gameId = game.entityId;

        gameHandler.emitter.on(
            gameHandler.events.gameStart(roomId),
            gameLoop
        );

        game.hasStarted &&
            gameHandler.emitter.emit(
                gameHandler.events.gameStart(roomId)
            );
    },
};
export default gameHandler;
