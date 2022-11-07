import { Router } from 'express'
import {register, login} from "@controllers/auth.controller";
import {UserRegister} from "@validators/user.validator";
import validate from "@/middlewares/validator.middleware";

export const router = Router()

router.post('/login', login)
router.post('/register', validate(UserRegister), register)

export default router