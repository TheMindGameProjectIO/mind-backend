import { IRoomCreateForm } from "@/models/room.model";
import Game from "@redisDB/schemas/Game";
import Room, { IRoomDocument } from "@schemas/room.schema";
import socketHandler from "@/socket";
import { Header, ISocketAuthType } from "@/utils/enum";
import env from "@utils/env";
import { generateSocketToken } from "@utils/token";
import { Request, Response } from "express";
import lodash from "lodash";

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
        users: await Promise.all(players.filter((player) => player.isConnected).map(async (player) => {
          return lodash.pick(await player.user, ['_id', 'nickname']);
        })),
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

export const gameStart = async (req: Request<{ id: string }, {}, { }>, res) => {
    const room: IRoomDocument = await Room.findById(req.params.id).catch(() => null);
    if (!room) return res.status(404).send({ message: "Room not found" });
    if (room.authorId.toString() !== req.user._id.toString()) return res.status(401).send({ message: "You are not the author of this room" });
    const game = await Game.findByRoomId(room._id.toString());
    if (!game) return res.status(404).send({ message: "Game not found" });
    if (game.hasStarted) return res.status(400).send({ message: "Game already started" });
    await game.start();
    socketHandler.emitTo(room._id.toString(), 'game:started');
    return res.send({ message: "Game started successfully", game: game.toJSON() });
} 

export const getInHandCardsByRoom = async (req: Request<{ id: string }, {}, { }>, res) => {
    const player = await Game.findPlayerByRoomIdAndUserId(req.params.id, req.user._id.toString());
    if (!player) return res.status(404).send({ message: "Player not found" });
    return res.send({ cards: player.cards });
}

export const getInGameCardsByRoom = async (req: Request<{ id: string }, {}, { }>, res) => {
    const game = await Game.findByRoomId(req.params.id);
    if (!game) return res.status(404).send({ message: "Game not found" });
    return res.send({ cards: game.cards });
}

export const getInHandCardsByGame = async (req: Request<{ id: string }, {}, { }>, res) => {
    const player = await Game.findPlayerByGameIdAndUserId(req.params.id, req.user._id.toString());
    if (!player) return res.status(404).send({ message: "Player not found" });
    return res.send({ cards: player.cards });
}

export const getInGameCardsByGame = async (req: Request<{ id: string }, {}, { }>, res) => {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).send({ message: "Game not found" });
    return res.send({ cards: game.cards });
}
// import { Request, RequestHandler } from 'express';
// import { IContactUsForm } from '@/models/general.model';
// import { sendEmail } from '@queues/email.queue';
// import { render } from '@/utils/html';
// import env from '@/utils/env';

// export const contactus: RequestHandler = async (req: Request<{}, {}, IContactUsForm>, res) => {
//     const { firstname, lastname, email, message } = req.body;
//     const formItself = await render('contactus_form', { firstname, lastname, email, message });
//     const formSuccess = await render('contactus_form_submitted_successfully', {})
//     await sendEmail({email, html: formSuccess, subject: 'Contact Us Form'});
//     await sendEmail({email: env.EMAIL_USER, html: formItself, subject: 'Contact Us Form'});
//     res.send({message: "Contact us form submitted successfully"});
// }
