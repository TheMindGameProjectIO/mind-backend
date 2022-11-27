import {Client, Repository} from "redis-om";
import { createClient } from 'redis';
import env from "../utils/env"


export const connection = createClient({ url: env.REDIS_DB_URL, legacyMode: true });
await connection.connect()

const client = await new Client().use(connection)

export default client