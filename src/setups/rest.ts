import express from "express";
import cors from "cors";
import {injectErrorDBHandlerToResponse, injectDefaultErrors} from "@/middlewares/error.middleware";


const app = express();
app.use(cors({
    origin: ['http://localhost:3000'],
}));
app.use(express.json());
app.use(injectErrorDBHandlerToResponse)
app.use(injectDefaultErrors)


export default app;