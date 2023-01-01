import Game from "@/redisDB/schemas/Game";
import Player from "@/redisDB/schemas/Player";
import socketHandler from "@/socket";
import { IGameSocket } from "@/socket/types";
export default async function gameHandler(socket: IGameSocket) {
    let game: Game;
    if (!(await Game.gameExists(socket.data.data.roomId))) {
        game = await Game.create({ roomId: socket.data.data.roomId });
        socket.emit("game:created");
    } else {
        game = await Game.findByRoomId(socket.data.data.roomId);
    }

    let player = await game.findPlayerByUserId(socket.data.user._id);
    if (!player)
        player = await Player.create({
            userId: socket.data.user._id,
            gameId: game.entityId,
        });
    else player.isConnected;
    return socketHandler.delete(socket, "Player already connected");

    // let player = await Player.findByUserId(socket.data.user._id);
    // if (!player) player = await Player.create({userId: socket.data.user._id, gameId: game.entityId});
    // else {
    //   if (player.gameId !== game.entityId) {
    //   }
    // }

    socket.emit("game:self:joined");

    socket.join("game:" + socket.data.data.roomId);

    socket.on("game:start", () => {
        if (socket.data.data.role !== "host")
            return socket.emit(
                "response",
                "game:start",
                "only the host can start the game"
            );
        socket.emit("response", "game:start", "game has started");
        game.startGame();
    });
}
