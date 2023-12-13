import { Router } from 'express';
import * as feeCollectorController from '../controllers/feeCollector.controller';

const feeCollectorRouter = Router();

feeCollectorRouter.post('/events', feeCollectorController.fetchAndSaveLastEvents);
feeCollectorRouter.get('/events/:chain/:address', feeCollectorController.getEventsByIntegrator)

export default feeCollectorRouter;