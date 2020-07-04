import { Station } from '../models/station';
import { Connection, UIConnection } from '../models/connection';
import { Socket } from 'net';
import debug from 'debug';

class ConnectionProvider {
    private connections: Connection[] = []
    private readonly logger = debug('iptv-restream:live');

    public addConnection(socket: Socket) {
        this.connections.push(new Connection(socket))
    }

    public removeConnection(socket: Socket) {
        const index = this.connections.findIndex((connection) => {
            return connection.socket === socket;
        });
        if (index != -1) {
            this.connections.splice(index, 1);
        } else {
            this.logger(`Could remove connection (wrong index)`);
        }
    }

    public getConnections() {
            const connections: UIConnection[] = [];
            this.connections.forEach((connection) => {
                const currentSocket = connection.socket;
                connections.push({
                    'localAddress': currentSocket.localAddress,
                    'localPort': currentSocket.localPort,
                    'remoteAddress': currentSocket.remoteAddress ?? '',
                    'remotePort': currentSocket.remotePort ?? 0,
                    'realIP': connection.realIP,
                    'realPort': connection.realPort,
                    'bytesRead': currentSocket.bytesRead,
                    'bytesWritten': currentSocket.bytesWritten,
                    'mBits': (((currentSocket.bytesWritten + currentSocket.bytesRead) / 1e6 * 8) / ((new Date().getTime() - connection.since) / 1000)).toFixed(2),
                    'since': connection.since,
                    'station': connection.station,
                    'program': connection.program
                });
        });
        return connections;
    }

    private findConnection(socket: Socket): Connection {
        const conn = this.connections.find((connection) => {
            return (connection.socket === socket);
        });
        if(conn) {
            return conn;
        } else {
            throw Error('No connection found!');
        }
    }

    public setStation(socket: Socket, station: Station) {
        this.findConnection(socket).station = station;
    }

    public setProgram(socket: Socket, program: string) {
        this.findConnection(socket).program = program;
    }

    public setRealIP(socket:Socket, realIP: string | undefined) {
        if(realIP) this.findConnection(socket).realIP = realIP;
    }

    public setRealPort(socket:Socket, realPort: string | undefined) {
        if(realPort) this.findConnection(socket).realPort = parseInt(realPort);
    }

}

export default new ConnectionProvider();