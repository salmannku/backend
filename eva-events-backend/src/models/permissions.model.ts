import mongoose, { Types } from 'mongoose'
import { CommonEnums } from '../enums/common.enums'
import mongoosePaginate from 'mongoose-paginate-v2'

export interface IPermissionsModelSchema {
  name: string
  description: string
  status: string
  slug: string
  created_at: Date
  updated_at: Date
}

const permissionsSchema: any = new mongoose.Schema<IPermissionsModelSchema>(
  {
    name: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },

    // Possible statues for the permissions are
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
    slug: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
)

permissionsSchema.plugin(mongoosePaginate)

const PermissionsModel = mongoose.model<IPermissionsModelSchema>(
  'permissions',
  permissionsSchema
)

export default PermissionsModel
