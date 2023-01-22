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
import { IRoom } from "@/models/room.model";

type IPlayed = Pick<IGameSocketData["played"], "card">;

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
    if (player) {
        const shootingStarVotingPlayer = await game.shootingStarVotingPlayer;
        data.shootingStar = {
            isVoting: game.isShootingStarVoting,
            hasVoted: player.hasVotedShootingStar,
            voted: await game.shootingStarVoted,
            total: await game.shootingStarTotal,
            nickname: shootingStarVotingPlayer?.userNickname,
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

const sendSocketDataAllFactory =
    (roomId: string, userId: string) =>
    async ({ played = null }: { played?: IPlayed } = {}) => {
        const game = await Game.findByRoomId(roomId);
        const currentPlayer = await game.findPlayerByUserId(userId);
        const sockets = await socketHandler.io.in(roomId).fetchSockets();
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
    };

const handleRoundEndFactory = (roomId: string, userId: string) => {
    const sendSocketDataAll = sendSocketDataAllFactory(roomId, userId);
    return <T>(callback: T) => {
        return (async (...args) => {
            // @ts-ignore
            await callback(...args);
            const game = await Game.findByRoomId(roomId);
            if (
                (await game.hasRoundEnded) &&
                !(await game.hasWon) &&
                !(await game.hasLost)
            ) {
                game.currentLevel++;
                await game.startLevel();
                await sendSocketDataAll();
            }
        }) as T;
    };
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

async function gameHandler(socket: IGameSocket) {
    const userId = socket.data.user._id.toString();
    const nickname = socket.data.user.nickname;
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
        .emit("game:lobby:changed", await getGameLobbySocketData(game, room));

    const sendSocketDataAll = sendSocketDataAllFactory(roomId, userId);
    const handleRoundEnd = handleRoundEndFactory(roomId, userId);

    const gameLoop = async () => {
        logger.info(`user:${userId} has started the game`);

        //TODO: implement when user leaves the game

        await sendSocketDataAll();

        socket.on(
            "game:player:shootingstar",
            handleRoundEnd(async (accept) => {
                logger.info(
                    `user:${nickname}${userId} has started the shooting star`
                );

                const game = await Game.findByRoomId(roomId);

                if (!accept) {
                    await game.endShootingStarVoting(false);
                    await sendSocketDataAll();
                    return;
                }

                const player = await game.findPlayerByUserId(userId);
                if (!game.isShootingStarVoting)
                    await game.startShootingStarVoting(player.userId);
                await player.voteShootingStar();

                game.flushCache();

                if (
                    (await game.shootingStarTotal) ===
                    (await game.shootingStarVoted)
                ) {
                    logger.info(
                        `user:${player.userNickname}:${userId} played the shooting card`
                    );
                    const players = await game.players;
                    const smallestCards = players.map((player) =>
                        Math.min(...player.cards.map((card) => +card))
                    );
                    players.forEach((player, index) =>
                        player.removeCard(smallestCards[index].toString())
                    );
                    await sendSocketDataAll();
                    await game.endShootingStarVoting();
                }
                await sendSocketDataAll();
            })
        );

        socket.on(
            "game:player:play",
            handleRoundEnd(async (card) => {
                logger.info(`user:${userId} has played ${card} ${socket.id}`);
                const game = await Game.findById(gameId);
                let currentPlayer = await game.findPlayerByUserId(userId);
                const played: IPlayed = {
                    card,
                };

                if (game.isShootingStarVoting) return;
                if ((await game.hasLost) || (await game.hasWon)) return;

                // find smallest card
                const cards = (await game.playerCards).map((card) => +card);
                const smallestCard = Math.min(...cards);

                // if card is bigger than smallest card, add mistake and remove card from player
                if (smallestCard < +card) {
                    logger.info(
                        `user:${nickname}:${userId} has made a mistake, smallest card is ${smallestCard}`
                    );
                    await game.handleMistake(card);
                    currentPlayer = await game.findPlayerByUserId(userId);
                    await game.addCard(card);
                }
                // if card is bigger than smallest card, remove card from player and add card to game
                else {
                    logger.info(
                        `user:${nickname}:${userId} played the smallest card`
                    );
                    await currentPlayer.removeCard(card);
                    await game.addCard(card);
                }

                game.flushCache();
                await sendSocketDataAll({ played });
            })
        );
    };

    /**
     * if user disconnects, disconnect the player
     */
    socket.on("disconnect", async () => {
        logger.info(`user:${userId} player is disconnected`);
        const game = await Game.findByRoomId(roomId);
        const player = await game.findPlayerByUserId(userId);
        socket.removeAllListeners("game:player:play");
        socket.removeAllListeners("game:player:shootingstar");

        if (game.hasStarted) {
            await player.disconnect();
            await sendSocketDataAll();
            socketHandler.io
                .in(roomId)
                .emit(
                    "game:changed",
                    await getGameSocketData({ game, player })
                );
        } else {
            await player.remove();
            const game = await Game.findByRoomId(roomId);
            socketHandler.io
                .in(roomId)
                .emit(
                    "game:lobby:changed",
                    await getGameLobbySocketData(game, room)
                );
        }
    });

    const gameId = game.entityId;

    if (game.hasStarted) {
        socket.emit("game:started");
        await gameLoop();
    } else {
        socket.on("game:start", async () => {
            const game = await Game.findByRoomId(roomId);
            // check if game has started
            if (game.hasStarted) return;

            // check if user is not alone
            if ((await game.players).length === 1) return;

            // check if user is the author
            if (game.authorId !== userId) return;

            // start game
            await game.start();

            socketHandler.io.in(roomId).emit("game:started");

            await gameLoop();
        });
    }
}
export default gameHandler;
