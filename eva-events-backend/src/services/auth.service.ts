import mongoose, { Types } from 'mongoose'
import UserLoginsModel from '../models/user_logins.model'
import { CommonEnums } from '../enums/common.enums'
import { verifyToken } from '../middlewares/authenticateRequest.middleware'

export class AuthService {
  static addLoginRecord = async ({ user_id }: { user_id: any }) => {
    await UserLoginsModel.create({
      type: CommonEnums.auth.LOGIN,
      user_id,
    })
  }
  static addLogOutRecord = async ({ user_id }: { user_id: any }) => {
    await UserLoginsModel.create({
      type: CommonEnums.auth.LOGOUT,
      user_id,
    })
  }

  static getAuthUser = async (req: any) => {
    let user: any = null

    let token = req?.headers?.authorization.split(' ')[1]

    const verificationRes = await verifyToken(token)

    if (verificationRes?.success) {
      user = verificationRes.user
    }

    return user
  }
}
