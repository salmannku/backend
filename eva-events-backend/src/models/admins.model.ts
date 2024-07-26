import mongoose, { Types } from 'mongoose'
import { AdminStatus } from '../utils/adminEnums'
import mongoosePaginate from 'mongoose-paginate-v2'
import { CommonEnums } from '../enums/common.enums'
import RolesModel from './roles.model'

export interface IAdminModelSchema {
  first_name: string
  last_name: string
  phone: string
  email: string
  phone_country_code: string
  password: string
  profile_image: string
  is_phone_verified: boolean
  is_email_verified: boolean
  created_by: Types.ObjectId
  status: string
  roles: Types.ObjectId[]
  last_login: Date
  is_online: boolean
  user_type: string
  reset_password_token: string
  // events: Types.ObjectId[]
  // schedules: Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const adminSchema: any = new mongoose.Schema<IAdminModelSchema>(
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
    phone: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    phone_country_code: {
      type: String,
      default: '',
    },
    password: {
      type: String,
      select: false,
      required: true,
      trim: true,
    },
    profile_image: {
      type: String,
      default: '',
    },

    is_phone_verified: {
      type: Boolean,
      default: false,
    },
    is_email_verified: {
      type: Boolean,
      default: false,
    },

    // Reference of other admin who created the new admin account
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
      default: CommonEnums.users.ADMIN,
    },

    // Reference to Role record
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: RolesModel,
      },
    ],

    // ISO timestamp for last login date
    last_login: {
      type: Date,
      default: null,
    },
    is_online: {
      type: Boolean,
      default: false,
    },
    reset_password_token: {
      type: String,
      default: '',
    },

    // Reference to events
    // events: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //   },
    // ],

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

adminSchema.plugin(mongoosePaginate)

const AdminModel = mongoose.model<IAdminModelSchema>('admins', adminSchema)

export default AdminModel
