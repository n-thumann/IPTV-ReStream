import { Router, Request, Response } from 'express';
import connectionProvider from '../providers/connection';
import stationProvider from '../providers/station';
import streamProvider from '../providers/stream';
import configProvider from '../providers/config';
import debug from 'debug';

const router = Router();
const logger = debug('iptv-restream:live');

router.get('/:mcast_source@:mcast_group::mcast_port', async (req: Request, res: Response) => {
	const mcast_source = req.params['mcast_source'];
	const mcast_group = req.params['mcast_group'];
	const mcast_port = parseInt(req.params['mcast_port']);
	const mcast_if = configProvider.mcast_if;

	const station = stationProvider.getStationByMcastGroup(mcast_group);
	if (!station) {
		logger(`Mcast_group "${mcast_group}" not found.`);
		if(!configProvider.allow_unknown) {
			res.status(404).send(`Mcast_group "${mcast_group}" not found.`);
			return;
		}
	}

	connectionProvider.addConnection(req.socket);
	if(station) connectionProvider.setStation(req.socket, station);
	connectionProvider.setRealIP(req.socket, req.get('X-Real-IP'));
	connectionProvider.setRealPort(req.socket, req.get('X-Real-Port'));

	const streamer = new streamProvider();
	try {
		await streamer.stream(mcast_source, mcast_group, mcast_port, mcast_if, req.socket, res);
	} catch (err) {
		res.status(500).send(`receiver): ${err}`);
	}
	connectionProvider.removeConnection(req.socket);
});

router.get('/station/:station', (req: Request, res: Response) => {
	const station = stationProvider.getStationByTitle(req.params['station']);
	if (!station) {
		res.status(404).send(`Station "${req.params['station']}" not found.`);
		return;
	}
	res.redirect(`../${station.mcast_source}@${station.mcast_group}:${station.mcast_port}`)
});

export default router;