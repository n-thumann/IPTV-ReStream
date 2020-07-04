import { Router, Request, Response } from 'express';
import connectionProvider from '../providers/connection';
const router = Router();

router.get('/', function(req: Request, res: Response) {
  const connections = connectionProvider.getConnections();
  res.render('status', { connections: connections });
});

export default router;
