import validate from "@middlewares/validator.middleware";
import { RoomCreate } from "@validators/game.validator";
import {
    createRoom,
    getRoom,
    joinRoomByInvitationLink,
    joinRoom,
    gameStart,
    getInHandCards,
    getInGameCards,
    getGame,
} from "@controllers/game.controller";
import { Router } from "express";
import { authenticate, role } from "@/middlewares/auth.middleware";
import { UserRole } from "@/utils/enum";

export const router = Router();

router.post(
    "/create",
    authenticate,
    role(UserRole.User),
    validate(RoomCreate),
    createRoom
);
router.get("/:id", authenticate, role(UserRole.User), getRoom);
router.get(
    "/join/invitation/:payload",
    authenticate,
    role(UserRole.User),
    joinRoomByInvitationLink
);
router.post("/join/:id", authenticate, role(UserRole.User), joinRoom);
router.post("/game/start/:id", authenticate, role(UserRole.User), gameStart);
router.get(
    "/:id/game/cards/player",
    authenticate,
    role(UserRole.User),
    getInHandCards
);
router.get(
    "/:id/game/cards/board",
    authenticate,
    role(UserRole.User),
    getInGameCards
);

router.get(
    "/:id/game",
    authenticate,
    role(UserRole.User),
    getGame,
)

// router.get(
//     "/room/:id/players",
//     authenticate,
//     role(UserRole.User),
//     getPlayers
// );