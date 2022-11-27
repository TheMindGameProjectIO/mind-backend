import validate from "@middlewares/validator.middleware";
import { ContactUsForm } from "@validators/general.validator";
import { contactus } from "@controllers/general.controller";
import { Router } from "express";

export const router = Router();

router.post("/contactus", validate(ContactUsForm), contactus);
