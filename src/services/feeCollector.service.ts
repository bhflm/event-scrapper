import { Event, EventModel } from '../models/events';
import { LastIndexedBlock, LastIndexedBlockModel } from '../models/block';

export const getLastIndexedBlock = async (): Promise<LastIndexedBlock> => {
  try {
    console.log('getLastIndexedBlock');
    const result = await LastIndexedBlockModel.findOne({});
    console.log('Result: ', result);
    return result;
  } catch (error) {
    console.error('Error fetching LastIndexedBlock:', error.message);
    return;
  }
};

export const saveLastIndexedBlock = async (lastIndexedBlock: number): Promise<LastIndexedBlock> => {
  try {
    const newBlock = await LastIndexedBlockModel.findOneAndUpdate({}, { lastIndexedBlock }, { upsert: true });
    return newBlock;
  } catch (error) {
    console.error('Error saving LastIndexedBlock:', error.message);
  }
};

export const createEvent = async (data: { integrator: string; token: string; integratorFee: number; lifiFee: number }): Promise<Event> => {
  const event = await EventModel.create(data);
  return event;
};

export const getEventsByIntegrator = async (integrator: string): Promise<Event[]> => {
  const events = await EventModel.find({ integrator }).exec();
  return events;
}