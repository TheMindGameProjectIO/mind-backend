import "./env";
import "./mode";
import "./mongo";
import app from "./route";
import client, {connection} from "@/redisDB/setup";
import emailTransport from "./email";


export {
    app,
    client,
    connection,
    emailTransport,
}
