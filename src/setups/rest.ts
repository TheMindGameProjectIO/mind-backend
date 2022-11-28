import express from "express";
import cors from "cors";
import morgan from "morgan";
import compression from "compression";
import session, { SessionOptions } from "express-session";
import { injectErrorDBHandlerToResponse, injectDefaultErrors } from "@/middlewares/error.middleware";
import path from "path";
import { fileURLToPath } from "url";
import hbs from "@setups/view";
import env from "@/utils/env";
import connectRedis from 'connect-redis';
import { connection } from "./redis";
import { getValuesFromEnum, Header } from "@/utils/enum";

const RedisStore = connectRedis(session);

const app = express();
app.use(compression());
app.use(morgan("combined"));

var sess: SessionOptions = {
    secret: env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    store: new RedisStore({ client: connection }),
    cookie: {
        secure: false,
    },
};

// if (env.IS_PROD) {
//     app.set("trust proxy", 1); // trust first proxy
//     sess.cookie.secure = true; // serve secure cookies
// }

app.use(session(sess));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
    cors({
        origin: ["http://localhost:3000"],
        allowedHeaders: ["Content-Type", ...getValuesFromEnum(Header)],
    })
);

app.use(express.json());
app.use(injectErrorDBHandlerToResponse);
app.use(injectDefaultErrors);

// TEMPLATE ENGINE
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "../../public/views"));
app.enable("view cache");

export default app;
