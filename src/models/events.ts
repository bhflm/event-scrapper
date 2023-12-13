import { prop, getModelForClass } from "@typegoose/typegoose";

export class Event {
  @prop({ required: true })
  public integrator!: string;

  @prop({ required: true })
  public token!: string;

  @prop({ required: true })
  public integratorFee!: string;

  @prop({ required: true})
  public lifiFee!: string; // bigNumber <> String 
}

export const EventModel = getModelForClass(Event);