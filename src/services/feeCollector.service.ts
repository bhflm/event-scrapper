import { Event, EventModel } from '../models/events';
import { LastIndexedBlock, LastIndexedBlockModel } from '../models/block';

export const getLastIndexedBlock = async (chainId: number): Promise<LastIndexedBlock> => {
  try {
    const result = await LastIndexedBlockModel.findOne({ chainId });
    return result;
  } catch (error) {
    console.error('Error fetching LastIndexedBlock:', error.message);
    return;
  }
};

export const saveLastIndexedBlock = async (lastIndexedBlock: number, chainId: number): Promise<LastIndexedBlock> => {
  try {
    const newBlock = await LastIndexedBlockModel.findOneAndUpdate({}, { lastIndexedBlock, chainId }, { upsert: true });
    return newBlock;
  } catch (error) {
    console.error('Error saving LastIndexedBlock:', error.message);
  }
};

export const createManyEvents = async(events: Event[]): Promise<Event[]> => {
  try {
    const newEvents = await EventModel.insertMany(events)
    return newEvents;
  } catch(err) {
    console.error('Error with createMany: ', err);
    throw (err.message);
  }
};

export const getEventsByIntegrator = async (integrator: string, chainId: number): Promise<Event[]> => {
  const events = await EventModel.find({ integrator, chainId }).exec();
  return events;
}