import { IRoomCreateForm } from "@/models/room.model";
import Room from "@/schemas/room.schema";
import env from "@/utils/env";
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
  room.save();
  return res.send({
    message: "Room created successfully",
    room: { _id: room._id },
  });
};

export const getRoom = async (
  req: Request<{ id: string }, {}, {}>,
  res: Response
) => {
  const room = await Room.findById(req.params.id, { __v: 0 });
  if (!room) return res.status(404).send({ message: "Room not found" });
  return res.send(room);
};

export const joinRoomByInvitationLink = async (
  req: Request<{ payload: string }, {}, {}>,
  res: Response
) => {
  // TODO implement backend logic
  const room = await Room.getRoomFromInvitationLinkPayload(req.params.payload);
  if (!room) return res.status(404).send({ message: "Room not found" });
  return res.redirect(`${env.APP_WEB_URL}/room/${room._id}`);
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
