import app from "./rest";
import {router as authRouter} from "@routers/auth.router";
import {router as generalRouter} from "@routers/general.router";
import {router as gameRouter} from "@routers/game.router";
import {Router} from "express";


const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/general', generalRouter);
apiRouter.use('/game', gameRouter);

app.use("/api", apiRouter);

export default app;