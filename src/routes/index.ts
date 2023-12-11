import { Router, Request, Response } from 'express';
import eventsRouter from './events.routes';

const router = Router();

router.use(eventsRouter);

export default router;