import Joi from "joi";

export const RoomCreate = Joi.object({
    maxUserCount: Joi.number().integer().min(2).max(5).required(),
    name: Joi.string().trim().min(3).max(20).required(),
});