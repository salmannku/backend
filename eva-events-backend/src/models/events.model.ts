import mongoose, { Types } from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
import UploadsModel from './uploads.model'
import { CommonEnums } from '../enums/common.enums'

export interface IEventsModelSchema {
  _id: Types.ObjectId
  name: string
  start_date: Date
  end_date: Date
  start_time: string
  end_time: string
  time_zone: string
  time_zone_value: string
  description: string
  featured_image: string
  event_logo: string
  venue_map_url: string
  venue_map_id: Types.ObjectId
  poster_images: Types.ObjectId[]
  venue_city: string
  venue_country: string
  venue_zip: string
  // venue_state: string
  venue_address_line_1: string
  venue_address_line_2: string
  delegates: Types.ObjectId[]
  exhibitors: Types.ObjectId[]
  speakers: Types.ObjectId[]
  media_partners: Types.ObjectId[]
  sponsors: Types.ObjectId[]
  faqs: Types.ObjectId[]
  hotels: Types.ObjectId[]
  conference_programmes: Types.ObjectId[]
  created_by: Types.ObjectId
  updated_by: Types.ObjectId
  status: string
  created_at: Date
  updated_at: Date
}

const eventsSchema: any = new mongoose.Schema<IEventsModelSchema>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: '',
      trim: true,
    },

    featured_image: {
      type: String,
      default: '',
      trim: true,
    },

    event_logo: {
      type: String,
      default: '',
      trim: true,
    },

    venue_map_url: {
      type: String,
      trim: true,
      default: '',
    },

    poster_images: [
      { type: mongoose.Schema.Types.ObjectId, ref: UploadsModel },
    ],

    venue_map_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: UploadsModel,
      default: null,
    },
    // ISO timestamp for last event date
    start_date: {
      type: Date,
      required: true,
      default: null,
    },
    end_date: {
      type: Date,
      default: null,
    },
    start_time: {
      type: String,
      required: false,
      default: null,
    },
    end_time: {
      type: String,
      required: false,
      default: null,
    },
    time_zone_value: {
      type: String,
      default: '',
	    trim: true,
    },
    time_zone: {
      type: String,
      default: '',
	  trim: true,
    },

    // Address fields
    venue_city: {
      type: String,
      default: '',

      trim: true,
    },
    venue_country: {
      type: String,
      default: '',

      trim: true,
    },
    venue_zip: {
      type: String,
      default: '',
      trim: true,
    },
    // venue_state: {
    //   type: String,
    //   default: '',
    //   trim: true,
    // },
    venue_address_line_1: {
      type: String,
      default: '',

      trim: true,
    },
    venue_address_line_2: {
      type: String,
      default: '',
      trim: true,
    },

    delegates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'delegates' }],
    exhibitors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'exhibitors' }],
    speakers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'speakers' }],
    media_partners: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'media_partners' },
    ],
    sponsors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'sponsors' }],
    faqs: [{ type: mongoose.Schema.Types.ObjectId }],
    hotels: [{ type: mongoose.Schema.Types.ObjectId }],
    conference_programmes: [{ type: mongoose.Schema.Types.ObjectId }],
    created_by: { type: mongoose.Schema.Types.ObjectId },
    updated_by: { type: mongoose.Schema.Types.ObjectId },

    // Possible statues for the admins are
    // ACTIVE, if user is active
    // DISABLED, if user is not active
    // BINNED, if admin is removed temporarily
    status: {
      type: String,
      enum: [CommonEnums.ACTIVE, CommonEnums.DISABLED, CommonEnums.BINNED],
      default: CommonEnums.ACTIVE,
    },
  },
  { timestamps: true }
)

eventsSchema.plugin(mongoosePaginate)

const EventsModel = mongoose.model<IEventsModelSchema>('events', eventsSchema)

export default EventsModel
