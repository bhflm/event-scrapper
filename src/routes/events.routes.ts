import { Router } from 'express';
import * as eventsController from '../controllers/events.controllers';

const eventsRouter = Router();

eventsRouter.post('/events', eventsController.fetchFeeCollectorEvents);
// @@ OPTIONAL 1
// eventsRouter.get('/events', eventsController.getFeeCollectorEvents)

export default eventsRouter;