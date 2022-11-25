import express from "express";
import cors from "cors";
import session, { SessionOptions } from "express-session"
import { injectErrorDBHandlerToResponse, injectDefaultErrors } from "@/middlewares/error.middleware";
import path from "path";
import { fileURLToPath } from "url";
import hbs from "@setups/view";
const app = express();

var sess: SessionOptions = {
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
    }
}

if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
    sess.cookie.secure = true // serve secure cookies
}

app.use(session(sess))

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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