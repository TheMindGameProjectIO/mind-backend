import "./env";
import "./mode";
import "./mongo";
import app from "./route";
import client, {connection} from "@/redisDB/setup";
import emailTransport from "./email";

import Player from "@/redisDB/schemas/Player";
await Player.disconnectAll();

export {
    app,
    client,
    connection,
    emailTransport,
}
