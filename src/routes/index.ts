import { Router, Request, Response } from 'express';

const router = Router()

router.get('/', async function(req: Request, res: Response) {
  res.redirect('status')
});

export default router;
