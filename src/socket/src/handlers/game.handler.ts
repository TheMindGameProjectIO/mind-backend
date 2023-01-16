import Game from "@redisDB/schemas/Game";
import Player from "@redisDB/schemas/Player";
import logger from "@setups/winston";
import socketHandler from "@/socket";
import { IGameSocket, IGameSocketData } from "@/socket/types";
import Room from "@schemas/room.schema";
import EventEmitter from "events";

const getGameSocketData = async (
    game: Game,
    player: Player,
    data: IGameSocketData
): Promise<IGameSocketData> => {
    return {
        ...data,
        game: {
            _id: game.entityId,
            cards: game.cards,
            hasShootingStar: game.hasShootingStar,
            currentLevel: game.currentLevel,
            players: (await game.players).map((player) => {
                return {
                    _id: player.userId,
                    nickname: player.userNickname,
                    cards: player.cards.length,
                };
            }),
        },
        cards: player.cards,
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
        const room = await Room.findById(socket.data.data.roomId).catch();

        //TODO: sync isConnected using rooms

        // ROOM
        /**
         * If room is not found, delete socket and return
         */
        if (!room) {
            logger.error(`room:${socket.data.data.roomId} is not found`);
            return socketHandler.delete(socket, "Room not found");
        }

        // GAME
        /**
         * If room is found, check if game exists
         */
        let game: Game;
        if (!(await Game.gameExists(socket.data.data.roomId))) {
            game = await Game.create({ roomId: socket.data.data.roomId });
            socket.emit("game:created");
            logger.info(`game:${game.entityId} is created by user:${userId}`);
            /**
             * If game exists, find it
             */
        } else {
            game = await Game.findByRoomId(socket.data.data.roomId);
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

        /**
         * notify the user that it has joined the game
         */
        socket.emit("game:self:joined");

        /**
         * join the game room
         */
        socket.join(socket.data.data.roomId);

        /**
         * notify the room that a new player has joined
         */
        socket.to(socket.data.data.roomId).emit("game:player:joined");

        /**
         * if user disconnects, disconnect the player
         */
        socket.on("disconnect", async () => {
            logger.info(`user:${userId} player is disconnected`);
            await player.disconnect();
            gameHandler.emitter.removeAllListeners(
                gameHandler.events.gameStart(socket.data.data.roomId)
            );
        });

        const gameId = game.entityId;

        gameHandler.emitter.on(
            gameHandler.events.gameStart(socket.data.data.roomId),
            () => {
                logger.info(`user:${userId} has started the game`);

                //TODO: implement when user leaves the game

                socket.on("game:player:play", async (card) => {
                    logger.info(`user:${userId} has played ${card}`);
                    const game = await Game.findById(gameId);
                    const player = await game.findPlayerByUserId(userId);
                    let data: IGameSocketData = {
                        isShootingStar: false,
                        isSmallest: false,
                        playedCard: card,
                    } as IGameSocketData;

                    // is shooting star
                    //TODO: implement
                    if (Game.isShootingStar(card) && game.hasShootingStar) {
                        data["isShootingStar"] = true;
                        const players = await game.players;
                        const smallestCards = players.map((player) =>
                            Math.min(...player.cards.map((card) => +card))
                        );
                        players.forEach((player, index) =>
                            player.removeCard(smallestCards[index].toString())
                        );
                    } else {
                        // find smallest card
                        const cards = (await game.playerCards).map(
                            (card) => +card
                        );
                        const smallestCard = Math.max(...cards);

                        // if card is smaller than smallest card, add mistake and remove card from player
                        if (smallestCard < +card) {
                            game.totalMistakes++;
                            await player.removeCard(card);

                            //TODO: has any lives to continue?
                        }
                        // if card is bigger than smallest card, remove card from player and add card to game
                        else {
                            data["isSmallest"] = true;
                            await player.playCard(card);
                        }
                    }

                    data = await getGameSocketData(game, player, data);
                    socket
                        .to(socket.data.data.roomId)
                        .emit("game:player:played", data);
                    socket.emit("game:self:played", data);

                    if ((await game.playerCards).length === 0) {
                        game.currentLevel++;
                        game.startLevel();

                        data = await getGameSocketData(game, player, data);
                        socket
                            .to(socket.data.data.roomId)
                            .emit("game:player:played", data);
                        socket.emit("game:self:played", data);
                    }
                });
            }
        );
    },
};
export default gameHandler;
