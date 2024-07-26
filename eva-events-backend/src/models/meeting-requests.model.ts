import mongoose, { Types } from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
import { CommonEnums } from '../enums/common.enums'
import EventsModel from './events.model'
import EventLocationsModel, {
  IEventLocationsModelSchema,
} from './event-locations.model'
import CompaniesModel from './companies.model'

export interface IMeetingRecipientUserDetails {
  first_name: string
  avatar: string
  last_name: string
  user_id: string
  user_type: string
  email: string
  company_name: string
  company_id: string
  meeting_status: string
}

export interface IMeetingRequestsModelSchema {
  _id: Types.ObjectId
  group_meetings: Types.ObjectId[]
  requestor: Types.ObjectId
  requestor_user_type: string
  requestor_first_name: string
  requestor_last_name: string
  requestor_email: string
  requestor_company_name: string
  requestor_company_id: Types.ObjectId
  requested_users_details: IMeetingRecipientUserDetails[]
  requested_users: Types.ObjectId[]
  meeting_notes: string
  meeting_date: Date
  meeting_start_time: Date
  meeting_end_time: Date
  converted_start_time: string
  converted_end_time: string
  meeting_status: string
  meeting_location: IEventLocationsModelSchema
  event: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const meetingRequestsSchema: any =
  new mongoose.Schema<IMeetingRequestsModelSchema>(
    {
      requestor: {
        type: mongoose.Schema.Types.ObjectId,
      },
      requestor_user_type: {
        type: String,
        required: true,
        trim: true,
      },
      requestor_first_name: {
        type: String,
        default: '',
        trim: true,
      },
      requestor_last_name: {
        type: String,
        default: '',
        trim: true,
      },
      requestor_email: {
        type: String,
        default: '',
        trim: true,
      },
      requestor_company_name: {
        type: String,
        default: '',
        trim: true,
      },
      requestor_company_id: {
        type: mongoose.Schema.Types.ObjectId,
        model: CompaniesModel,
      },
      requested_users: [
        {
          type: mongoose.Schema.Types.ObjectId,
        },
      ],
      requested_users_details: [
        {
          first_name: {
            type: String,
            default: '',
            trim: true,
          },
          last_name: {
            type: String,
            default: '',
            trim: true,
          },
          avatar: {
            type: String,
            default: '',
            trim: true,
          },
          email: {
            type: String,
            default: '',
            trim: true,
          },
          company_name: {
            type: String,
            default: '',
            trim: true,
          },
          company_id: {
            type: String,
            default: '',
            trim: true,
          },
          user_id: {
            type: String,
            default: '',
            trim: true,
          },
          user_type: {
            type: String,
            enum: [
              CommonEnums.users.delegate,
              CommonEnums.users.exhibitor,
              CommonEnums.users.media_partner,
              CommonEnums.users.speaker,
              CommonEnums.users.sponsor,
            ],
            default: '',
          },
          meeting_status: {
            type: String,
            enum: [
              CommonEnums.meetingStatus.accepted,
              CommonEnums.meetingStatus.pending,
              CommonEnums.meetingStatus.declined,
              CommonEnums.meetingStatus.rescheduled,
              CommonEnums.meetingStatus.cancelled,
            ],
            default: CommonEnums.meetingStatus.pending,
          },
        },
      ],
      group_meetings: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'meeting_requests',
        },
      ],

      event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: EventsModel,
      },
      meeting_notes: {
        type: String,
        default: '',
        trim: true,
      },
      meeting_location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: EventLocationsModel,
      },
      meeting_date: {
        type: Date,
        default: null,
      },
      meeting_start_time: {
        type: Date,
        default: null,
      },
      meeting_end_time: {
        type: Date,
        default: null,
      },
      converted_start_time: {
	  	type: String,
	    required: false,
	    default: null,
	  },
	  converted_end_time: {
	  	type: String,
	    required: false,
	    default: null,
	  },
	  meeting_status: {
        type: String,
        enum: [
          CommonEnums.meetingStatus.accepted,
          CommonEnums.meetingStatus.pending,
          CommonEnums.meetingStatus.declined,
          CommonEnums.meetingStatus.rescheduled,
          CommonEnums.meetingStatus.cancelled,
        ],
        default: CommonEnums.meetingStatus.pending,
      },
    },
    {
      timestamps: true,
    }
  )

meetingRequestsSchema.plugin(mongoosePaginate)

const MeetingRequestsModel = mongoose.model<IMeetingRequestsModelSchema>(
  'meeting_requests',
  meetingRequestsSchema
)

export default MeetingRequestsModel
