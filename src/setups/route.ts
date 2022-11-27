import app from "./rest";
import {router as authRouter} from "@routers/auth.router";
import {router as generalRouter} from "@routers/general.router";
import {Router} from "express";


const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/general', generalRouter);

app.use("/api", apiRouter);

export default app;