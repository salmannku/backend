import mongoose, { Types } from 'mongoose'
import { CommonEnums } from '../enums/common.enums'

export interface IUserLoginsModelSchema {
  type: string
  user_id: Types.ObjectId
  created_at: Date
  updated_at: Date
}

const userLoginSchema: any = new mongoose.Schema<IUserLoginsModelSchema>(
  {
    type: {
      type: String,
      enum: [CommonEnums.auth.LOGIN, CommonEnums.auth.LOGOUT],
      default: CommonEnums.auth.LOGIN,
    },
    // Reference to users
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  { timestamps: true }
)

const UserLoginsModel = mongoose.model<IUserLoginsModelSchema>('user_logins', userLoginSchema)

export default UserLoginsModel
