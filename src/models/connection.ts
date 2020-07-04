import { Socket } from 'net';
import { Station } from './station';

export class Connection {
    readonly socket: Socket;
    readonly since: number = 0;
    public station?: Station;
    public program = 'Unknown';
    public realIP?: string;
    public realPort?: number;

    constructor(socket: Socket) {
        this.socket = socket;
        this.since = new Date().getTime();
    }
}
export interface UIConnection {
    localAddress: string,
    localPort: number,
    remoteAddress: string,
    remotePort: number,
    realIP?: string,
    realPort?: number,
    bytesRead: number,
    bytesWritten: number,
    mBits: string,
    since: number,
    station?: Station,
    program: string
}