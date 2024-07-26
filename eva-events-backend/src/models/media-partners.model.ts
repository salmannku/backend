import mongoose, { Types } from 'mongoose'
import { AdminStatus } from '../utils/adminEnums'
import mongoosePaginate from 'mongoose-paginate-v2'
import { CommonEnums } from '../enums/common.enums'
import EventsModel from './events.model'
import CategoriesModel from './categories.model'
import CompaniesModel from './companies.model'

export interface IMediaPartnersSchema {
  first_name: string
  last_name: string
  description: string
  logo: string
  phone: string
  telephone: string
  email: string
  phone_country_code: string
  password: string
  is_phone_verified: boolean
  is_email_verified: boolean
  created_by: Types.ObjectId
  status: string
  // city: string
  // country: string
  // zip: string
  // state: string
  // address_line_1: string
  // address_line_2: string
  mediapartner_URL: string
  events: Types.ObjectId[]
  event_invites: Types.ObjectId[]
  last_login: Date
  is_online: boolean
  user_type: string
  pa_name: string
  pa_email: string
  schedules: Types.ObjectId[]
  job_title: string
  company: Types.ObjectId
  company_name: string
  category: Types.ObjectId
  category_name: string
  createdAt: Date
  updatedAt: Date
}

export const mediaPartnerSchema: any = new mongoose.Schema<IMediaPartnersSchema>(
  {
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
    description: {
      type: String,
      default: '',
      trim: true,
    },
    logo: {
      type: String,
      default: '',
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique:true
    },
    phone: {
      type: String,
      default: '',
    },
    telephone: {
      type: String,
      default: '',
    },
    phone_country_code: {
      type: String,
      default: '',
    },

    // Address fields
    // city: {
    //   type: String,
    //   required: true,
    //   trim: true,
    // },
    // country: {
    //   type: String,
    //   required: true,
    //   trim: true,
    // },
    // zip: {
    //   type: String,
    //   default: '',
    //   trim: true,
    // },
    // state: {
    //   type: String,
    //   required: true,
    //   trim: true,
    // },
    // address_line_1: {
    //   type: String,
    //   default: null,
    //   trim: true,
    // },
    // address_line_2: {
    //   type: String,
    //   default: null,
    //   trim: true,
    // },

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

    mediapartner_URL: {
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
    },

    // TODO
    // need to plan for schedules properly and then accordingly we need to store the data for this field here
    schedules: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],

    // Possible statues for the admins are
    // active, if user is active
    // disabled, if user is not active
    // binned, if admin is removed temporarily
    status: {
      type: String,
      enum: [AdminStatus.ACTIVE, AdminStatus.DISABLED, AdminStatus.BINNED],
      default: AdminStatus.ACTIVE,
    },

    user_type: {
      type: String,
      default: CommonEnums.users.media_partner,
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
  },
  { timestamps: true }
)

mediaPartnerSchema.plugin(mongoosePaginate)

const MediaPartnersModel = mongoose.model<IMediaPartnersSchema>(
  'media_partners',
  mediaPartnerSchema
)

export default MediaPartnersModel
