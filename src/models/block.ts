import { prop, getModelForClass } from '@typegoose/typegoose'

export class LastIndexedBlock {
  @prop({ required: true, default: 0 })
  lastIndexedBlock!: number

  @prop({ required: true })
  chainId!: number
}

export const LastIndexedBlockModel = getModelForClass(LastIndexedBlock)
