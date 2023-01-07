import Game from "@/redisDB/schemas/Game";
import Player from "@/redisDB/schemas/Player";
import logger from "@setups/winston";
import socketHandler from "@/socket";
import { IGameSocket } from "@/socket/types";
export default async function gameHandler(socket: IGameSocket) {
    const userId = socket.data.user._id.toString();
    let game: Game;
    if (!(await Game.gameExists(socket.data.data.roomId))) {
        game = await Game.create({ roomId: socket.data.data.roomId });
        socket.emit("game:created");
        logger.info(`game:${game.entityId} is created by user:${userId}`);
    } else {
        game = await Game.findByRoomId(socket.data.data.roomId);
        logger.info(`game:${game.entityId} is found by user:${userId}`);
    }

    let player = await game.findPlayerByUserId(userId);
    if (!player) {
        player = await Player.create({
            userId,
            gameId: game.entityId,
        });
        logger.info(`user:${userId} player is created`);
    } else if (player.isConnected) {
        logger.error(`user:${userId} player is already connected`);
        return socketHandler.delete(socket, "Player already connected");
    } else {
        logger.info(`user:${userId} player is found`);
    }
    logger.info(`user:${userId} player is connected`);
    await player.connect();

    socket.emit("game:self:joined");

    socket.join("game:" + socket.data.data.roomId);

    socket.on("disconnect", () => {
        logger.info(`user:${userId} player is disconnected`);
        player.disconnect();
    });

    socket.on("game:start", () => {
        if (socket.data.data.role !== "host") {
            logger.error(
                `user:${userId} is not the host, but tried to start the game`
            );
            return socket.emit(
                "response",
                "game:start",
                "only the host can start the game"
            );
        }
        logger.info(`user:${userId} has started the game`);
        socket.emit("response", "game:start", "game has started");
        game.startGame();
    });
}
