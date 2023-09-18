import { Server } from "./server";

export interface CustomResponse {
    timeStamp: Date;
    statusCode: number;
    status: string,
    reason: string,
    message: string,
    developerMessage: string;
    // data in backend is a Map
    // so we could either get a Single server
    // or a list of servers
    data: { servers?: Server[], server?: Server };
}