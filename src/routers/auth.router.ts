import {Router} from 'express'
import {login, me, register, verify, passwordChange, passwordReset, passwordResetToken, test} from "@controllers/auth.controller";
import {UserLogin, UserRegister} from "@validators/user.validator";
import validate from "@middlewares/validator.middleware";
import {authenticate, role} from "@middlewares/auth.middleware";
import {UserRole} from "@utils/enum";

export const router = Router()

router.post('/login', validate(UserLogin), login);
router.post('/register', validate(UserRegister), register);
router.get('/me', authenticate, role(UserRole.Guest), me);
router.get('/verify/:token', verify);
router.post('/password/reset/token', passwordResetToken);
router.post('/password/reset/:token', passwordReset);
router.post('/password/change', passwordChange);
router.get('/test', test);


export default router;