import { Station } from '../models/station';
import { readFile } from 'fs';
import debug from 'debug';

interface jsonFormat {
    channel_name: string,
    media_definition: string,
    media_multicast_sourceip: string,
    media_multicast_ip: string,
    media_multicast_port: string,
    channel_logo: string
}
class StationProvider {
    public readonly stations: Station[] = [];
    private readonly logger = debug('iptv-restream:station');

    constructor() {
        readFile('./data/multicastadressliste.json', (err, data: Buffer) => {
            if (err) {
                this.logger(err);
                return;
            }
            const json = JSON.parse(data.toString());
            json['channellist'].forEach((channel: jsonFormat) => {
                this.stations.push(new Station(
                    `${channel.channel_name} ${channel.media_definition}`,
                    channel.media_multicast_sourceip,
                    channel.media_multicast_ip,
                    channel.media_multicast_port,
                    channel.channel_logo)
                );
            });
            this.logger('Stations loaded');
        })
    }

    public getStationByMcastGroup(mcast_group: string) {
        return this.stations.find((station: Station) => station.mcast_group === mcast_group);
    }

    public getStationByTitle(title: string) {
        return this.stations.find((station: Station) => {
            return station.title.toLowerCase().replace(/ /g, '').includes(title.toLowerCase().replace(/ /g, ''));
        });
    }
}

export default new StationProvider();