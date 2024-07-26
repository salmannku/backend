import mongoose, { Types } from 'mongoose'
import { AdminStatus } from '../utils/adminEnums'
import mongoosePaginate from 'mongoose-paginate-v2'
import { CommonEnums } from '../enums/common.enums'
import EventsModel from './events.model'
import AdminModel from './admins.model'
import CategoriesModel from './categories.model'
import CompaniesModel from './companies.model'

export interface IExhibitorsModelSchema {
  exhibitor_name: string
  first_name: string
  last_name: string
  description: string
  exhibitor_logo: string
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
  // state: string
  address_line_1: string
  address_line_2: string
  exhibitor_URL: string
  events: Types.ObjectId[]
  event_invites: Types.ObjectId[]
  last_login: Date
  is_online: boolean
  user_type: string
  pa_name: string
  pa_email: string
  // events: Types.ObjectId[]
  // schedules: Types.ObjectId[]
  job_title: string
  company: Types.ObjectId
  company_name: string
  category: Types.ObjectId
  category_name: string
  created_at: Date
  updated_at: Date
}

export const exhibitorsSchema: any = new mongoose.Schema<IExhibitorsModelSchema>(
  {
    exhibitor_name: {
      type: String,
      required: true,
      trim: true,
    },

    // Representative details
    first_name: {
      type: String,
      required: true,
      trim: true,
    },
    last_name: {
      type: String,
      required: true,
      trim: true,
    },

    // contact details
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

    description: {
      type: String,
      default: '',
      trim: true,
    },
    exhibitor_logo: {
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
    // state: {
    //   type: String,
    //   required: true,
    //   trim: true,
    // },
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
      default: null,
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

    exhibitor_URL: {
      type: String,
      default: '',
      trim: true,
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
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: AdminModel,
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
      default: CommonEnums.users.exhibitor,
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

exhibitorsSchema.plugin(mongoosePaginate)

const ExhibitorsModel = mongoose.model<IExhibitorsModelSchema>(
  'exhibitors',
  exhibitorsSchema
)

export default ExhibitorsModel
