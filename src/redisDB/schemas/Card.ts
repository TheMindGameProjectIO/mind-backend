import client from "../setup";
import { Entity, Schema } from "redis-om";

export default class Card extends Entity {
    gameId: string;
    playerId: string;
    value: number;
}

const schema = new Schema(Card, {
    gameId: { type: "string" },
    playerId: { type: "string" },
    value: { type: "number" },
});

const cardRepository = client.fetchRepository(schema);
await cardRepository.createIndex();

export { cardRepository };
