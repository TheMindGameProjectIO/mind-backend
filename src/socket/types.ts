import { ISocketAuthPayloadData } from "@/models/payload.model";
import { ISocketAuthType } from "@/utils/enum";
import { Socket } from "socket.io";
import { SocketData } from "./classes";

export interface IGameSocketData {
    player: {
        _id: string;
        nickname: string;
        cards: string[];
    },
    shootingStar: {
        voted: number;
        total: number;
        hasVoted: boolean;
        isVoting: boolean;
    };
    played?: {
        card: string;
        player: {
            _id: string;
            nickname: string;
        }
    },
    game: {
        _id: string;
        cards: string[];
        hasWon: boolean;
        hasLost: boolean;
        hasShootingStar: boolean;
        currentLevel: number;
        totalMistakes: number;
        mistakesLeft: number;
        players: {
            _id: string;
            nickname: string;
            cards: number;
            isOnline: boolean;
        }[];
    };
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

export interface ServerToClientEvents {
    "game:lost": () => void;
    "game:won": () => void;
    "auth:verified:email": () => void;
    "auth:verified:password:reset": ({ token }: { token: string }) => void;
    ping: () => void;
    pong: () => void;
    "game:created": () => void;
    message: (message: string) => void;
    response: (
        event: keyof ClientToServerEvents,
        response: { message: string; status: "success" | "fail" }
    ) => void;
    "game:lobby:changed": (gameLobby: IGameLobbySocketData) => void;
    "game:player:left": () => void;
    "game:self:left": () => void;
    "game:started": () => void;
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
    "game:player:shootingstart": () => void;
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
