import mongoose, { Types } from 'mongoose'
import { CommonEnums } from '../enums/common.enums'
import EventsModel from './events.model'
import conferenceProgramsModel from './conference_programms.model'
import mongoosePaginate from 'mongoose-paginate-v2'

export interface IConferenceProgrammeAttendeesModelSchema {
  conference_programme: Types.ObjectId
  event: Types.ObjectId
  user: Types.ObjectId
  user_type: string
  user_first_name: string
  user_last_name: string
  user_email: string
  conference_date: Date
  conference_start_time: Date
  conference_end_time: Date
  add_to_calender: boolean
  status: string
  _id: Types.ObjectId
}

const conferenceProgrammeAttendeesSchema =
  new mongoose.Schema<IConferenceProgrammeAttendeesModelSchema>(
    {
      // Reference to conference programme
      conference_programme: {
        type: mongoose.Schema.Types.ObjectId,
        ref: conferenceProgramsModel,
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

      // Reference to event
      event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: EventsModel,
      },

      conference_date: {
        type: Date,
        required: true,
        default: null,
      },

      conference_start_time: {
        type: Date,
        required: true,
        default: null,
      },

      conference_end_time: {
        type: Date,
        required: true,
        default: null,
      },

      add_to_calender: {
        type: Boolean,
        default: false,
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

      // Possible statues for the roles are
      // ACTIVE, if active
      // DISABLED, if not active
      // BINNED, if removed temporarily
      status: {
        type: String,
        enum: [
          CommonEnums.status.ACTIVE,
          CommonEnums.status.DISABLED,
          CommonEnums.status.BINNED,
        ],
        default: CommonEnums.status.ACTIVE,
      },
    },
    { timestamps: true }
  )

conferenceProgrammeAttendeesSchema.plugin(mongoosePaginate)

const ConferenceProgrammeAttendeesModel =
  mongoose.model<IConferenceProgrammeAttendeesModelSchema>(
    'conference_programme_attendees',
    conferenceProgrammeAttendeesSchema
  )

export default ConferenceProgrammeAttendeesModel
