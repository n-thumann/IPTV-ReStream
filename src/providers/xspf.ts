import * as xml2js from 'xml2js';
import stationProvider from './station';

interface Station {
    title: string,
    location: string,
    image: string
}
class XSPFProvider {
    public generateXSPF(hostname: string) {
            const content = {
                playlist: {
                    $: {
                        version: '1',
                        xmlns: 'http://xspf.org/ns/0/'
                    },
                    title: 'IPTV-ReStream',
                    creator: 'Nicolas Thumann',
                    info: 'https://n-thumann.de/',
                    trackList: {
                        track: [] as Station[]
                    }
                }
            }
            const stations = stationProvider.stations;
            for (const station of stations) {
                content['playlist']['trackList']['track'].push({
                    title: station.title,
                    location: `${hostname}/live/${station.mcast_source}@${station.mcast_group}:${station.mcast_port}`,
                    image: station.image
                });
            }
            return new xml2js.Builder().buildObject(content);
    }
}
export default new XSPFProvider();