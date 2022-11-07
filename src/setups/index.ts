import "./mode";
import "./mongo";
import app from "./route";
import client, {connection} from "./redis";


export {
    app,
    client,
    connection,
}
