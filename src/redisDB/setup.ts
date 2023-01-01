import { Client } from "redis-om";
import { createClient } from "redis";
import env from "@utils/env";

const connection = createClient({
  url: env.REDIS_DB_LOCAL_URL,
  legacyMode: true,
});
await connection.connect();

const client = await new Client().use(connection).catch();

export default client;
export { connection };
