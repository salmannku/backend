import mongoose, { Date, Types } from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
import EventsModel from './events.model'
import { CommonEnums } from '../enums/common.enums'
import networkingEventsModel from './networking_events.model'

export interface networkingEventSchedulesModelSchema {
  _id: Types.ObjectId
  user: Types.ObjectId
  user_type: string
  user_first_name: string
  user_last_name: string
  user_email: string
  networking_event_name: string
  networking_event_date: Date
  networking_event_start_time: Date
  networking_event_end_time: Date
  event: Types.ObjectId
  networking_event: Types.ObjectId
}

const networkingEventSchedulesSchema: any =
  new mongoose.Schema<networkingEventSchedulesModelSchema>(
    {
      networking_event_name: {
        type: String,
        required: true,
        trim: true,
      },

      // Reference to user
      user: {
        type: mongoose.Schema.Types.ObjectId,
      },

      user_first_name: {
        type: String,
        default: '',
        trim: true,
      },

      user_last_name: {
        type: String,
        default: '',
        trim: true,
      },

      user_email: {
        type: String,
        default: '',
        trim: true,
      },

      networking_event_date: {
        type: Date,
        required: true,
        trim: true,
      },
      networking_event_start_time: {
        type: Date,
        required: true,
        trim: true,
      },
      networking_event_end_time: {
        type: Date,
        required: true,
        trim: true,
      },

      user_type: {
        type: String,
        enum: [
          CommonEnums.users.delegate,
          CommonEnums.users.exhibitor,
          CommonEnums.users.sponsor,
          CommonEnums.users.speaker,
          CommonEnums.users.media_partner,
        ],
      },

      // Reference to event
      event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: EventsModel,
      },

      // Reference to networking event
      networking_event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: networkingEventsModel,
      },
    },
    {
      timestamps: true,
    }
  )

networkingEventSchedulesSchema.plugin(mongoosePaginate)

const NetworkingEventSchedulesModel =
  mongoose.model<networkingEventSchedulesModelSchema>(
    'networking_event_schedules',
    networkingEventSchedulesSchema
  )

export default NetworkingEventSchedulesModel
