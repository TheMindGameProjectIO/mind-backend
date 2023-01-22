import { IRoomCreateForm } from "@/models/room.model";
import Game from "@redisDB/schemas/Game";
import Room, { IRoomDocument } from "@schemas/room.schema";
import socketHandler from "@/socket";
import { Header, ISocketAuthType } from "@/utils/enum";
import env from "@utils/env";
import { generateSocketToken } from "@utils/token";
import { Request, Response } from "express";
import lodash from "lodash";
import logger from "@/setups/winston.setup";

export const createRoom = async (
    req: Request<{}, {}, IRoomCreateForm>,
    res: Response
) => {
    const { maxUserCount, name } = req.body;
    const room = await new Room({
        maxUserCount,
        authorId: req.user._id,
        name,
    }).save();
    return res.send({
        message: "Room created successfully",
        room: {
            _id: room._id,
            players: [],
        },
    });
};

export const getRoom = async (
    req: Request<{ id: string }, {}, {}>,
    res: Response
) => {
    const room = await Room.findById(req.params.id, { __v: 0 }).catch(
        () => null
    );
    if (!room) return res.status(404).send({ message: "Room not found" });
    const players = await Game.findPlayersByRoomId(room._id.toString());
    return res.send({
        ...room.toJSON(),
        users: await Promise.all(
            players
                .filter((player) => player.isConnected)
                .map(async (player) => {
                    return lodash.pick(await player.user, ["_id", "nickname"]);
                })
        ),
    });
};

export const joinRoom = async (
    req: Request<{ id: string }, {}, { password: string }>,
    res: Response
) => {
    const room = await Room.findById(req.params.id).catch(() => null);
    if (!room) return res.status(404).send({ message: "Room not found" });

    //TODO: check if room is full

    if (
        room.authorId.toString() !== req.user._id.toString() &&
        room.hasPassword &&
        room.password !== req.body.password
    ) {
        return res.status(401).send({ message: "Wrong password" });
    }

    const token = generateSocketToken(ISocketAuthType.GAME, {
        _id: req.user.id.toString(),
        data: {
            roomId: room._id.toString(),
            role: room.getUserRole(req.user),
        },
    });

    return res.setHeader(Header.SOCKET_GAME_AUTHORIZATION, token).end();
};

export const joinRoomByInvitationLink = async (
    req: Request<{ payload: string }, {}, {}>,
    res: Response
) => {
    // TODO implement backend logic
    //TODO: check if room is full
    const room = await Room.getRoomFromInvitationLinkPayload(
        req.params.payload
    );
    const token = generateSocketToken(ISocketAuthType.GAME, {
        _id: req.user.id.toString(),
        data: {
            roomId: room._id.toString(),
            role: room.getUserRole(req.user),
        },
    });
    if (!room) return res.status(404).send({ message: "Room not found" });
    return res
        .setHeader(Header.SOCKET_GAME_AUTHORIZATION, token)
        .redirect(`${env.APP_WEB_URL}/room/${room._id}`);
};

export const getInHandCards = async (
    req: Request<{ id: string }, {}, {}>,
    res: Response
) => {
    const player = await Game.findPlayerByRoomIdAndUserId(
        req.params.id,
        req.user._id.toString()
    );
    if (!player) return res.status(404).send({ message: "Player not found" });
    return res.send({ cards: player.cards });
};

export const getInGameCards = async (
    req: Request<{ id: string }, {}, {}>,
    res: Response
) => {
    const game = await Game.findByRoomId(req.params.id);
    if (!game) return res.status(404).send({ message: "Game not found" });
    return res.send({ cards: game.cards });
};

export const getGame = async (
    req: Request<{ id: string }, {}, { card: string }>,
    res: Response
) => {
    const game = await Game.findByRoomId(req.params.id);
    if (!game) return res.status(404).send({ message: "Game not found" });
    const player = await Game.findPlayerByRoomIdAndUserId(
        req.params.id,
        req.user._id.toString()
    );
    if (!player) return res.status(404).send({ message: "Player not found" });
    return res.send({
        game: {
            _id: game.entityId,
            cards: game.cards,
            hasShootingStar: !!game.shootingStars,
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
    });
};

export const playCard = async (
    req: Request<{ id: string }, {}, { card: string }>,
    res: Response
) => {};

export const getPlayers = async (
    req: Request<{ id: string }, {}, { card: string }>,
    res: Response
) => {};
