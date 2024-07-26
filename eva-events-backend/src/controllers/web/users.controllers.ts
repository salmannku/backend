import { CommonEnums } from '../../enums/common.enums'
import { JwtHelpers, PasswordHelpers, sendResponse } from '../../helpers/common'
import { catchAsync } from '../../utils/catchAsync'
import ResponseCodes from '../../utils/responseCodes'
import DelegatesModel from '../../models/delegates.model'
import ExhibitorsModel from '../../models/exhibitors.model'
import SpeakersModel from '../../models/speakers.model'
import SponsorsModel from '../../models/sponsors.model'
import MediaPartnersModel from '../../models/media-partners.model'
import { DelegateServices } from '../../services/delegates.services'
import { ExhibitorServices } from '../../services/exhibitors.services'
import { SpeakerServices } from '../../services/speaker.services'
import { SponsorServices } from '../../services/sponsors.services'
import { MediaPartnerServices } from '../../services/media-partner.services'
import { IUser, UserServices } from '../../services/users.services'
import EventInvitesModel from '../../models/event-invites.model'
import EventsModel from '../../models/events.model'
import MeetingManagementModel from '../../models/meeting-managements.model'
import { isValidObjectId } from 'mongoose'
import { ObjectId } from 'mongodb'
import CategoriesModel from '../../models/categories.model'
import CompaniesModel from '../../models/companies.model'
import { UploadsHelpers } from '../../helpers/uploads.helpers'
import { APIError } from '../../middlewares/errorHandler.middleware'
import { HttpStatusCode } from 'axios'

export class UsersController {
  static getUserProfileWithProfileSurvey = catchAsync(
    async (req: any, res: any) => {
      const user = req?.user

      const userType = user?.user_type

      let userRecord: any = null
      let userId = user._id
      let profileSurvey: any = {}

      if (userType === CommonEnums.users.delegate) {
        const [_userRecord, _profileSurvey] = await Promise.all([
          DelegatesModel.findById(userId)
            .populate([
              {
                path: 'company',
                model: CompaniesModel,
              },
              {
                path: 'category',
                model: CategoriesModel,
              },
            ])
            .lean(),
          DelegateServices.getProfileSurvey({
            user_id: userId,
          }),
        ])

        userRecord = _userRecord
        profileSurvey = _profileSurvey
      }

      if (userType === CommonEnums.users.exhibitor) {
        const [_userRecord, _profileSurvey] = await Promise.all([
          ExhibitorsModel.findById(userId)
            .populate([
              {
                path: 'company',
                model: CompaniesModel,
              },
              {
                path: 'category',
                model: CategoriesModel,
              },
            ])
            .lean(),
          ExhibitorServices.getProfileSurvey({
            user_id: userId,
          }),
        ])

        userRecord = _userRecord
        profileSurvey = _profileSurvey
      }

      if (userType === CommonEnums.users.speaker) {
        const [_userRecord, _profileSurvey] = await Promise.all([
          SpeakersModel.findById(userId)
            .populate([
              {
                path: 'company',
                model: CompaniesModel,
              },
              {
                path: 'category',
                model: CategoriesModel,
              },
            ])
            .lean(),
          SpeakerServices.getProfileSurvey({
            user_id: userId,
          }),
        ])

        userRecord = _userRecord
        profileSurvey = _profileSurvey
      }

      if (userType === CommonEnums.users.sponsor) {
        const [_userRecord, _profileSurvey] = await Promise.all([
          SponsorsModel.findById(userId)
            .populate([
              {
                path: 'company',
                model: CompaniesModel,
              },
              {
                path: 'category',
                model: CategoriesModel,
              },
            ])
            .lean(),
          SponsorServices.getProfileSurvey({
            user_id: userId,
          }),
        ])

        userRecord = _userRecord
        profileSurvey = _profileSurvey
      }

      if (userType === CommonEnums.users.media_partner) {
        const [_userRecord, _profileSurvey] = await Promise.all([
          MediaPartnersModel.findById(userId)
            .populate([
              {
                path: 'company',
                model: CompaniesModel,
              },
              {
                path: 'category',
                model: CategoriesModel,
              },
            ])
            .lean(),
          MediaPartnerServices.getProfileSurvey({
            user_id: userId,
          }),
        ])

        userRecord = _userRecord
        profileSurvey = _profileSurvey
      }

      const data: any = {
        ...userRecord,
        profile_surveys: profileSurvey,
      }

      return sendResponse({
        res,
        success: true,
        data,
        response_code: ResponseCodes.GET_SUCCESS,
      })
    }
  )

