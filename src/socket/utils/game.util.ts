import { IRoom } from "@models/room.model";
import Game from "@redisDB/schemas/Game";
import Player from "@redisDB/schemas/Player";
import socketHandler from "..";
import { IGameLobbySocketData, IGameSocketData } from "../types";

export type IPlayed = Pick<IGameSocketData["played"], "card">;

export const getGameSocketData = async ({
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

export const sendSocketDataAllFactory =
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

export const handleGameProcessFactory = (roomId: string, userId: string) => {
    const sendSocketDataAll = sendSocketDataAllFactory(roomId, userId);
    return <T>(callback: T) => {
        return (async (...args) => {
            {
                const game = await Game.findByRoomId(roomId);
                if (game.isShootingStarVoting) return;
                if ((await game.hasLost) || (await game.hasWon)) return;
            }
            // @ts-ignore
            await callback(...args);
            {
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
            }
        }) as T;
    };
};

export const getGameLobbySocketData = async (
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