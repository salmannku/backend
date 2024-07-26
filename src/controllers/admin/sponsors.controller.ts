import { isValidObjectId } from 'mongoose'
import { CommonEnums } from '../../enums/common.enums'
import { JwtHelpers, PasswordHelpers, sendResponse } from '../../helpers/common'
import { UploadsHelpers } from '../../helpers/uploads.helpers'
import AdminModel from '../../models/admins.model'
import { AuthService } from '../../services/auth.service'
import { EmailService } from '../../services/email'
import { catchAsync } from '../../utils/catchAsync'
import ResponseCodes from '../../utils/responseCodes'
import { ObjectId } from 'mongodb'
import SponsorsModel from '../../models/sponsors.model'
import EventsModel from '../../models/events.model'
import { EventServices } from '../../services/event.services'
import { SponsorServices } from '../../services/sponsors.services'
import { UserServices } from '../../services/users.services'
import CategoriesModel from '../../models/categories.model'
import CompaniesModel from '../../models/companies.model'
import { HttpStatusCode } from 'axios'
import { APIError } from '../../middlewares/errorHandler.middleware'
import { EventInvitationServices } from '../../services/event-invitation.service'

export class SponsorsController {
  static addSponsor = catchAsync(async (req: any, res: any) => {
    const result=await SponsorServices.addSponsor(req.user,req.body,req?.file,res,sendResponse);
    return result;
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

  static getSponsors = catchAsync(async (req: any, res: any) => {
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
          { sponsor_name: { $regex: search, $options: 'i' } },
          { representative_firstname: { $regex: search, $options: 'i' } },
          { representative_lastname: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }
    } else if (search) {
      query = {
        $or: [
          { sponsor_name: { $regex: search, $options: 'i' } },
          { representative_firstname: { $regex: search, $options: 'i' } },
          { representative_lastname: { $regex: search, $options: 'i' } },
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
      lean: true,
      sort: { createdAt: created_at, last_login },
      // select: ""
    }

    const sponsors = await (SponsorsModel as any).paginate(query, options)

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.GET_SUCCESS,
      data: sponsors,
    })
  })

  static getSponsorById = catchAsync(async (req: any, res: any) => {
    const userId = req?.params?.user_id

    const user = await SponsorsModel.findById(userId)
      .populate({
        path: 'events',
        model: EventsModel,
        select: '_id name',
      })
      .populate({
        path: 'company',
        model: CompaniesModel,
      })
      .populate({
        path: 'category',
        model: CategoriesModel,
      })
      .lean()

    if (!user) {
      return sendResponse({
        res,
        success: false,
        message: 'Sponsor not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    return sendResponse({
      res,
      success: true,
      message: '',
      response_code: ResponseCodes.GET_SUCCESS,
      data: user,
    })
  })

  /**
   * Events
   */

  static getAssignedEvents = catchAsync(async (req: any, res: any) => {
    const userId = req?.params?.user_id

    const {
      page = 1,
      limit = 30,
      search = '',
      status = '',
      created_at = '',
    } = req.query

    let query: Record<any, any> = {}

    if (isValidObjectId(search)) {
      query = {
        $or: [
          { _id: new ObjectId(search) },
          { name: { $regex: search, $options: 'i' } },
        ],
      }
    } else if (search) {
      query = {
        $or: [{ name: { $regex: search, $options: 'i' } }],
      }
    }

    if (status) {
      query.status = status
    }

    query.sponsors = new ObjectId(userId)
    query.status = CommonEnums.status.ACTIVE

    const options = {
      page: page,
      limit: limit,
      lean: true,
      sort: { createdAt: created_at },
      select:
        '_id id start_date end_date name featured_image createdAt updatedAt',
    }

    const events = await (EventsModel as any).paginate(query, options)

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.GET_SUCCESS,
      data: events,
    })
  })

  static update = catchAsync(async (req: any, res: any) => {
    const result=await SponsorServices.updateSponsor(req?.params.sponsor_id,req.body,req?.file,res,sendResponse);
    return result;
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

  static delete = catchAsync(async (req: any, res: any) => {
    const userId = req?.params?.user_id

    const deleteResponse = await SponsorsModel.findByIdAndDelete(userId)

    if (!deleteResponse) {
      return sendResponse({
        res,
        success: false,
        message: 'Sponsor not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    // Remove exhibitor from events
    await EventServices.removeSponsor({
      sponsor_id: userId,
    })

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.DELETE_SUCCESS,
    })
  })

  static changeAccountStatus = catchAsync(async (req: any, res: any) => {
    const userId = req?.params?.sponsor_id

    const { status } = req.body

    const updateResponse = await SponsorsModel.findByIdAndUpdate(
      userId,
      {
        status: status,
      },
      {
        new: true,
      }
    )

    if (!updateResponse) {
      return sendResponse({
        res,
        success: false,
        message: 'Sponsor not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    return sendResponse({
      res,
      success: true,
      message: 'Status updated successfully',
      response_code: ResponseCodes.SUCCESS,
    })
  })

  static removeSponsorLogo = catchAsync(async (req: any, res: any) => {
    const userId = req?.params?.user_id

    const user = await SponsorsModel.findByIdAndUpdate(
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
        message: 'Sponsor not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    await UploadsHelpers.deleteUpload({
      image_url: user.sponsor_logo,
    })

    user.sponsor_logo = ''

    await user.save()

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.DELETE_SUCCESS,
    })
  })

  /**
   * Profile Survey
   */
  static getProfileSurvey = catchAsync(async (req: any, res: any) => {
    const userId = req?.params?.sponsor_id

    const profileSurvey = await SponsorServices.getProfileSurvey({
      user_id: userId,
    })

    return sendResponse({
      res,
      data: profileSurvey,
      success: true,
      response_code: ResponseCodes.SUCCESS,
    })
  })
}
