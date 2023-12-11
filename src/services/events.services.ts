import { Event, EventModel } from '../models/events';


export const createEvent = async (data: { integrator: string; token: string; integratorFee: number; lifiFee: number }): Promise<Event> => {
  const event = await EventModel.create(data);
  return event;
};

export const getEventsByIntegrator = async (integrator: string): Promise<Event[]> => {
  const events = await EventModel.find({ integrator }).exec();
  return events;
}