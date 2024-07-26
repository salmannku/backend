import { isValidObjectId } from 'mongoose'
import { CommonEnums } from '../../enums/common.enums'
import {
  JwtHelpers,
  PasswordHelpers,
  UrlHelpers,
  sendResponse,
} from '../../helpers/common'
import { UploadsHelpers } from '../../helpers/uploads.helpers'
import AdminModel from '../../models/admins.model'
import { AuthService } from '../../services/auth.service'
import { EmailService } from '../../services/email'
import { catchAsync } from '../../utils/catchAsync'
import ResponseCodes from '../../utils/responseCodes'
import { ObjectId } from 'mongodb'
import { EmailJobsHelpers } from '../../helpers/jobs.helpers'

const jwt = require('jsonwebtoken')

export class AdminUsersController {
  static addAdmin = catchAsync(async (req: any, res: any) => {
    let authUser: any = null

    if (req?.headers?.authorization) {
      let token = req.headers.authorization?.split(' ')[1]

      const decoded = jwt.verify(`${token}`, process.env.ACCESS_TOKEN_SECRET)

      req.user = decoded

      authUser = await AdminModel.findOne({ _id: decoded?._id })
    }

    const {
      first_name,
      last_name,
      email,
      phone,
      phone_country_code,
      profile_image,
      roles,
    } = req.body

    const isAdminExist = await AdminModel.findOne({
      email: email,
    })

    if (isAdminExist) {
      return sendResponse({
        res,
        success: false,
        message: 'Admin with same email already exists!',
        response_code: ResponseCodes.ALREADY_EXIST,
      })
    }

    const passwordRes = await PasswordHelpers.autoGeneratePassword({
      user_type: CommonEnums.users.ADMIN.toLocaleLowerCase(),
    })

    console.log('User password:', passwordRes.password)

    // Setup logic to upload the profile image

    const newAdmin = await AdminModel.create({
      first_name,
      last_name,
      email,
      password: passwordRes.encrypted,
      phone,
      phone_country_code,
      profile_image,
      roles,
      created_by: authUser?._id,
    })

    if (!newAdmin) {
      return sendResponse({
        res,
        success: false,
        message: 'Registration failed, admin is not created, please try again',
        response_code: ResponseCodes.REGISTER_FAILED,
      })
    }

    if (req?.file) {
      const uploadResp = await UploadsHelpers.uploadAvatar({
        file: req?.file,
        user_id: newAdmin.id,
      })

      if (!uploadResp.success) {
        return sendResponse({
          res,
          success: false,
          message: 'Profile image upload failed, please try again!',
          response_code: ResponseCodes.UPLOAD_FAILED,
        })
      }

      newAdmin.profile_image = uploadResp.uploadRecord.file_url

      await newAdmin.save()
    }

    const emailRes = await EmailService.sendAdminRegistrationEmail({
      first_name,
      last_name,
      email,
      password: passwordRes.password,
    })

    if (!emailRes.success) {
      await AdminModel.findByIdAndDelete(newAdmin.id)
      return sendResponse({
        res,
        success: false,
        message:
          'Confirmation email is not sent to user, please add user details again!',
        response_code: ResponseCodes.REGISTRATION_CONFORMATION_MAIL_NOT_SENT,
      })
    }

    // TODO

    // Send email to new user with login information
    // Setup email server
    // Setup the email template for sending credentials as well

    return sendResponse({
      res,
      success: true,
      message: 'Admin registered successfully',
      response_code: ResponseCodes.REGISTER_SUCCESS,
    })
  })

  static logIn = catchAsync(async (req: any, res: any) => {
    const { email, password, remember } = req.body

    const adminUser = await AdminModel.findOne({
      email: email,
    }).select('+password')

    if (!adminUser) {
      return sendResponse({
        res,
        success: false,
        message: 'Credentials you entered is invalid!',
        response_code: ResponseCodes.INVALID_CREDENTIALS,
      })
    }

    const comparePassword = PasswordHelpers.checkPasswords({
      input_password: password,
      password_from_db: adminUser.password,
    })

    if (!comparePassword) {
      return sendResponse({
        res,
        success: false,
        message: 'Credentials you entered is invalid!',
        response_code: ResponseCodes.INVALID_CREDENTIALS,
      })
    }

    const userDetails = adminUser.toJSON()

    if (userDetails) delete (userDetails as any).password

    const jwtRes = await JwtHelpers.createAuthTokensForUser({
      payload: { ...userDetails },
      remember,
    })

    await AuthService.addLoginRecord({
      user_id: adminUser._id,
    })

    const updatedAdmin = await AdminModel.findByIdAndUpdate(
      adminUser._id,
      {
        last_login: new Date(),
      },
      {
        new: true,
      }
    )

    if (!jwtRes.success) {
      return sendResponse({
        res,
        success: false,
        message: 'Authentication failed, access tokens are not generated!',
        response_code: ResponseCodes.ACCESS_TOKEN_CREATION_FAILED,
      })
    }

    return sendResponse({
      res,
      success: true,
      message: 'Login successfully',
      response_code: ResponseCodes.LOGIN_SUCCESS,
      data: {
        user: updatedAdmin?.toJSON(),
        access_token: jwtRes.access_token,
        refresh_token: jwtRes.refresh_token,
      },
    })
  })

