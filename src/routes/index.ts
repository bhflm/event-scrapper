import { Router } from 'express'
import eventsRouter from './feeCollector'

const router = Router()

router.use(eventsRouter)

export default router
