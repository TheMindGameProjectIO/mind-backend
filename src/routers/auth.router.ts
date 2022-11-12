import {Router} from 'express'
import {login, me, register, verify} from "@controllers/auth.controller";
import {UserRegister} from "@validators/user.validator";
import validate from "@middlewares/validator.middleware";
import {authenticate, role} from "@middlewares/auth.middleware";
import {UserRole} from "@utils/enum";

export const router = Router()

router.post('/login', login);
router.post('/register', validate(UserRegister), register);
router.get('/me', authenticate, role(UserRole.Guest), me);
router.get('/verify/:token', verify);

export default router