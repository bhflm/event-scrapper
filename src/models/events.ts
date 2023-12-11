import { prop, getModelForClass } from "@typegoose/typegoose";

export class Event {
  @prop({ required: true })
  public integrator!: string;

  @prop({ required: true })
  public token!: string;

  @prop({ required: true })
  public integratorFee!: number;

  @prop({ required: true})
  public lifiFee!: number;
}

export const EventModel = getModelForClass(Event);