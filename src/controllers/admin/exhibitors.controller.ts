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
import ExhibitorsModel from '../../models/exhibitors.model'
import EventsModel from '../../models/events.model'
import { EventServices } from '../../services/event.services'
import { ExhibitorServices } from '../../services/exhibitors.services'
import { UserServices } from '../../services/users.services'
import CategoriesModel from '../../models/categories.model'
import CompaniesModel from '../../models/companies.model'
import { HttpStatusCode } from 'axios'
import { APIError } from '../../middlewares/errorHandler.middleware'
import { EventInvitationServices } from '../../services/event-invitation.service'

export class ExhibitorController {
  static addExhibitor = catchAsync(async (req: any, res: any) =>{
    const result=await ExhibitorServices.addExhibitorsService(req.user,req.body,req?.file,res,sendResponse);
    return result;
  })

  static updateExhibitor = catchAsync(async (req: any, res: any) => {
    const result=await ExhibitorServices.updateExhibitorsService(req.params.exhibitor_id,req.body,req?.file,res,sendResponse);
    return result;
  })

  static logIn = catchAsync(async (req: any, res: any) => {
    const { email, password, remember } = req.body

    const exhibitorUser = await AdminModel.findOne({
      email: email,
    }).select('+password')

    if (!exhibitorUser) {
      return sendResponse({
        res,
        success: false,
        message: 'Credentials you entered is invalid!',
        response_code: ResponseCodes.INVALID_CREDENTIALS,
      })
    }

    const comparePassword = PasswordHelpers.checkPasswords({
      input_password: password,
      password_from_db: exhibitorUser.password,
    })

    if (!comparePassword) {
      return sendResponse({
        res,
        success: false,
        message: 'Credentials you entered is invalid!',
        response_code: ResponseCodes.INVALID_CREDENTIALS,
      })
    }

    const userDetails = exhibitorUser.toJSON()

    if (userDetails) delete (userDetails as any).password

    const jwtRes = await JwtHelpers.createAuthTokensForUser({
      payload: { ...userDetails },
      remember,
    })

    await AuthService.addLoginRecord({
      user_id: exhibitorUser._id,
    })

    const updatedAdmin = await AdminModel.findByIdAndUpdate(
      exhibitorUser._id,
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

    const exhibitorUser = await AdminModel.findById(userRec._id)

    if (!exhibitorUser) {
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

  static getExhibitors = catchAsync(async (req: any, res: any) => {
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
          { exhibitor_name: { $regex: search, $options: 'i' } },
          { first_name: { $regex: search, $options: 'i' } },
          { last_name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }
    } else if (search) {
      query = {
        $or: [
          { exhibitor_name: { $regex: search, $options: 'i' } },
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
      lean: true,
      sort: { createdAt: created_at, last_login },
      // select: ""
    }

    const admins = await (ExhibitorsModel as any).paginate(query, options)

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.GET_SUCCESS,
      data: admins,
    })
  })

  static getExhibitorById = catchAsync(async (req: any, res: any) => {
    const exhibitorId = req?.params?.exhibitor_id

    const exhibitorUser = await ExhibitorsModel.findById(exhibitorId)
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

    if (!exhibitorUser) {
      return sendResponse({
        res,
        success: false,
        message: 'Exhibitor not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    return sendResponse({
      res,
      success: true,
      message: '',
      response_code: ResponseCodes.GET_SUCCESS,
      data: exhibitorUser,
    })
  })

  static getAssignedEvents = catchAsync(async (req: any, res: any) => {
    const exhibitorId = req?.params?.exhibitor_id

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

    query.exhibitors = new ObjectId(exhibitorId)
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

    const adminId = req?.params?.exhibitor_id

    const updateData: any = {}

    if (first_name) updateData.first_name = first_name
    if (last_name) updateData.last_name = last_name
    if (email) updateData.email = email
    if (phone) updateData.phone = phone
    if (phone_country_code) updateData.phone_country_code = phone_country_code
    if (roles?.length) updateData.roles = roles
    if (created_by) updateData.created_by = created_by

    const exhibitorUser = await AdminModel.findByIdAndUpdate(
      adminId,
      updateData,
      {
        new: true,
      }
    ).lean()

    if (!exhibitorUser) {
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
      response_code: ResponseCodes.UPDATE_SUCCESS,
      data: exhibitorUser,
    })
  })

  static binAdmin = catchAsync(async (req: any, res: any) => {
    const adminId = req?.params?.exhibitor_id

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

    const deleteResponse = await ExhibitorsModel.findByIdAndDelete(userId)

    if (!deleteResponse) {
      return sendResponse({
        res,
        success: false,
        message: 'Exhibitor not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    // Remove exhibitor from events
    await EventServices.removeExhibitor({
      exhibitor_id: userId,
    })

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.DELETE_SUCCESS,
    })
  })

  static changeAccountStatus = catchAsync(async (req: any, res: any) => {
    const userId = req?.params?.user_id

    const { status } = req.body

    const updateResponse = await ExhibitorsModel.findByIdAndUpdate(
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
        message: 'Exhibitor not found!',
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

  static removeProfileImage = catchAsync(async (req: any, res: any) => {
    const userId = req?.params?.user_id

    const user = await ExhibitorsModel.findByIdAndUpdate(
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
        message: 'Exhibitor not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    await UploadsHelpers.deleteUpload({
      image_url: user.exhibitor_logo,
    })

    user.exhibitor_logo = ''

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
    const userId = req?.params?.exhibitor_id

    const profileSurvey = await ExhibitorServices.getProfileSurvey({
      user_id: userId,
    })

    return sendResponse({
      res,
      data: profileSurvey,
      success: true,
      response_code: ResponseCodes.SUCCESS,
    })
  })

  static getExhibitorsForEvent = catchAsync(async (req: any, res: any) => {
    const eventId = req?.params?.event_id
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

    query.events = new ObjectId(eventId)

    const options = {
      page: page,
      limit: limit,
      lean: true,
      sort: { createdAt: created_at },
      // select:
      //   '_id id events first_name last_name avatar email phone phone_country_code delegate_URL delegate_linkedin createdAt ',
    }

    const exhibitors = await (ExhibitorsModel as any).paginate(query, options)

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.GET_SUCCESS,
      data: exhibitors,
    })
  })
}
