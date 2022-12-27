import Joi from "joi";

export const RoomCreate = Joi.object({
    maxUserCount: Joi.number().integer().min(1).max(5).required(),
});