  static logout = catchAsync(async (req: any, res: any) => {
    const userRec = req.user

    const adminUser = await AdminModel.findById(userRec._id)

    if (!adminUser) {
      return sendResponse({
        res,
        success: false,
        message: 'User not found',
        response_code: ResponseCodes.USER_NOT_FOUND,
      })
    }

    await AuthService.addLogOutRecord({
      user_id: userRec._id,
    })

    return sendResponse({
      res,
      success: true,
      message: 'Login successfully',
      response_code: ResponseCodes.LOGOUT_SUCCESS,
    })
  })

  static getAdmins = catchAsync(async (req: any, res: any) => {
    const {
      page = 1,
      limit = 30,
      search = '',
      status = '',
      last_login = '',
      created_at = '',
    } = req.query

    let query: Record<any, any> = {}

    if (isValidObjectId(search)) {
      query = {
        $or: [
          { _id: new ObjectId(search) },
          { first_name: { $regex: search, $options: 'i' } },
          { last_name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }
    } else if (search) {
      query = {
        $or: [
          { first_name: { $regex: search, $options: 'i' } },
          { last_name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }
    }

    if (status) {
      query.status = status
    }

    const options = {
      page: page,
      limit: limit,
      populate: 'roles',
      lean: true,
      sort: { createdAt: created_at, last_login },
      // select: ""
    }

    const admins = await (AdminModel as any).paginate(query, options)

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.GET_SUCCESS,
      data: admins,
    })
  })

  static getAdminById = catchAsync(async (req: any, res: any) => {
    const adminId = req?.params?.admin_id

    const adminUser = await AdminModel.findById(adminId)
      .populate('roles')
      .lean()

    if (!adminUser) {
      return sendResponse({
        res,
        success: false,
        message: 'Admin not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    return sendResponse({
      res,
      success: true,
      message: '',
      response_code: ResponseCodes.GET_SUCCESS,
      data: adminUser,
    })
  })

  static updateAdmin = catchAsync(async (req: any, res: any) => {
    const {
      first_name,
      last_name,
      email,
      phone,
      phone_country_code,
      roles,
      created_by,
    } = req.body

    console.log(req.body)

    const adminId = req?.params?.admin_id

    const updateData: any = {}
	
    if (first_name) updateData.first_name = first_name
    if (last_name) updateData.last_name = last_name
    if (email) updateData.email = email
    if (phone) updateData.phone = phone
    if (phone_country_code)
      updateData.phone_country_code = phone_country_code
    if (roles) updateData.roles = roles
	
	const isAdminExist = await AdminModel.findOne({
	 _id: { $ne: adminId },
      email: email,
    })

    if (isAdminExist) {
      return sendResponse({
        res,
        success: false,
        message: 'Admin with same email already exists!',
        response_code: ResponseCodes.ALREADY_EXIST,
      })
    }
	const adminUser = await AdminModel.findByIdAndUpdate(adminId, updateData, {
      new: true,
    })

    if (!adminUser) {
      return sendResponse({
        res,
        success: false,
        message: 'Admin not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    if (req?.file) {
      const uploadResp = await UploadsHelpers.uploadAvatar({
        file: req?.file,
        user_id: adminUser.id,
      })

      if (!uploadResp.success) {
        return sendResponse({
          res,
          success: false,
          message: 'Profile image upload failed, please try again!',
          response_code: ResponseCodes.UPLOAD_FAILED,
        })
      }

      if (adminUser?.profile_image) {
        await UploadsHelpers.deleteUpload({
          image_url: adminUser.profile_image,
        })
      }

      adminUser.profile_image = uploadResp.uploadRecord.file_url

      await adminUser.save()
    }

    return sendResponse({
      res,
      success: true,
      message: 'Admin updated successfully',
      response_code: ResponseCodes.UPDATE_SUCCESS,
    })
  })

  static updateProfileImage = catchAsync(async (req: any, res: any) => {
    const adminId = req?.params?.admin_id

    const adminUser = await AdminModel.findById(adminId)

    if (!adminUser) {
      return sendResponse({
        res,
        success: false,
        message: 'Admin not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    if (req?.file) {
      const uploadResp = await UploadsHelpers.uploadAvatar({
        file: req?.file,
        user_id: adminUser.id,
      })

      if (!uploadResp.success) {
        return sendResponse({
          res,
          success: false,
          message: 'Profile image upload failed, please try again!',
          response_code: ResponseCodes.UPLOAD_FAILED,
        })
      }

      await UploadsHelpers.deleteUpload({
        image_url: adminUser.profile_image,
      })

      adminUser.profile_image = uploadResp.uploadRecord.file_url

      await adminUser.save()
    }

    return sendResponse({
      res,
      success: true,
      message: '',
      response_code: ResponseCodes.UPDATE_SUCCESS,
    })
  })

  static changePassword = catchAsync(async (req: any, res: any) => {
    const adminId = req?.params?.admin_id

    const { new_password, confirm_new_password, old_password } = req.body

    const adminUser = await AdminModel.findById(adminId).select('+password')

    if (!adminUser) {
      return sendResponse({
        res,
        success: false,
        message: 'Admin not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    const comparePassword = PasswordHelpers.checkPasswords({
      input_password: old_password.trim(),
      password_from_db: adminUser.password,
    })

    if (!comparePassword) {
      return sendResponse({
        res,
        success: false,
        message: 'Old password is wrong!',
        response_code: ResponseCodes.WRONG_PASSWORD,
      })
    }

    if (new_password.trim() !== confirm_new_password.trim()) {
      return sendResponse({
        res,
        success: false,
        message: 'Confirm password does not match',
        response_code: ResponseCodes.CONFIRM_PASSWORD_NOT_MATCH,
      })
    }

    const passwordRes = await PasswordHelpers.decodeUserPassword({
      password: new_password,
    })

    if (!passwordRes.encrypted) {
      return sendResponse({
        res,
        success: false,
        message: 'Password does not changed',
        response_code: ResponseCodes.PASSWORD_CHANGE_FAILED,
      })
    }

    adminUser.password = passwordRes.encrypted

    await adminUser.save()

    return sendResponse({
      res,
      success: true,
      message: 'Password updated successfully',
      response_code: ResponseCodes.UPDATE_SUCCESS,
    })
  })

  static binAdmin = catchAsync(async (req: any, res: any) => {
    const adminId = req?.params?.admin_id

    const updatedRole = await AdminModel.findByIdAndUpdate(
      adminId,
      {
        status: CommonEnums.BINNED,
      },
      { new: true }
    )

    if (!updatedRole) {
      return sendResponse({
        res,
        success: false,
        message: 'Admin not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.DELETE_SUCCESS,
    })
  })

  static deleteAdmin = catchAsync(async (req: any, res: any) => {
    const adminId = req?.params?.admin_id

    const deleteResponse = await AdminModel.findByIdAndDelete(adminId)

    if (!deleteResponse) {
      return sendResponse({
        res,
        success: false,
        message: 'Admin not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.DELETE_SUCCESS,
    })
  })

  static removeProfileImage = catchAsync(async (req: any, res: any) => {
    const userId = req?.params?.user_id

    const user = await AdminModel.findByIdAndUpdate(
      userId,
      {},
      {
        new: true,
      }
    )

    if (!user) {
      return sendResponse({
        res,
        success: false,
        message: 'Admin not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    await UploadsHelpers.deleteUpload({
      image_url: user.profile_image,
    })

    user.profile_image = ''

    await user.save()

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.DELETE_SUCCESS,
    })
  })

  static resetPassword = catchAsync(async (req: any, res: any) => {
    const { email } = req.body

    const user = await AdminModel.findOne({ email })

    if (!user) {
      return sendResponse({
        res,
        success: false,
        message: 'Admin not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    const resetPasswordToken =
      await PasswordHelpers.generateResetPasswordToken()

    user.reset_password_token = resetPasswordToken

    // /reset-password/create-new-password?reset_token=""
    let resetPasswordPageLink = `${UrlHelpers.getAdminWebUrl()}/reset-password/create-new-password?reset_token=${resetPasswordToken}`

    await EmailJobsHelpers.createNewJob({
      subject: 'Reset Password',
      to: user.email,
      greeting: '',
      mail_content: '',
      type: CommonEnums.emailTypes.admin_reset_password,
      metadata: {
        event_login_link: resetPasswordPageLink,
      },
    })

    await user.save()

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.SUCCESS,
    })
  })

  static createNewPassword = catchAsync(async (req: any, res: any) => {
    const { password, reset_password_token } = req.body

    const user = await AdminModel.findOne({
      reset_password_token: reset_password_token,
    }).select('+password')

    if (!user) {
      return sendResponse({
        res,
        success: false,
        message: 'Admin not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    const encodePassword = await PasswordHelpers.encryptPassword({
      password: password.trim(),
    })

    user.password = encodePassword
    user.reset_password_token = ''

    await user.save()

    return sendResponse({
      res,
      success: true,
      message: 'Your password is resetted successfully!',
      response_code: ResponseCodes.UPDATE_SUCCESS,
    })
  })
}
