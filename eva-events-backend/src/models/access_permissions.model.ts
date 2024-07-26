import mongoose, { Types } from 'mongoose'
import { CommonEnums } from '../enums/common.enums'
import mongoosePaginate from 'mongoose-paginate-v2'
import RolesModel from './roles.model'
import PermissionsModel from './permissions.model'

export interface IAccessPermissionsModelSchema {
  role_id: Types.ObjectId
  permission_id: Types.ObjectId
  read: boolean
  write: boolean
  delete: boolean
  user_id: Types.ObjectId
  created_at: Date
  updated_at: Date
}

const permissionsSchema: any =
  new mongoose.Schema<IAccessPermissionsModelSchema>(
    {
      role_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: RolesModel,
      },
      permission_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: PermissionsModel,
      },
      user_id: {
        type: mongoose.Schema.Types.ObjectId,
      },
      read: {
        type: Boolean,
        default: false,
      },
      write: {
        type: Boolean,
        default: false,
      },
      delete: {
        type: Boolean,
        default: false,
      },
    },
    { timestamps: true }
  )

permissionsSchema.plugin(mongoosePaginate)

const AccessPermissionsModel = mongoose.model<IAccessPermissionsModelSchema>(
  'access_permissions',
  permissionsSchema
)

export default AccessPermissionsModel
