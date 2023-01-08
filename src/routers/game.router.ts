import validate from "@middlewares/validator.middleware";
import { RoomCreate } from "@validators/game.validator";
import {
    createRoom,
    getRoom,
    joinRoomByInvitationLink,
    joinRoom,
    gameStart,
    getInHandCardsByRoom,
    getInGameCardsByRoom,
    getInHandCardsByGame,
    getInGameCardsByGame,
} from "@controllers/game.controller";
import { Router } from "express";
import { authenticate, role } from "@/middlewares/auth.middleware";
import { UserRole } from "@/utils/enum";

export const router = Router();

router.post(
    "/room/create",
    authenticate,
    role(UserRole.User),
    validate(RoomCreate),
    createRoom
);
router.get("/room/:id", authenticate, role(UserRole.User), getRoom);
router.get(
    "/room/join/invitation/:payload",
    authenticate,
    role(UserRole.User),
    joinRoomByInvitationLink
);
router.post("/room/join/:id", authenticate, role(UserRole.User), joinRoom);
router.post("/start/:id", authenticate, role(UserRole.User), gameStart);
router.get(
    "/room/:id/cards/in-hand",
    authenticate,
    role(UserRole.User),
    getInHandCardsByRoom
);
router.get(
    "/room/:id/cards/in-game",
    authenticate,
    role(UserRole.User),
    getInGameCardsByRoom
);
router.get(
    "/:id/cards/in-hand",
    authenticate,
    role(UserRole.User),
    getInHandCardsByGame
);
router.get(
    "/:id/cards/in-game",
    authenticate,
    role(UserRole.User),
    getInGameCardsByGame
);
