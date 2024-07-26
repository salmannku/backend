import mongoose, { Types } from 'mongoose'
import { AdminStatus } from '../utils/adminEnums'
import mongoosePaginate from 'mongoose-paginate-v2'
import { CommonEnums } from '../enums/common.enums'
import EventsModel from './events.model'
import CategoriesModel from './categories.model'
import CompaniesModel from './companies.model'

export interface ISponsorsModelSchema {
  sponsor_name: string
  sponsor_type: string
  sponsor_logo: string
  sponsor_description: string
  sponsor_URL: string
  representative_firstname: string
  representative_lastname: string
  sponsor_graphic: string
  phone: string
  telephone: string
  email: string
  phone_country_code: string
  password: string
  is_phone_verified: boolean
  is_email_verified: boolean
  created_by: Types.ObjectId
  status: string
  city: string
  country: string
  zip: string
  state: string
  address_line_1: string
  address_line_2: string
  events: Types.ObjectId[]
  event_invites: Types.ObjectId[]
  last_login: Date
  is_online: boolean
  user_type: string
  pa_name: string
  pa_email: string
  job_title: string
  company: Types.ObjectId
  company_name: string
  category: Types.ObjectId
  category_name: string
  created_at: Date
  updated_at: Date
}

export const sponsorsSchema: any = new mongoose.Schema<ISponsorsModelSchema>(
  {
    sponsor_name: {
      type: String,
      required: true,
      trim: true,
    },
    sponsor_logo: {
      type: String,
      default: '',
      trim: true,
    },
    sponsor_description: {
      type: String,
      default: '',
      trim: true,
    },
    sponsor_URL: {
      type: String,
      default: '',
      trim: true,
    },
    sponsor_type: {
      type: String,
      default: '',
      trim: true,
    },
    representative_firstname: {
      type: String,
      required: true,
      trim: true,
    },
    representative_lastname: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      default: '',
    },
    telephone: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique:true
    },
    phone_country_code: {
      type: String,
      default: '',
    },

    // First image from the event
    sponsor_graphic: {
      type: String,
      default: '',
      trim: true,
    },

    // Address fields
    city: {
      type: String,
      default: '',
      trim: true,
    },
    country: {
      type: String,
      default: '',
      trim: true,
    },
    zip: {
      type: String,
      default: '',
      trim: true,
    },
    state: {
      type: String,
      default: '',
      trim: true,
    },
    address_line_1: {
      type: String,
      default: '',
      trim: true,
    },
    address_line_2: {
      type: String,
      default: '',
      trim: true,
    },

    password: {
      type: String,
      select: false,
      required: true,
      trim: true,
    },  

    is_phone_verified: {
      type: Boolean,
      default: false,
    },
    is_email_verified: {
      type: Boolean,
      default: false,
    },

    job_title: {
      type: String,
      default: '',
      trim: true,
    },

    // Reference to companies
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: CompaniesModel,
      default: null,
    },

    company_name: {
      type: String,
      default: '',
      trim: true,
    },

    // Category info
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: CategoriesModel,
      default: null,
    },

    category_name: {
      type: String,
      default: '',
      trim: true,
    },

    // Reference to events
    events: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: EventsModel,
      },
    ],

    event_invites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: EventsModel,
      },
    ],

    // Reference of other admin who created the new admin account
    // Populate this field from backend
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    // Possible statues for the admins are
    // ACTIVE, if user is active
    // DISABLED, if user is not active
    // BINNED, if admin is removed temporarily
    status: {
      type: String,
      enum: [AdminStatus.ACTIVE, AdminStatus.DISABLED, AdminStatus.BINNED],
      default: AdminStatus.ACTIVE,
    },

    user_type: {
      type: String,
      default: CommonEnums.users.sponsor,
    },

    // Personal Assistant / Administrator
    pa_name: {
      type: String,
      default: '',
    },
    pa_email: {
      type: String,
      default: '',
    },

    // ISO timestamp for last login date
    last_login: {
      type: Date,
      default: null,
    },
    is_online: {
      type: Boolean,
      default: false,
    },

    // TODO
    // need to plan for schedules properly and then accordingly we need to store the data for this field here
    // schedules: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //   },
    // ],
  },
  { timestamps: true }
)

sponsorsSchema.plugin(mongoosePaginate)

const SponsorsModel = mongoose.model<ISponsorsModelSchema>(
  'sponsors',
  sponsorsSchema
)

export default SponsorsModel
