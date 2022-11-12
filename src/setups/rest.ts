import express from "express";
import cors from "cors";
import {injectErrorDBHandlerToResponse, injectDefaultErrors} from "@/middlewares/error.middleware";
import path from "path";
import {fileURLToPath} from "url";
import hbs from "@setups/view";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors({
    origin: ['http://localhost:3000'],

}));
app.use(express.json());
app.use(injectErrorDBHandlerToResponse)
app.use(injectDefaultErrors)

// TEMPLATE ENGINE
app.engine('handlebars', hbs.engine);
app.set('view engine', "handlebars")
app.set('views', path.join(__dirname, '../../public/views'))
app.enable('view cache');


export default app;