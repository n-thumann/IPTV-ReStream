import { Router, Request, Response } from 'express';
import stationProvider from '../providers/station';
import xspfProvider from '../providers/xspf';
import config from '../providers/config';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    res.render('stations', {
        stations: stationProvider.stations,
        protocol: config.xspf_protocol,
        host: config.xspf_host || req.get('X-Forwarded-Host') || req.get('Host'),
        pathPrefix: config.xspf_pathPrefix
    });
});

router.get('/download', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/xspf+xml');
    res.setHeader('Content-Disposition', 'attachment; filename="IPTV-ReStream.xspf"');
    const protocol = config['xspf_protocol'] || req.protocol;
    const host = config.xspf_host || req.get('X-Forwarded-Host') || req.get('Host');
    const pathPrefix = config.xspf_pathPrefix;
    res.write(xspfProvider.generateXSPF(`${protocol}://${host}${pathPrefix}`));
    res.end();
});

export default router;