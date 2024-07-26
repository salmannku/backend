import mongoose, { Types } from 'mongoose'
import { CommonEnums } from '../enums/common.enums'

export interface IRolesModelSchema {
  role_name: string
  role_description: string
  status: string
  slug: string
  permissions: Types.ObjectId[]
  created_at: Date
  updated_at: Date
}

const roleSchema: any = new mongoose.Schema<IRolesModelSchema>(
  {
    role_name: {
      type: String,
      trim: true,
    },
    role_description: {
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

    // Reference to permissions
    permissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],

    slug: {
      type: String,
    },
  },
  { timestamps: true }
)

const RolesModel = mongoose.model<IRolesModelSchema>('roles', roleSchema)

export default RolesModel
