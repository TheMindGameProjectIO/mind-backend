import app from "./rest";
import {router as authRouter} from "@routers/auth.router";
import {router as generalRouter} from "@routers/general.router";
import {router as gameRouter} from "@routers/game.router";
import {router as redisRouter} from "@routers/redis.router";
import {Router} from "express";


const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/general', generalRouter);
apiRouter.use('/room', gameRouter);
apiRouter.use('/redis', redisRouter);

app.use("/api", apiRouter);

export default app;