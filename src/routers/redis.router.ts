import { createCard } from "@controllers/redis.controller";
import { authenticate, role } from "@middlewares/auth.middleware";
import { UserRole } from "@utils/enum";
import { Router } from "express";

export const router = Router();

router.post("/card/create", authenticate, role(UserRole.Admin), createCard);
