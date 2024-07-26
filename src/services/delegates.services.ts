import { Response } from 'express'
import { PasswordHelpers, sendResponse } from '../helpers/common'
import DelegatesProfileSurveySelectionsModel from '../models/delegates-profile-survey-selections.model'
import DelegatesModel from '../models/delegates.model'
import ProfileSurveyOptionsModel, {
  IProfileSurveyOptionsModelSchema,
} from '../models/profile-survey-options.model'
import ProfileSurveySectionsModel from '../models/profile-survey-sections.model'
import ResponseCodes from '../utils/responseCodes'
import { UserServices } from './users.services'
import { CommonEnums } from '../enums/common.enums'
import CompaniesModel from '../models/companies.model'
import CategoriesModel from '../models/categories.model'
import { UploadsHelpers } from '../helpers/uploads.helpers'
import { EventServices } from './event.services'
import { EmailService } from './email'
import { APIError } from '../middlewares/errorHandler.middleware'
import { HttpStatusCode } from 'axios'
import { EventInvitationServices } from './event-invitation.service'

export class DelegateServices {
  static addProfileSurveySections = async ({
    user_id,
  }: {
    user_id: string
  }) => {
    try {
      const [user, surveySections] = await Promise.all([
        DelegatesModel.findByIdAndUpdate(
          user_id,
          {},
          {
            new: true,
          }
        ),
        ProfileSurveySectionsModel.find({}).populate({
          path: 'survey_options',
          model: ProfileSurveyOptionsModel,
          options: {
            sort: {
              order: 1,
            },
          },
        }),
      ])

      if (!user) {
        return {
          success: false,
          message: 'User not found',
          response_code: ResponseCodes.NOT_FOUND,
        }
      }

      let createOptionSelectionPromises: any = []
      surveySections.forEach((section) => {
        section.survey_options.forEach((option: any) => {
          createOptionSelectionPromises.push({
            user: user._id,
            profile_survey_section: option?.profile_survey_section_id,
            survey_option: option?._id,
            order: option?.order,
          })
        })
      })

      await DelegatesProfileSurveySelectionsModel.create(
        createOptionSelectionPromises
      )

      user.profile_surveys = surveySections.map((section) => section._id)

      await user.save()

      console.log(
        'createOptionSelectionPromises >>>',
        createOptionSelectionPromises
      )
    } catch (err) {
      console.log(err)
    }
  }

  static getProfileSurvey = async ({ user_id }: { user_id: string }) => {
    try {
      const surveySections = await ProfileSurveySectionsModel.find({})
        .populate({
          path: 'survey_options',
          model: ProfileSurveyOptionsModel,
          options: {
            sort: {
              order: 1,
            },
          },
        })
        .lean()

      const profileSurveys = surveySections

      if (!profileSurveys) {
        return false
      }

      const _promises: any[] = []

      profileSurveys.forEach((section) => {
        _promises.push(
          DelegatesProfileSurveySelectionsModel.find({
            user: user_id,
            profile_survey_section: section._id,
          })
            .populate({
              path: 'survey_option',
              model: ProfileSurveyOptionsModel,
              options: {
                sort: {
                  order: 1,
                },
              },
              select: '_id option_title description option_type',
            })
            .sort({
              order: 1,
            })
            .lean()
        )
      })

      const sections = await Promise.all(_promises)

      let updatedSections: any[] = []

      surveySections.forEach((section, idx) => {
        let updatedSurveyOptions = profileSurveys?.[idx].survey_options
        let selectionSurveyOptions = sections?.[idx]
        const surveyOptionIds = profileSurveys?.[idx].survey_options?.map(
          (_option: any) => _option._id.toString()
        )
        const selectionSurveyOptionIds = sections?.[idx].map((_option: any) =>
          _option?.survey_option._id?.toString()
        )

        surveyOptionIds.forEach((_id, _index) => {
          if (selectionSurveyOptionIds.includes(_id)) {
            let selectedValue: any = null

            selectionSurveyOptions.forEach((_option: any) => {
              if (_option.survey_option?._id.toString() === _id) {
                selectedValue = _option
                return
              }
            })

            updatedSurveyOptions[_index] = {
              ...selectedValue,
              option_title: selectedValue.survey_option.option_title,
              description: selectedValue.survey_option.description,
              option_type: selectedValue.survey_option.option_type,
            }

            delete (updatedSurveyOptions[_index] as any).survey_option
          } else {
            updatedSurveyOptions[_index] = {
              ...updatedSurveyOptions[_index],
              selected: false,
              text_input: '',
            } as any
          }
        })

        updatedSections.push({
          ...profileSurveys[idx],
          survey_options: updatedSurveyOptions,
        })
      })

      return updatedSections
    } catch (err) {
      console.log(err)
    }
  }

