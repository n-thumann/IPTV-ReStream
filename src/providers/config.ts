const debug = require('debug')('iptv-restream:config')

class ConfigProvider {
    readonly host: string = '';
    readonly port: number;
    readonly xspf_protocol: string = '';
    readonly xspf_host: string = '';
    readonly xspf_pathPrefix: string =  '';
    readonly allow_unknown: boolean;

    constructor() {
        this.host = process.env.HOST || '127.0.0.1';
        this.port = parseInt(process.env.PORT || '3000');
        this.xspf_protocol = process.env.XSPF_PROTOCOL || '';
        this.xspf_host = process.env.XSPF_HOST || '';
        this.xspf_pathPrefix = process.env.XSPF_PATH_PREFIX || '';
        this.allow_unknown = (process.env.ALLOW_UNKNOWN === 'true' || process.env.ALLOW_UNKNOWN === '1') ? true : false;
        debug(`Config loaded: HOST=${this.host}, PORT=${this.port}, XSPF_PROTOCOL=${this.xspf_protocol}, XSPF_HOST=${this.xspf_host}, XSPF_PATH_PREFIX=${this.xspf_pathPrefix}, ALLOW_UNKNOWN=${this.allow_unknown}`);
    }
}
export default new ConfigProvider();