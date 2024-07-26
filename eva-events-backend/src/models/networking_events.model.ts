import mongoose, { Date, Types } from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
import { AdminStatus } from '../utils/adminEnums'
import EventsModel from './events.model'

export interface networkingEventsModelSchema {
  event_name: string
  location: string
  theme: string
  label_for_input_field: string
  date: Date
  start_time: Date
  end_time: Date
  description: string
  notes: string
  status: string
  user_input_field: boolean
  add_to_calender: boolean
  events: Types.ObjectId[]
}

const networkingEventsSchema: any =
  new mongoose.Schema<networkingEventsModelSchema>(
    {
      event_name: {
        type: String,
        required: true,
        trim: true,
      },
      location: {
        type: String,
        trim: true,
      },
      theme: {
        type: String,
        trim: true,
      },
      date: {
        type: Date,
        required: true,
        trim: true,
      },
      start_time: {
        type: Date,
        required: true,
        trim: true,
      },
      end_time: {
        type: Date,
        required: true,
        trim: true,
      },
      description: {
        type: String,
        default: '',
        trim: true,
      },
      notes: {
        type: String,
        default: '',
        trim: true,
      },
      label_for_input_field: {
        type: String,
        default: '',
        trim: true,
      },
      user_input_field: {
        type: Boolean,
      },
      add_to_calender: {
        type: Boolean,
        default: false,
      },

      // Reference to events
      events: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: EventsModel,
        },
      ],

      status: {
        type: String,
        enum: [AdminStatus.ACTIVE, AdminStatus.DISABLED, AdminStatus.BINNED],
        default: AdminStatus.ACTIVE,
      },
    },
    {
      timestamps: true,
    }
  )

networkingEventsSchema.plugin(mongoosePaginate)

const networkingEventsModel = mongoose.model<networkingEventsModelSchema>(
  'networking_events',
  networkingEventsSchema
)

export default networkingEventsModel