  static addDelegateService = async (user: any, body: any, file: any, res: Response,sendResponse:any) => {

    let {
      first_name,
      last_name,
      email,
      bio,
      phone,
      phone_country_code,
      city,
      country,
      zip,
      telephone,
      address_line_1,
      address_line_2,
      delegate_URL,
      delegate_linkedin,
      events = [],
      job_title,
      company_id,
      category_id,
    } = body

    const isExist = await UserServices.getUserByEmail({
      email,
    })

    if (isExist) {
      return sendResponse({
        res,
        success: false,
        message: 'User with email already exists!',
        response_code: ResponseCodes.ALREADY_EXIST,
      })
    }

    const passwordRes = await PasswordHelpers.autoGeneratePassword({
      user_type: CommonEnums.users.delegate,
    })

    const values: any = {
      first_name,
      last_name,
      bio,
      email,
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
      job_title,
      events,
      created_by: user?._id,
      telephone,
      password: passwordRes.encrypted,
    }

    if (company_id || category_id) {
      const [company, category] = await Promise.all([
        CompaniesModel.findById(company_id).lean(),
        CategoriesModel.findById(category_id).lean(),
      ])

      if (company_id && !company) {
        return sendResponse({
          res,
          success: false,
          message: 'Company not found!',
          response_code: ResponseCodes.NOT_FOUND,
        })
      }

      if (company) {
        values.company = company?._id as any
        values.company_name = company?.company_name
      }

      if (category_id && !category) {
        return sendResponse({
          res,
          success: false,
          message: 'Category not found!',
          response_code: ResponseCodes.NOT_FOUND,
        })
      }

      if (category) {
        values.category = category?._id as any
        values.category_name = category?.category_name
      }
    }

    const newDelegate = await DelegatesModel.create(values)

    if (!newDelegate) {
      return sendResponse({
        res,
        success: false,
        message: 'Delegate is not created, please try again',
        response_code: ResponseCodes.CREATE_FAILED,
      })
    }

    if (file) {
      const uploadResp = await UploadsHelpers.uploadAvatar({
        file: file,
        user_id: newDelegate.id,
      })

      if (!uploadResp.success) {
        return sendResponse({
          res,
          success: false,
          message: 'Upload failed for exhibitor logo, please try again!',
          response_code: ResponseCodes.UPLOAD_FAILED,
        })
      }

      newDelegate.avatar = uploadResp.uploadRecord.file_url

      await newDelegate.save()
    }

    if (events?.length) {
      await EventServices.addDelegate({
        delegate_id: newDelegate._id.toString(),
        event_ids: events,
      })
    }

    const emailRes = await EmailService.sendDelegateRegistrationEmail({
      first_name,
      last_name,
      email,
      password: passwordRes.password,
    })

    // TODO
    // Send email to new user with login information
    // Setup email server
    // Setup the email template for sending credentials as well

    return sendResponse({
      res,
      success: true,
      message: 'Delegate created successfully',
      response_code: ResponseCodes.CREATE_SUCCESS,
    })
  }
  static updateDelegateService=async (delegate_id: any, body: any, file: any, res: Response,sendResponse:any)=>{
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
      events = [],
      job_title,
      company_id,
      category_id,
      telephone,
    } = body
    console.log("line 359",delegate_id)
    const userId = delegate_id
    
