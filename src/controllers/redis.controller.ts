import { Request, Response } from "express";

export async function createCard (req: Request<{}, {}, {gameId: string, playerId: string, value: 1}>, res: Response){
    res.send({});
}