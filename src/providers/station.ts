import Station from "../models/station";
import { readFile } from "fs";
import util from "util";
const debug = require('debug')('iptv-restream:station')

class StationProvider {
    readonly stations: Station[] = [];

    constructor() {
        readFile('./data/multicastadressliste.json', (err, data: Buffer) => {
            if (err) {
                debug(err);
                return;
            }
            const json = JSON.parse(data.toString());
            const imageProxyFormat = json['imagescalingurl'];
            json['channellist'].forEach((channel: any) => {
                this.stations.push(new Station(`${channel['channel_name']} ${channel['media_definition']}`,
                    channel['media_multicast_sourceip'],
                    channel['media_multicast_ip'],
                    channel['media_multicast_port'],
                    util.format(imageProxyFormat, 30, channel['channel_logo']))
                );
            });
            debug("Stations loaded");
        })
    }

    public getStationByMcastGroup(mcast_group: string) {
        return this.stations.find((station: Station) => {
            return station.mcast_group === mcast_group;
        });
    }

    public getStationByTitle(title: string) {
        return this.stations.find((station: Station) => {
            console.log(station.title.toLowerCase().replace(/ /g, ''), title.toLowerCase().replace(/ /g, ''));
            return station.title.toLowerCase().replace(/ /g, '').includes(title.toLowerCase().replace(/ /g, ''));
        });
    }
};

export default new StationProvider();