    const delegate = await DelegatesModel.findByIdAndUpdate(
      userId,
      {},
      {
        new: true,
        }
        )
      console.log("line 369",delegate)

    if (!delegate) {
      return sendResponse({
        res,
        success: false,
        message: 'Delegate not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    if (company_id && delegate?.company?.toString() !== company_id?.trim()) {
      const company = await CompaniesModel.findById(company_id).lean()
      if (!company) {
        return sendResponse({
          res,
          success: false,
          message: 'Company not found!',
          response_code: ResponseCodes.NOT_FOUND,
        })
      }

      delegate.company_name = company.company_name
      delegate.company = company_id
    }

    if (category_id && delegate?.category?.toString() !== category_id?.trim()) {
      const category = await CategoriesModel.findById(category_id).lean()
      if (!category) {
        return sendResponse({
          res,
          success: false,
          message: 'Category not found!',
          response_code: ResponseCodes.NOT_FOUND,
        })
      }

      delegate.category_name = category.category_name
      delegate.category = category_id
    }

    let updatedEvents = delegate?.events.map((_id) => _id.toString())

    // Records to be deleted from references

    // TODO, we need to work on job titles and company modules
    let deletableJobTitles: string[] = []
    let deletableCompanies: string[] = []

    let deletableEvents: string[] = []

    if (events?.length) {
      updatedEvents.forEach((id: string) => {
        if (!events.includes(id)) {
          deletableEvents.push(id)
          updatedEvents = updatedEvents.filter((_id) => _id !== id)
        }
      })
    }

    events.forEach((id: string) => {
      if (!updatedEvents.includes(id)) {
        updatedEvents.push(id)
      }
    })

    if (email && delegate.email != email?.trim()) {
      const existingUser = await UserServices.getUserByEmail({
        email: email,
      })

      if (existingUser) {
        throw new APIError({
          code: ResponseCodes.ALREADY_EXIST,
          message: 'Email is already used by another user.',
          status: HttpStatusCode.BadRequest,
        })
      }

      await EventInvitationServices.changeEmailForInvites({
        new_email: email,
        old_email: delegate?.email?.trim(),
      })
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

    if (job_title) delegate.job_title = job_title
    if (events) delegate.events = events
    if (telephone) delegate.telephone = telephone

    const deleteEventReferences = async () => {
      if (!deletableEvents?.length) return true

      await EventServices.removeDelegateFromEvents({
        delegate_id: delegate._id.toString(),
        event_ids: deletableEvents,
      })

      return true
    }

    const addDelegateToEvents = async () => {
      if (!events.length) return true

      await EventServices.addDelegate({
        delegate_id: delegate._id.toString(),
        event_ids: events,
      })

      return true
    }

    const updateImage = async () => {
      if (file) {
        const uploadResp = await UploadsHelpers.uploadAvatar({
          file: file,
          user_id: delegate.id,
        })

        if (!uploadResp.success) {
          return sendResponse({
            res,
            success: false,
            message: 'Profile image upload failed, please try again!',
            response_code: ResponseCodes.UPLOAD_FAILED,
          })
        }

        if (delegate?.avatar) {
          await UploadsHelpers.deleteUpload({
            image_url: delegate.avatar,
          })
        }

        delegate.avatar = uploadResp.uploadRecord.file_url

        await delegate.save()

        return true
      }
      return true
    }

    await Promise.all([
      deleteEventReferences(),
      updateImage(),
      addDelegateToEvents(),
    ])

    await delegate.save()

    return sendResponse({
      res,
      success: true,
      message: 'Delegate updated successfully',
      response_code: ResponseCodes.UPDATE_SUCCESS,
    })
  }
}
