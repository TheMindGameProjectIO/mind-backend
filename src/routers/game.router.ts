import validate from "@middlewares/validator.middleware";
import { RoomCreate } from "@validators/game.validator";
import { createRoom, getRoom } from "@controllers/game.controller";
import { Router } from "express";
import { authenticate, role } from "@/middlewares/auth.middleware";
import { UserRole } from "@/utils/enum";

export const router = Router();

router.post("/room/create", authenticate, role(UserRole.User), validate(RoomCreate), createRoom);
router.get("/room/:id", getRoom);
