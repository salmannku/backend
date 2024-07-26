import mongoose, { Date, Types } from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
import { AdminStatus } from '../utils/adminEnums'
import EventsModel from './events.model'
import UploadsModel from './uploads.model'

export interface IHotelsModelSchema {
  hotel_name: string
  description: string
  hotel_email: string
  phone: string
  phone_country_code: string
  city: string
  country: string
  zip: string
  address_line_1: string
  address_line_2: string
  hotel_url: string
  status: string
  hotel_images: Types.ObjectId[]
  events: Types.ObjectId[]
}

const hotelsSchema: any = new mongoose.Schema<IHotelsModelSchema>({
  hotel_name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  hotel_url: {
    type: String,
    trim: true,
  },
  hotel_email: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    default: '',
  },
  phone_country_code: {
    type: String,
    default: '',
  },

  // Address fields
  city: {
    type: String,
    default: '',
    trim: true,
  },
  country: {
    type: String,
    required: true,
    trim: true,
  },
  zip: {
    type: String,
    default: '',
    trim: true,
  },
  address_line_1: {
    type: String,
    default: null,
    trim: true,
  },
  address_line_2: {
    type: String,
    default: null,
    trim: true,
  },
  // Reference to events
  events: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: EventsModel,
    },
  ],

  // Reference to uploads
  hotel_images: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: UploadsModel,
    },
  ],

  status: {
    type: String,
    enum: [AdminStatus.ACTIVE, AdminStatus.DISABLED, AdminStatus.BINNED],
    default: AdminStatus.ACTIVE,
  },
})

hotelsSchema.plugin(mongoosePaginate)

const HotelsModel = mongoose.model<IHotelsModelSchema>('hotels', hotelsSchema)

export default HotelsModel
