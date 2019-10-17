import { Socket } from 'net';
import Station from './station';

class Connection {
    readonly socket: Socket;
    readonly since: number = 0;
    public station?: Station;
    public program: string = "Unknown";
    public realIP?: string;
    public realPort?: number;

    constructor(socket: Socket) {
        this.socket = socket;
        this.since = new Date().getTime();
    }
}

export default Connection;