  static getUserDetails = catchAsync(async (req: any, res: any) => {
    const user = req.user as IUser
    const { user_type, user_id, event_id } = req?.query

    let userRecord: any = null
    let profileSurvey: any = {}
    let colleagueUsers: any = []

    if (user_type === CommonEnums.users.delegate) {
      const [_userRecord, _profileSurvey] = await Promise.all([
        DelegatesModel.findById(user_id)
          .populate([
            {
              path: 'company',
              model: CompaniesModel,
            },
            {
              path: 'category',
              model: CategoriesModel,
            },
          ])
          .lean(),
        DelegateServices.getProfileSurvey({
          user_id: user_id,
        }),
      ])

      if (!_userRecord) {
        throw new APIError({
          message: 'User not found!',
          code: ResponseCodes.USER_NOT_FOUND,
          status: HttpStatusCode.BadRequest,
        })
      }

      let colleagues: any[] = []

      if (_userRecord?.company?._id?.toString()) {
        colleagues = await UserServices.getUserColleaguesForEvent({
          company_id: _userRecord?.company?._id?.toString(),
          event_id: event_id,
          user_id: user_id,
        })
      }

      userRecord = _userRecord
      profileSurvey = _profileSurvey
      colleagueUsers = colleagues
    }

    if (user_type === CommonEnums.users.exhibitor) {
      const [_userRecord, _profileSurvey] = await Promise.all([
        ExhibitorsModel.findById(user_id)
          .populate([
            {
              path: 'company',
              model: CompaniesModel,
            },
            {
              path: 'category',
              model: CategoriesModel,
            },
          ])
          .lean(),
        ExhibitorServices.getProfileSurvey({
          user_id: user_id,
        }),
      ])

      if (!_userRecord) {
        throw new APIError({
          message: 'User not found!',
          code: ResponseCodes.USER_NOT_FOUND,
          status: HttpStatusCode.BadRequest,
        })
      }

      let colleagues: any[] = []

      if (_userRecord?.company?._id?.toString()) {
        colleagues = await UserServices.getUserColleaguesForEvent({
          company_id: _userRecord?.company?._id?.toString(),
          event_id: event_id,
          user_id: user_id,
        })
      }

      userRecord = _userRecord
      profileSurvey = _profileSurvey
      colleagueUsers = colleagues
    }

    if (user_type === CommonEnums.users.speaker) {
      const [_userRecord, _profileSurvey] = await Promise.all([
        SpeakersModel.findById(user_id)
          .populate([
            {
              path: 'company',
              model: CompaniesModel,
            },
            {
              path: 'category',
              model: CategoriesModel,
            },
          ])
          .lean(),
        SpeakerServices.getProfileSurvey({
          user_id: user_id,
        }),
      ])

      if (!_userRecord) {
        throw new APIError({
          message: 'User not found!',
          code: ResponseCodes.USER_NOT_FOUND,
          status: HttpStatusCode.BadRequest,
        })
      }

      let colleagues: any[] = []

      if (_userRecord?.company?._id?.toString()) {
        colleagues = await UserServices.getUserColleaguesForEvent({
          company_id: _userRecord?.company?._id?.toString(),
          event_id: event_id,
          user_id: user_id,
        })
      }

      userRecord = _userRecord
      profileSurvey = _profileSurvey
      colleagueUsers = colleagues
    }

    if (user_type === CommonEnums.users.sponsor) {
      const [_userRecord, _profileSurvey] = await Promise.all([
        SponsorsModel.findById(user_id)
          .populate([
            {
              path: 'company',
              model: CompaniesModel,
            },
            {
              path: 'category',
              model: CategoriesModel,
            },
          ])
          .lean(),
        SponsorServices.getProfileSurvey({
          user_id: user_id,
        }),
      ])

      if (!_userRecord) {
        throw new APIError({
          message: 'User not found!',
          code: ResponseCodes.USER_NOT_FOUND,
          status: HttpStatusCode.BadRequest,
        })
      }

      let colleagues: any[] = []

      if (_userRecord?.company?._id?.toString()) {
        colleagues = await UserServices.getUserColleaguesForEvent({
          company_id: _userRecord?.company?._id?.toString(),
          event_id: event_id,
          user_id: user_id,
        })
      }

      userRecord = _userRecord
      profileSurvey = _profileSurvey
      colleagueUsers = colleagues
    }

    if (user_type === CommonEnums.users.media_partner) {
      const [_userRecord, _profileSurvey] = await Promise.all([
        MediaPartnersModel.findById(user_id)
          .populate([
            {
              path: 'company',
              model: CompaniesModel,
            },
            {
              path: 'category',
              model: CategoriesModel,
            },
          ])
          .lean(),
        MediaPartnerServices.getProfileSurvey({
          user_id: user_id,
        }),
      ])

      if (!_userRecord) {
        throw new APIError({
          message: 'User not found!',
          code: ResponseCodes.USER_NOT_FOUND,
          status: HttpStatusCode.BadRequest,
        })
      }

      let colleagues: any[] = []

      if (_userRecord?.company?._id?.toString()) {
        colleagues = await UserServices.getUserColleaguesForEvent({
          company_id: _userRecord?.company?._id?.toString(),
          event_id: event_id,
          user_id: user_id,
        })
      }

      userRecord = _userRecord
      profileSurvey = _profileSurvey
      colleagueUsers = colleagues
    }

    if (!userRecord) {
      return sendResponse({
        res,
        success: false,
        message: 'User not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    const data: any = {
      ...userRecord,
      profile_surveys: profileSurvey,
      colleague_users: colleagueUsers,
    }

    return sendResponse({
      res,
      success: true,
      data,
      response_code: ResponseCodes.GET_SUCCESS,
    })
  })

  static getUser = catchAsync(async (req: any, res: any) => {
    const { user_id } = req?.params

    const userDetails = await UserServices.getUserById({
      user_id,
    })

    if (!userDetails) {
      throw new APIError({
        code: ResponseCodes.USER_NOT_FOUND,
        message: 'User not found!',
        status: HttpStatusCode.NotFound,
      })
    }

    return sendResponse({
      res,
      success: true,
      data: userDetails,
      response_code: ResponseCodes.GET_SUCCESS,
    })
  })

  static updateUserProfile = catchAsync(async (req: any, res: any) => {
    const user = req?.user

    const userType = user?.user_type
    let userId = user._id

    const { survey_options } = req.body

    let _fillOptionsPromises: any[] = []

    if (survey_options?.length) {
      survey_options.forEach(
        (option: {
          option_id: string
          checked: boolean
          text_input: string
        }) => {
          _fillOptionsPromises.push(
            UserServices.fillSurveyOption({
              option_id: option?.option_id,
              user: user,
              checked: option?.checked,
              text_input: option?.text_input ?? '',
            })
          )
        }
      )
    }

    const updateUserDetails = async () => {
      if (userType === CommonEnums.users.delegate) {
        const {
          first_name,
          last_name,
          email,
          bio,
          phone,
          phone_country_code,
          city,
          country,
          zip,
          // state,
          address_line_1,
          address_line_2,
          delegate_URL,
          delegate_linkedin,
          pa_name = '',
          pa_email = '',
          job_title,
          company_id,
          category_id,
          telephone,
        } = req.body

        const delegate = await DelegatesModel.findByIdAndUpdate(
          userId,
          {},
          {
            new: true,
          }
        )

        if (!delegate) {
          throw new Error('User not found!')
        }

        if (
          company_id &&
          delegate?.company?.toString() !== company_id?.trim()
        ) {
          const company = await CompaniesModel.findById(company_id).lean()
          if (!company) {
            throw new Error('Company not found!')
          }

          delegate.company_name = company.company_name
          delegate.company = company_id
        }

        if (
          category_id &&
          delegate?.category?.toString() !== category_id?.trim()
        ) {
          const category = await CategoriesModel.findById(category_id).lean()
          if (!category) {
            throw new Error('Category not found!')
          }

          delegate.category_name = category.category_name
          delegate.category = category_id
        }

        if (first_name) delegate.first_name = first_name
        if (last_name) delegate.last_name = last_name
        if (email) delegate.email = email
        if (city) delegate.city = city
        if (country) delegate.country = country
        if (bio || bio === '') delegate.bio = bio
        if (phone || phone === '') delegate.phone = phone
        if (phone_country_code || phone_country_code === '')
          delegate.phone_country_code = phone_country_code

        if (zip || zip === '') delegate.zip = zip
        if (address_line_1 || address_line_1 === '')
          delegate.address_line_1 = address_line_1
        if (address_line_2 || address_line_2 === '')
          delegate.address_line_2 = address_line_2

        if (delegate_URL || delegate_URL === '')
          delegate.delegate_URL = delegate_URL

        if (delegate_linkedin || delegate_linkedin === '')
          delegate.delegate_linkedin = delegate_linkedin

        if (pa_name || pa_name === '') delegate.pa_name = pa_name
        if (pa_email || pa_email === '') delegate.pa_email = pa_email
        if (job_title) delegate.job_title = job_title
        if (telephone) delegate.telephone = telephone

        await delegate.save()

        return true
      }

      if (userType === CommonEnums.users.speaker) {
        const {
          first_name,
          last_name,
          bio,
          // email,
          phone,
          phone_country_code,
          city,
          country,
          // state,
          speaker_URL,
          speaker_linkedin,
          company_id,
          category_id,
          job_title,
          pa_name = '',
          pa_email = '',
          telephone,
        } = req.body

        const oldUser = await SpeakersModel.findByIdAndUpdate(
          userId,
          {},
          {
            new: true,
          }
        )

        if (!oldUser) {
          throw new Error('User not found!')
        }

        if (company_id && oldUser?.company?.toString() !== company_id?.trim()) {
          const company = await CompaniesModel.findById(company_id).lean()
          if (!company) {
            throw new Error('Company not found!')
          }

          oldUser.company_name = company.company_name
          oldUser.company = company_id
        }

        if (
          category_id &&
          oldUser?.category?.toString() !== category_id?.trim()
        ) {
          const category = await CategoriesModel.findById(category_id).lean()
          if (!category) {
            throw new Error('Category not found!')
          }

          oldUser.category_name = category.category_name
          oldUser.category = category_id
        }

        if (first_name) oldUser.first_name = first_name
        if (last_name) oldUser.last_name = last_name
        // if (email) oldUser.email = email
        if (bio || bio == '') oldUser.bio = bio
        if (phone || phone == '') oldUser.phone = phone
        if (speaker_URL || speaker_URL == '') oldUser.speaker_URL = speaker_URL
        if (city) oldUser.city = city
        if (country) oldUser.country = country

        if (phone_country_code || phone_country_code == '')
          oldUser.phone_country_code = phone_country_code

        if (job_title || job_title == '') oldUser.job_title = job_title

        if (speaker_linkedin || speaker_linkedin == '')
          oldUser.speaker_linkedin = speaker_linkedin

        if (pa_name || pa_name === '') oldUser.pa_name = pa_name
        if (pa_email || pa_email === '') oldUser.pa_email = pa_email
        if (telephone || telephone == '') oldUser.telephone = telephone

        await oldUser.save()

        return true
      }

      if (userType === CommonEnums.users.exhibitor) {
        const {
          first_name,
          last_name,
          // email,
          description,
          phone,
          phone_country_code,
          city,
          country,
          // zip,
          // // state,
          // address_line_1,
          // address_line_2,
          exhibitor_URL,
          pa_name = '',
          pa_email = '',
          job_title,
          company_id,
          category_id,
          telephone,
        } = req.body

        const oldUser = await ExhibitorsModel.findByIdAndUpdate(
          userId,
          {},
          {
            new: true,
          }
        )

        if (!oldUser) {
          throw new Error('User not found!')
        }

        if (company_id && oldUser?.company?.toString() !== company_id?.trim()) {
          const company = await CompaniesModel.findById(company_id).lean()
          if (!company) {
            throw new Error('Company not found!')
          }

          oldUser.company_name = company.company_name
          oldUser.company = company_id
        }

        if (
          category_id &&
          oldUser?.category?.toString() !== category_id?.trim()
        ) {
          const category = await CategoriesModel.findById(category_id).lean()
          if (!category) {
            throw new Error('Category not found!')
          }

          oldUser.category_name = category.category_name
          oldUser.category = category_id
        }

        if (first_name) oldUser.first_name = first_name
        if (last_name) oldUser.last_name = last_name
        // if (email) oldUser.email = email
        if (description || description === '') oldUser.description = description
        if (country) oldUser.country = country
        if (city) oldUser.city = city

        if (exhibitor_URL || exhibitor_URL === '')
          oldUser.exhibitor_URL = exhibitor_URL

        if (phone || phone === '') oldUser.phone = phone

        if (phone_country_code || phone_country_code === '')
          oldUser.phone_country_code = phone_country_code

        if (pa_name || pa_name === '') oldUser.pa_name = pa_name
        if (pa_email || pa_email === '') oldUser.pa_email = pa_email
        if (job_title || job_title == '') oldUser.job_title = job_title
        if (telephone || telephone === '') oldUser.telephone = telephone

        await oldUser.save()

        return true
      }

      if (userType === CommonEnums.users.sponsor) {
        const {
          sponsor_name,
          sponsor_description,
          sponsor_URL,
          representative_firstname,
          representative_lastname,
          email,
          phone,
          phone_country_code,
          country,
          city,
          // state,
          pa_name = '',
          pa_email = '',
          company_id,
          category_id,
          job_title,
          telephone,
        } = req.body

        const sponsor = await SponsorsModel.findByIdAndUpdate(
          userId,
          {},
          {
            new: true,
          }
        )

        if (!sponsor) {
          throw new Error('User not found!')
        }

        if (company_id && user?.company?.toString() !== company_id?.trim()) {
          const company = await CompaniesModel.findById(company_id).lean()
          if (!company) {
            throw new Error('Company not found!')
          }

          user.company_name = company.company_name
          user.company = company_id
        }

        if (category_id && user?.category?.toString() !== category_id?.trim()) {
          const category = await CategoriesModel.findById(category_id).lean()
          if (!category) {
            throw new Error('Category not found!')
          }

          user.category_name = category.category_name
          user.category = category_id
        }

        // Required fields
        if (sponsor_name) sponsor.sponsor_name = sponsor_name
        if (sponsor_URL) sponsor.sponsor_URL = sponsor_URL
        if (representative_firstname)
          sponsor.representative_firstname = representative_firstname
        if (representative_lastname)
          sponsor.representative_lastname = representative_lastname
        if (email) sponsor.email = email
        if (country) sponsor.country = country

        // Not required fields
        if (sponsor_description || sponsor_description === '')
          sponsor.sponsor_description = sponsor_description
        if (phone || phone === '') sponsor.phone = phone
        if (phone_country_code || phone_country_code === '')
          sponsor.phone_country_code = phone_country_code
        if (city || city === '') sponsor.city = city
        if (pa_name || pa_name === '') sponsor.pa_name = pa_name
        if (pa_email || pa_email === '') sponsor.pa_email = pa_email
        if (job_title || job_title == '') user.job_title = job_title
        if (telephone || telephone == '') user.telephone = telephone

        await sponsor.save()

        return true
      }

      if (userType === CommonEnums.users.media_partner) {
        const {
          first_name,
          last_name,
          description,
          phone,
          phone_country_code,
          job_title,
          mediapartner_URL,
          company_id,
          category_id,
          pa_name = '',
          pa_email = '',
          telephone,
        } = req.body

        const oldUser = await MediaPartnersModel.findByIdAndUpdate(
          userId,
          {},
          {
            new: true,
          }
        )

        if (!oldUser) {
          throw new Error('User not found!')
        }

        if (company_id && oldUser?.company?.toString() !== company_id?.trim()) {
          const company = await CompaniesModel.findById(company_id).lean()
          if (!company) {
            throw new Error('Company not found!')
          }

          oldUser.company_name = company.company_name
          oldUser.company = company_id
        }

        if (
          category_id &&
          oldUser?.category?.toString() !== category_id?.trim()
        ) {
          const category = await CategoriesModel.findById(category_id).lean()
          if (!category) {
            throw new Error('Category not found!')
          }

          oldUser.category_name = category.category_name
          oldUser.category = category_id
        }

        if (first_name) oldUser.first_name = first_name
        if (last_name) oldUser.last_name = last_name
        if (mediapartner_URL) oldUser.mediapartner_URL = mediapartner_URL
        if (description || description == '') oldUser.description = description
        if (phone || phone == '') oldUser.phone = phone
        if (phone_country_code || phone_country_code == '')
          oldUser.phone_country_code = phone_country_code
        if (pa_name || pa_name === '') oldUser.pa_name = pa_name
        if (pa_email || pa_email === '') oldUser.pa_email = pa_email
        if (job_title || job_title == '') user.job_title = job_title
        if (telephone || telephone == '') oldUser.telephone = telephone

        await oldUser.save()

        return true
      }
    }

    const [userUpdate, optionFillResults] = await Promise.all([
      updateUserDetails(),
      _fillOptionsPromises,
    ])

    if (!userUpdate) {
      return sendResponse({
        res,
        success: false,
        message: 'Failed to update user details, please try again!',
        response_code: ResponseCodes.FAILED,
      })
    }

    let failedOptionFills = []

    optionFillResults.forEach((result: boolean) => {
      if (!result) failedOptionFills.push(result)
    })

    if (failedOptionFills.length) {
      return sendResponse({
        res,
        success: false,
        message:
          'Profile survey update failed, some of the options might not be updated, please verify the profile details!',
        response_code: ResponseCodes.PROFILE_SURVEY_NOT_UPDATED_PROPERLY,
      })
    }

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.UPDATE_SUCCESS,
    })
  })

