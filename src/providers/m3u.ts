import stationProvider from './station';

class M3UProvider {
    public generateM3U(hostname: string) {

        let m3uString = '#EXTM3U' + '\n';
        let chNum = 1;

        const stations = stationProvider.stations;
        for (const station of stations) {
            m3uString += '#EXTINF:-1';
            if (!simple) {
                m3uString += ` tvg-chno="${chNum}" tvg-name="${station.title}" tvg-logo="${station.image}" group-title="IPTV"`;
            }
            m3uString += ',' + station.title + '\n';
            m3uString += `${hostname}/live/${station.mcast_source}@${station.mcast_group}:${station.mcast_port}` + '\n';
            chNum++
        }
        return m3uString;
    }
}
export default new M3UProvider();
