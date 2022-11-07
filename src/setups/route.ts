import app from "./rest";
import {router as authRouter} from "@routers/auth.router";
import {Router} from "express";


const apiRouter = Router();

apiRouter.use('/auth', authRouter);

app.use("/api", apiRouter);

export default app;