  static updateProfileImage = catchAsync(async (req: any, res: any) => {
    const user = req.user as IUser

    const userRecord = await UserServices.getUserById({ user_id: user._id })

    if (!userRecord) {
      return sendResponse({
        res,
        success: false,
        message: 'User not found!',
        response_code: ResponseCodes.USER_NOT_FOUND,
      })
    }

    if (req?.file) {
      const uploadResp = await UploadsHelpers.uploadAvatar({
        file: req?.file,
        user_id: userRecord.id,
      })

      if (!uploadResp.success) {
        return sendResponse({
          res,
          success: false,
          message: 'Profile image upload failed, please try again!',
          response_code: ResponseCodes.UPLOAD_FAILED,
        })
      }

      if (userRecord?.avatar) {
        await UploadsHelpers.deleteUpload({
          image_url: userRecord.avatar,
        })
      }

      if (user.user_type === CommonEnums.users.delegate) {
        user.avatar = uploadResp.uploadRecord.file_url
      }

      if (user.user_type === CommonEnums.users.exhibitor) {
        user.exhibitor_logo = uploadResp.uploadRecord.file_url
      }

      if (user.user_type === CommonEnums.users.speaker) {
        user.avatar = uploadResp.uploadRecord.file_url
      }

      if (user.user_type === CommonEnums.users.sponsor) {
        user.sponsor_logo = uploadResp.uploadRecord.file_url
      }

      if (user.user_type === CommonEnums.users.media_partner) {
        user.logo = uploadResp.uploadRecord.file_url
      }

      await (user as any).save()
    }

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.UPDATE_SUCCESS,
    })
  })

  static loginToWeb = catchAsync(async (req: any, res: any) => {
    const { email, password } = req.body

    const user = await UserServices.getUserByEmail({
      email,
    })

    if (!user) {
      return sendResponse({
        res,
        success: false,
        message: 'Invalid email or password!',
        response_code: ResponseCodes.LOGIN_FAILED,
      })
    }

    const comparePassword = PasswordHelpers.checkPasswords({
      input_password: password,
      password_from_db: user?.password,
    })

    if (!comparePassword) {
      return sendResponse({
        res,
        success: false,
        message: 'Credentials you entered is invalid!',
        response_code: ResponseCodes.INVALID_CREDENTIALS,
      })
    }

    const userDetails = user.toJSON()

    if (userDetails) delete (userDetails as any).password

    const jwtRes = await JwtHelpers.createAuthTokensForUser({
      payload: { ...userDetails },
      remember: false,
    })

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
        user: userDetails,
        access_token: jwtRes.access_token,
        refresh_token: jwtRes.refresh_token,
      },
    })
  })

  static verifyEventInvite = catchAsync(async (req: any, res: any) => {
    const user = req?.user

    const userType = user?.user_type
    const eventId = req?.params?.event_id

    const eventInvite = await EventInvitesModel.findOne({
      invitation_username: user.email,
      event_id: eventId,
      user_type: userType,
    }).populate({
      path: 'event_id',
      model: EventsModel,
      select:
        '_id name description start_date end_date venue_city venue_country venue_zip venue_address_line_1 featured_image createdAt status',
    })

    if (!eventInvite) {
      return sendResponse({
        res,
        success: false,
        message:
          'You are not invited for this event, please contact administration for invite!',
        response_code: ResponseCodes.EVENT_INVITE_NOT_FOUND,
      })
    }

    const invitationData = eventInvite.toJSON()

    return sendResponse({
      res,
      data: {
        ...invitationData,
      },
      success: true,
      response_code: ResponseCodes.SUCCESS,
    })
  })

  static getMeetingManagementsForEvent = catchAsync(
    async (req: any, res: any) => {
      const userId = req?.params?.user_id

      const user = await UserServices.getUserById({
        user_id: userId,
      })

      if (!user) {
        throw new APIError({
          message: 'User not found',
          code: ResponseCodes.NOT_FOUND,
          status: HttpStatusCode.BadRequest,
        })
      }

      const userType = user?.user_type

      if (userType === CommonEnums.users.ADMIN) {
        throw new APIError({
          message: 'This feature is not available admin users',
          code: ResponseCodes.FAILED,
          status: HttpStatusCode.BadRequest,
        })
      }

      let meetingManagementRecord = await MeetingManagementModel.findOne({
        user: user?._id,
        user_type: userType,
      })

      if (!meetingManagementRecord) {
        meetingManagementRecord = await MeetingManagementModel.create({
          user: user?._id,
          user_type: userType,
          availability: '',
          one_to_one_meeting_coordination: '',
          suggestions: '',
        })
      }

      if (!meetingManagementRecord) {
        return sendResponse({
          res,
          success: false,
          message: 'Meeting management data not found!',
          response_code: ResponseCodes.NOT_FOUND,
        })
      }

      return sendResponse({
        res,
        data: meetingManagementRecord,
        success: true,
        response_code: ResponseCodes.SUCCESS,
      })
    }
  )

  static updateMeetingManagementSettings = catchAsync(
    async (req: any, res: any) => {
      const userId = req?.params?.user_id

      const user = await UserServices.getUserById({
        user_id: userId,
      })

      if (!user) {
        throw new APIError({
          message: 'User not found',
          code: ResponseCodes.NOT_FOUND,
          status: HttpStatusCode.BadRequest,
        })
      }

      const userType = user?.user_type

      const {
        availability,
        one_to_one_meeting_coordinator_name,
        one_to_one_meeting_coordinator_email,
        suggestions,
      } = req.body

      let meetingManagementRecord =
        await MeetingManagementModel.findOneAndUpdate(
          {
            user: user?._id,
            user_type: userType,
          },
          {},
          { new: true }
        )

      if (!meetingManagementRecord) {
        return sendResponse({
          res,
          success: false,
          message: 'Meeting management settings not found!',
          response_code: ResponseCodes.NOT_FOUND,
        })
      }

      if (availability || availability === '')
        meetingManagementRecord.availability = availability

      if (
        one_to_one_meeting_coordinator_name ||
        one_to_one_meeting_coordinator_name === ''
      )
        meetingManagementRecord.one_to_one_meeting_coordinator_name =
          one_to_one_meeting_coordinator_name

      if (
        one_to_one_meeting_coordinator_email ||
        one_to_one_meeting_coordinator_email === ''
      )
        meetingManagementRecord.one_to_one_meeting_coordinator_email =
          one_to_one_meeting_coordinator_email

      if (suggestions || suggestions === '')
        meetingManagementRecord.suggestions = suggestions

      await meetingManagementRecord.save()

      return sendResponse({
        res,
        success: true,
        message: 'Meeting management settings are updated',
        response_code: ResponseCodes.SUCCESS,
      })
    }
  )

  static getUsersForEvent = catchAsync(async (req: any, res: any) => {
    const user = req?.user

    const {
      page = 1,
      limit = 30,
      search = '',
      status = '',
      created_at = '',
    } = req.query

    let updatedLimit = Math.floor(limit / 5)

    if (!updatedLimit) {
      updatedLimit = limit
    }

    const extraLimit = limit - updatedLimit * 5

    const userType = user?.user_type
    const eventId = req?.params?.event_id

    // Find query for delegates, exhibitors, speakers, media partners
    let getDelegatesQuery: Record<any, any> = {}

    if (isValidObjectId(search)) {
      getDelegatesQuery = {
        $or: [
          { _id: new ObjectId(search) },
          { exhibitor_name: { $regex: search, $options: 'i' } },
          { first_name: { $regex: search, $options: 'i' } },
          { last_name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }
    } else if (search) {
      getDelegatesQuery = {
        $or: [
          { exhibitor_name: { $regex: search, $options: 'i' } },
          { first_name: { $regex: search, $options: 'i' } },
          { last_name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }
    }

    if (status) {
      getDelegatesQuery.status = status
    }

    const updatedDelegatesQuery = {
      ...getDelegatesQuery,
      events: new ObjectId(eventId),
    }

    const getDelegatesOptions = {
      page: page,
      limit: updatedLimit,
      lean: true,
      sort: { createdAt: created_at },
      populate: [
        {
          path: 'company',
          model: CompaniesModel,
        },
        {
          path: 'category',
          model: CategoriesModel,
        },
      ],
    }

    let getQueryForSponsors: Record<any, any> = {}

    if (isValidObjectId(search)) {
      getQueryForSponsors = {
        $or: [
          { _id: new ObjectId(search) },
          { sponsor_name: { $regex: search, $options: 'i' } },
          { representative_firstname: { $regex: search, $options: 'i' } },
          { representative_lastname: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }
    } else if (search) {
      getQueryForSponsors = {
        $or: [
          { sponsor_name: { $regex: search, $options: 'i' } },
          { representative_firstname: { $regex: search, $options: 'i' } },
          { representative_lastname: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }
    }

    if (status) {
      getQueryForSponsors.status = status
    }

    const updatedSponsorsQuery = {
      ...getQueryForSponsors,
      events: new ObjectId(eventId),
    }

    const getSponsorsOptions = {
      page: page,
      limit: updatedLimit + extraLimit,
      lean: true,
      sort: { createdAt: created_at },
      // select: ""
    }

    const [delegates, exhibitors, sponsors, speakers, mediaPartners] =
      await Promise.all([
        (DelegatesModel as any).paginate(
          updatedDelegatesQuery,
          getDelegatesOptions
        ),
        (ExhibitorsModel as any).paginate(
          updatedDelegatesQuery,
          getDelegatesOptions
        ),
        (SponsorsModel as any).paginate(
          updatedSponsorsQuery,
          getSponsorsOptions
        ),
        (SpeakersModel as any).paginate(
          updatedDelegatesQuery,
          getDelegatesOptions
        ),
        (MediaPartnersModel as any).paginate(
          updatedDelegatesQuery,
          getDelegatesOptions
        ),
      ])

    const users = [
      ...delegates?.docs,
      ...exhibitors?.docs,
      ...sponsors?.docs,
      ...speakers?.docs,
      ...mediaPartners?.docs,
    ]

    delegates.docs = users
    delegates.totalDocs = delegates?.docs?.length
    delegates.totalPages =
      delegates?.totalPages +
      exhibitors?.totalPages +
      sponsors?.totalPages +
      speakers?.totalPages +
      mediaPartners?.totalPages

    return sendResponse({
      res,
      data: delegates,
      success: true,
      message: '',
      response_code: ResponseCodes.GET_SUCCESS,
    })
  })

  static changePassword = catchAsync(async (req: any, res: any) => {
    const user = req?.user as IUser

    const { new_password, old_password, event_id } = req.body

    const eventInvitation = await EventInvitesModel.findOneAndUpdate(
      {
        user_id: user?._id?.toString(),
        invitation_username: user?.email,
        event_id: event_id,
      },
      {},
      {
        new: true,
      }
    )

    if (!eventInvitation) {
      return sendResponse({
        res,
        success: false,
        message: 'Event invitation not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    const isPasswordSame = PasswordHelpers.checkPasswords({
      input_password: old_password,
      password_from_db: eventInvitation.invitation_password,
    })

    if (!isPasswordSame) {
      return sendResponse({
        res,
        success: false,
        message: 'Old password is wrong!',
        response_code: ResponseCodes.FAILED,
      })
    }

    const decodedPass = await PasswordHelpers.decodeUserPassword({
      password: new_password,
    })

    eventInvitation.invitation_password = decodedPass.encrypted

    await eventInvitation.save()

    return sendResponse({
      res,
      success: true,
      message: 'Password is updated successfully',
      response_code: ResponseCodes.UPDATE_SUCCESS,
    })
  })
}
