import mongoose, { Types } from 'mongoose'
import { CommonEnums } from '../enums/common.enums'
import EventsModel from './events.model'

export interface IMeetingManagementsModelSchema {
  event: Types.ObjectId
  user: Types.ObjectId
  user_type: string
  availability: string
  one_to_one_meeting_coordinator_name: string
  one_to_one_meeting_coordinator_email: string
  suggestions: string
  status: string
}

const meetingManagementsSchema =
  new mongoose.Schema<IMeetingManagementsModelSchema>(
    {
      // Reference to user
      user: {
        type: mongoose.Schema.Types.ObjectId,
      },

      // Reference to event
      event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: EventsModel,
        default: null,
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

      // Meeting management fields
      availability: {
        type: String,
        default: '',
        trim: true,
      },
      one_to_one_meeting_coordinator_name: {
        type: String,
        default: '',
        trim: true,
      },
      one_to_one_meeting_coordinator_email: {
        type: String,
        default: '',
        trim: true,
      },
      suggestions: {
        type: String,
        default: '',
        trim: true,
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

const MeetingManagementModel = mongoose.model<IMeetingManagementsModelSchema>(
  'meeting_managements',
  meetingManagementsSchema
)

export default MeetingManagementModel
