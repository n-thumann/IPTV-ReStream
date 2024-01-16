import { Socket } from 'net';
import { Response } from 'express';
import connectionProvider from './connection';
import configProvider from '../providers/config';
import dgram from 'dgram';
import debug from 'debug';

class StreamProvider {
    private readonly logger = debug('iptv-restream:receiver');

    public async stream(mcast_source: string, mcast_group: string, mcast_port: number, mcast_if: string, socket: Socket, res: Response): Promise<void> {
        return new Promise((resolve, reject) => {
            this.logger(`Client requested ${mcast_source}@${mcast_group}:${mcast_port}.`);
            const receiver = dgram.createSocket({ type: 'udp4', reuseAddr: true });

            const timeout = setTimeout(() => {
                this.logger('data reception timed out')
                reject('data reception timed out')
            }, configProvider.receiver_timeout * 1_000);

            receiver.on('error', (err: Error) => {
                this.logger(`Error (receiver): ${err}`);
                reject(`Error (receiver): ${err}`);
            });

            if(process.platform === 'win32') {
                receiver.bind(mcast_port);    
            } else {
                receiver.bind(mcast_port, mcast_group);
            }
            receiver.on('listening', () => {
                this.logger(`adding SSM for ${mcast_source}@${mcast_group}:${mcast_port} using ${mcast_if}`);
                receiver.addSourceSpecificMembership(mcast_source, mcast_group, mcast_if);
            });

            receiver.on('message', (message: Buffer) => {
                // https://en.wikipedia.org/wiki/Real-time_Transport_Protocol
                // https://en.wikipedia.org/wiki/MPEG_transport_stream
                // https://www.etsi.org/deliver/etsi_en/300400_300499/300468/01.14.01_60/en_300468v011401p.pdf - 5.2.4 Event Information Table, 6.2.37 Short event descriptor

                const mpegtsPacket = Buffer.from(message).slice(12);
                res.write(mpegtsPacket);
                timeout.refresh();

                const packetCount = mpegtsPacket.length / 188;
                for (let packetNumber = 0; packetNumber < packetCount; packetNumber++) {
                    const offset = packetNumber * 188 + 4 + 1;
                    const header = mpegtsPacket.readUInt32BE(packetNumber * 188);
                    const payloadUnitStartIndicator = (header & 0x400000) !== 0;
                    const pid = (header & 0x1fff00) >>> 8;
                    if (pid == 0x12 && payloadUnitStartIndicator) {
                        const event_information_section6 = mpegtsPacket.readUInt32BE(offset + 24);
                        const running_status = (event_information_section6 & 0xE0000000) >>> 29;
                        if (running_status !== 4)
                            continue;
                        const descriptor = mpegtsPacket.readUInt32BE(offset + 26);
                        const descriptor_tag = (descriptor & 0xFF000000) >> 24;
                        if (descriptor_tag !== 0x4D)
                            continue;
                        const event_information_section8 = mpegtsPacket.readUInt32BE(offset + 30);
                        const event_name_length = (event_information_section8 & 0xFF0000) >> 16;
                        let event_name = mpegtsPacket.slice(offset + 32, offset + 32 + event_name_length);
                        if (event_name[0] === 0x05) {
                            event_name = event_name.slice(1, event_name.length);
                        }
                        let event_name_string = '';
                        for (let i = 0; i < event_name_length; i++) {
                            event_name_string += String.fromCharCode(event_name[i]);
                        }
                        try {
                            this.logger(`Received program for ${mcast_source}@${mcast_group}:${mcast_port}: "${event_name_string}"`)
                            connectionProvider.setProgram(socket, event_name_string);
                        } catch (error) {
                            this.logger(`Could not set program "${event_name_string}" for socket. Probably already disconnected?`);
                        }
                    }
                }
            });

            socket.on('close', () => {
                receiver.close();
                clearTimeout(timeout);
                this.logger(`Client ${socket.remoteAddress}:${socket.remotePort} disconnected. Closing receiver.`);
                resolve();
            });
        });
    }
}

export default StreamProvider;