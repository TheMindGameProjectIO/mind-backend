import { ISocketAuthPayloadData } from "@/models/payload.model";
import { ISocketAuthType } from "@/utils/enum";
import { IUser } from "@models/user.model";
import { Socket } from "socket.io";
import { SocketData } from "./classes";
import Player from "@redisDB/schemas/Player";

export interface IGameSocketData {
	playedCard: string;
	isShootingStar: boolean;
	isSmallest: boolean;
    player: {
        _id: string;
        nickname: string;
    },
    game: {
        _id: string;
        cards: string[];
        hasShootingStar: boolean;
        currentLevel: number;
        totalMistakes: number;
        mistakesLeft: number;
        players: {
            _id: string;
            nickname: string;
            cards: number;
        }[];
    };
    cards: string[];
}

export interface IGameLobbySocketData {
    name: string;
    roomId: string;
    maxUserCount: number;
    authorId: string;
    invitationLink: string;
    users: {
        _id: string;
        nickname: string;
    }[]
}

interface IGameStartSocketData {
    game: {

        _id: string;
        cards: string[];
        hasShootingStar: boolean;
        currentLevel: number;
        players: {
            _id: string;
            nickname: string;
            cards: number;
        }[];
    },
    cards: string[];

}

export interface ServerToClientEvents {
    "game:lost": () => void;
    "game:won": () => void;
    "auth:verified:email": () => void;
    "auth:verified:password:reset": ({ token }: { token: string }) => void;
    ping: () => void;
    pong: () => void;
    "game:self:joined": (gameLobby: IGameLobbySocketData) => void;
    "game:created": () => void;
    message: (message: string) => void;
    response: (
        event: keyof ClientToServerEvents,
        response: { message: string; status: "success" | "fail" }
    ) => void;
    "game:player:joined": (gameLobby: IGameLobbySocketData) => void;
    "game:player:left": () => void;
    "game:self:left": () => void;
    "game:started": (game: IGameStartSocketData) => void;
    "game:player:played": (game: IGameSocketData) => void;
    "game:self:played": (game: IGameSocketData) => void;
    "game:changed": (game: IGameSocketData) => void;
}

export interface ClientToServerEvents {
    ping: () => void;
    pong: () => void;
    "game:start": () => void;
    connection: () => void;
    "game:player:join": () => void;
    "game:player:play": (card: string) => void;
    "game:lobby:player:kick": (userId: string) => void;
}

export interface InterServerEvents {}

export type ServerToClientEvent = keyof ServerToClientEvents;

export type ClientToServerEvent = keyof ClientToServerEvents;

export type ISocket<AdditionalSocketData = {}> = Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData<AdditionalSocketData>
>;

export type IGameSocket = ISocket<ISocketAuthPayloadData[ISocketAuthType.GAME]>;
