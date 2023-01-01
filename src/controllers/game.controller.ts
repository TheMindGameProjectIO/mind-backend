import { IRoomCreateForm } from "@/models/room.model";
import Room from "@/schemas/room.schema";
import { Header, ISocketAuthType } from "@/utils/enum";
import env from "@/utils/env";
import { generateSocketToken } from "@/utils/token";
import { Request, Response } from "express";

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
      players: [
        req.user,
    ] },
  });
};

export const getRoom = async (
  req: Request<{ id: string }, {}, {}>,
  res: Response
) => {
  const room = await Room.findById(req.params.id, { __v: 0 }).catch(() => null);
  if (!room) return res.status(404).send({ message: "Room not found" });
  return res.send(room);
};

export const joinRoom = async (
  req: Request<{ id: string }, {}, {password: string}>,
  res: Response
) => {
  const room = await Room.findById(req.params.id).catch(() => null);
  if (!room) return res.status(404).send({ message: "Room not found" });

  //TODO: check if room is full

  if (room.authorId.toString() !== req.user._id.toString() && (room.hasPassword && room.password !== req.body.password)) {
    return res.status(401).send({ message: "Wrong password" });
  }

  const token = generateSocketToken(ISocketAuthType.GAME, {
    _id: req.user.id.toString(),
    data: {
      roomId: room._id.toString(),
      role: room.getUserRole(req.user),
    },
  });

  return res
    .setHeader(Header.SOCKET_GAME_AUTHORIZATION, token).end();
};

export const joinRoomByInvitationLink = async (
  req: Request<{ payload: string }, {}, {}>,
  res: Response
) => {
  // TODO implement backend logic
  //TODO: check if room is full
  const room = await Room.getRoomFromInvitationLinkPayload(req.params.payload);
  const token = generateSocketToken(ISocketAuthType.GAME, {
    _id: req.user.id.toString(),
    data: {
      roomId: room._id.toString(),
      role: room.getUserRole(req.user)
    },
  });
  if (!room) return res.status(404).send({ message: "Room not found" });
  return res
    .setHeader(Header.SOCKET_GAME_AUTHORIZATION, token)
    .redirect(`${env.APP_WEB_URL}/room/${room._id}`);
};
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
