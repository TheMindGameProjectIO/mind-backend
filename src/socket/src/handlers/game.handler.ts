import Game from "@redisDB/schemas/Game";
import Player from "@redisDB/schemas/Player";
import logger from "@setups/winston";
import socketHandler from "@/socket";
import { IGameSocket } from "@/socket/types";
import Room from "@schemas/room.schema";
import EventEmitter from "events";

const gameEventEmitter = new EventEmitter();

export default async function gameHandler(socket: IGameSocket) {
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
            logger.error(`game:${game.entityId} is full, user:${userId} cannot join`);
            return socketHandler.delete(
                socket,
                "Game is full, please try again later"
            );
        }
        player = await Player.create({
            userId,
            gameId: game.entityId,
        });
        logger.info(`user:${userId} player is created`);
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
    socket.to(socket.data.data.roomId).emit("game:player:joined")

    /**
     * if user disconnects, disconnect the player
     */
    socket.on("disconnect", async () => {
        logger.info(`user:${userId} player is disconnected`);
        await player.disconnect();
    });

    // socket.on()


    // /**
    //  * if user tries to start the game
    //  */
    // socket.on("game:start", async () => {

    //     /**
    //      * stop listening to game:start event
    //      */
    //     socket.removeAllListeners("game:start");


    //     //GAME LOGIC

    //     //TODO: implement game start logic



    //     /**
    //      * notify the user that the game has started and start the game
    //      */
    //     logger.info(`user:${userId} has started the game`);
    // });
}
