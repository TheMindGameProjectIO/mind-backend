import { Entity, Schema } from "redis-om";
import client from "../setup";

interface Card {
    gameId: string;
    playerId: string;
    value: number;
}

class Card extends Entity {
    static async create({
        gameId,
        playerId,
        value,
    }: {
        gameId: string;
        playerId: string;
        value: number;
    }) {
        const cardEntity = await cardRepository.createAndSave({
            gameId,
            playerId,
            value,
        });
        return cardEntity;
    }
}

const schema = new Schema(Card, {
    gameId: { type: "string" },
    playerId: { type: "string" },
    value: { type: "number" },
});

export const cardRepository = client.fetchRepository(schema);
await cardRepository.createIndex();
export default Card;