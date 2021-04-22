import express from 'express';
import * as path from 'path';
import morgan from 'morgan';
import http from 'http';
import debug from 'debug';
import indexRouter from './routes/index';
import statusRouter from './routes/status';
import liveRouter from './routes/live';
import stationRouter from './routes/station';
import configProvider from './providers/config';
import { SignalConstants } from 'node:os';

const app = express();
const logger = debug('iptv-restream:server');
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

app.use(morgan('combined'))
app.use(express.static(path.join(__dirname, '../public')));

app.use('/', indexRouter);
app.use('/status', statusRouter);
app.use('/stations', stationRouter);
app.use('/live', liveRouter);

const host = configProvider.host;
const port = configProvider.port;

const server = http.createServer(app);
server.listen({ port: port, host: host});
server.on('error', (err: Error) => {
    logger(`Error: ${err}`);
});
server.on('listening', () => {
    logger(`Listening on port ${host}:${port}...`);
});

process.on('SIGINT', exit);
process.on('SIGTERM', exit);
function exit(signal: SignalConstants) {
    logger(`${signal} received. Exiting.`);
    server.close();
}

module.exports = app;
