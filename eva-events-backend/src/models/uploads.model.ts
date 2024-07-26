import mongoose, { Types } from 'mongoose'
import { CommonEnums } from '../enums/common.enums'
import EventsModel from './events.model'

export interface IUploadsModelSchema {
  _id: Types.ObjectId
  user_id: Types.ObjectId
  event_id: Types.ObjectId
  file_name: string
  file_size: number
  file_url: string
  bucket: string
  key: string
  created_at: Date
  updated_at: Date
}

const uploadsSchema: any = new mongoose.Schema<IUploadsModelSchema>(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    event_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'events',
    },
    file_name: {
      type: String,
    },
    file_size: {
      type: Number,
    },
    file_url: {
      type: String,
    },
    bucket: {
      type: String,
    },
    key: {
      type: String,
    },
  },
  { timestamps: true }
)

const UploadsModel = mongoose.model<IUploadsModelSchema>(
  'uploads',
  uploadsSchema
)

export default UploadsModel
