import { Event, EventModel } from '../models/events'
import { LastIndexedBlock, LastIndexedBlockModel } from '../models/block'

export const getLastIndexedBlock = async (
  chainId: number
): Promise<LastIndexedBlock> => {
  try {
    const result = await LastIndexedBlockModel.findOne({ chainId })
    return result
  } catch (error) {
    console.error('Error fetching LastIndexedBlock:', error.message)
    throw error
  }
}

export const saveLastIndexedBlock = async (
  lastIndexedBlock: number,
  chainId: number
): Promise<LastIndexedBlock> => {
  try {
    const savedBlock = await LastIndexedBlockModel.findOneAndUpdate(
      { chainId },
      { lastIndexedBlock, chainId },
      { upsert: true, new: true }
    )
    return savedBlock
  } catch (error) {
    console.error('Error saving LastIndexedBlock:', error.message)
    throw error
  }
}

export const createManyEvents = async (events: Event[]): Promise<Event[]> => {
  try {
    const newEvents = await EventModel.insertMany(events)
    return newEvents
  } catch (error) {
    console.error('Error with createMany: ', error)
    throw error
  }
}

export const getEventsByIntegrator = async (
  integrator: string,
  chainId: number
): Promise<Event[]> => {
  try {
    const events = await EventModel.find({ integrator, chainId }).exec()
    return events
  } catch (error) {
    console.error('Error by getEventsByIntegrator: ', error)
    throw error
  }
}
