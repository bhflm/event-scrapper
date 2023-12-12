import { Router } from 'express';
import * as feeCollectorController from '../controllers/feeCollector.controller';

const feeCollectorRouter = Router();

feeCollectorRouter.post('/events', feeCollectorController.fetchAndSaveLastEvents);
// @@ OPTIONAL 1
// feeCollectorRouter.get('/events', eventsController.getFeeCollectorEvents)

export default feeCollectorRouter;