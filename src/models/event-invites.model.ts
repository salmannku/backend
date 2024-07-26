import mongoose, { Types } from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
import EventsModel from './events.model'

export interface IEventInvitesModelSchema {
  user_id: Types.ObjectId
  event_id: Types.ObjectId
  user_type: string
  invitation_username: string
  invitation_password: string
  last_login: Date
  createdAt: Date
  updatedAt: Date
}

const eventInvitesSchema: any = new mongoose.Schema<IEventInvitesModelSchema>(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    event_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: EventsModel,
    },
    user_type: {
      type: String,
      required: true,
      trim: true,
    },
    invitation_username: {
      type: String,
      required: true,
      trim: true,
    },
    invitation_password: {
      type: String,
      required: true,
      trim: true,
    },
    
    // ISO timestamp for last login date
    last_login: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
)

eventInvitesSchema.plugin(mongoosePaginate)

const EventInvitesModel = mongoose.model<IEventInvitesModelSchema>(
  'event_invites',
  eventInvitesSchema
)

export default EventInvitesModel
