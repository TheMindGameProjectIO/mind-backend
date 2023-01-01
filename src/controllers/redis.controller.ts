import Card from "@/redisDB/schemas/Card";
import { Request, Response } from "express";

export async function createCard (req: Request<{}, {}, {gameId: string, playerId: string, value: 1}>, res: Response){
    const { gameId, playerId, value } = req.body;
    const card = await Card.create({ gameId, playerId, value });
    console.log(card);
    res.send(card.toJSON());
}