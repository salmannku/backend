import { HttpStatusCode } from 'axios'
import { CommonEnums } from '../enums/common.enums'
import { PasswordHelpers, sendResponse } from '../helpers/common'
import { UploadsHelpers } from '../helpers/uploads.helpers'
import { APIError } from '../middlewares/errorHandler.middleware'
import CategoriesModel from '../models/categories.model'
import CompaniesModel from '../models/companies.model'
import DelegatesProfileSurveySelectionsModel from '../models/delegates-profile-survey-selections.model'
import DelegatesModel from '../models/delegates.model'
import ProfileSurveyOptionsModel, {
  IProfileSurveyOptionsModelSchema,
} from '../models/profile-survey-options.model'
import ProfileSurveySectionsModel from '../models/profile-survey-sections.model'
import SpeakerProfileSurveySelectionsModel from '../models/speaker-profile-survey-selections.model'
import SpeakersModel from '../models/speakers.model'
import SponsorProfileSurveySelectionsModel from '../models/sponsor-profile-survey-selections.model'
import ResponseCodes from '../utils/responseCodes'
import { EmailService } from './email'
import { EventServices } from './event.services'
import { UserServices } from './users.services'
import { EventInvitationServices } from './event-invitation.service'

export class SpeakerServices {
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
          SpeakerProfileSurveySelectionsModel.find({
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

  static addSpeaker=async (user: any, body: any, file: any, res: any,sendResponse:any)=>{

    let {
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
      speaker_URL,
      speaker_linkedin,
      events = [],
      job_title,
      company_id,
      category_id,
      telephone,
    } = body;

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
      user_type: CommonEnums.users.speaker,
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
      job_title,
      address_line_1,
      address_line_2,
      speaker_URL,
      speaker_linkedin,
      events,
      created_by: user?._id,
      password: passwordRes.encrypted,
      telephone,
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

    const newSpeaker = await SpeakersModel.create(values)

    if (!newSpeaker) {
      return sendResponse({
        res,
        success: false,
        message: 'Speaker is not created, please try again',
        response_code: ResponseCodes.CREATE_FAILED,
      })
    }

    if (file) {
      const uploadResp = await UploadsHelpers.uploadAvatar({
        file: file,
        user_id: newSpeaker.id,
      })

      if (!uploadResp.success) {
        return sendResponse({
          res,
          success: false,
          message: 'Upload failed for speaker profile logo, please try again!',
          response_code: ResponseCodes.UPLOAD_FAILED,
        })
      }

      newSpeaker.avatar = uploadResp.uploadRecord.file_url

      await newSpeaker.save()
    }

    if (events?.length) {
      await EventServices.addSpeaker({
        speaker_id: newSpeaker._id.toString(),
        event_ids: events,
      })
    }

    const emailRes = await EmailService.sendSpeakerRegistrationEmail({
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
      message: 'Speaker created successfully',
      response_code: ResponseCodes.CREATE_SUCCESS,
    })
  }
  static updateSpeaker=async (speaker_id: any, body: any, file: any, res: any,sendResponse:any)=>{
    let {
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
      speaker_URL,
      speaker_linkedin,
      events = [],
      company_id,
      category_id,
      job_title,
      telephone,
    } = body;

    const userId = speaker_id
    const oldUser = await SpeakersModel.findByIdAndUpdate(
      userId,
      {},
      {
        new: true,
      }
    )

    if (!oldUser) {
      return sendResponse({
        res,
        success: false,
        message: 'Speaker not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    if (company_id && oldUser?.company?.toString() !== company_id?.trim()) {
      const company = await CompaniesModel.findById(company_id).lean()
      if (!company) {
        return sendResponse({
          res,
          success: false,
          message: 'Company not found!',
          response_code: ResponseCodes.NOT_FOUND,
        })
      }

      oldUser.company_name = company.company_name
      oldUser.company = company_id
    }

    if (category_id && oldUser?.category?.toString() !== category_id?.trim()) {
      const category = await CategoriesModel.findById(category_id).lean()
      if (!category) {
        return sendResponse({
          res,
          success: false,
          message: 'Category not found!',
          response_code: ResponseCodes.NOT_FOUND,
        })
      }

      oldUser.category_name = category.category_name
      oldUser.category = category_id
    }

    let updatedEvents = oldUser?.events.map((_id) => _id.toString())

    // Records to be deleted from references

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

    const updateData: any = {}

    if (email && oldUser.email != email?.trim()) {
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
        old_email: oldUser?.email?.trim(),
      })
    }

    if (first_name) oldUser.first_name = first_name
    if (last_name) oldUser.last_name = last_name
    if (email) oldUser.email = email
    if (bio || bio == '') oldUser.bio = bio
    if (phone || phone == '') oldUser.phone = phone
    if (speaker_URL || speaker_URL == '') oldUser.speaker_URL = speaker_URL
    if (city) oldUser.city = city
    if (country) oldUser.country = country

    if (phone_country_code || phone_country_code == '')
      oldUser.phone_country_code = phone_country_code

    if (job_title || job_title == '') oldUser.job_title = job_title

    if (zip || zip == '') oldUser.zip = zip

    if (address_line_1 || address_line_1 == '')
      oldUser.address_line_1 = address_line_1

    if (address_line_2 || address_line_2 == '')
      oldUser.address_line_2 = address_line_2

    if (speaker_linkedin || speaker_linkedin == '')
      oldUser.speaker_linkedin = speaker_linkedin

    if (telephone || telephone == '') oldUser.telephone = telephone

    oldUser.events = events

    const deleteEventReferences = async () => {
      if (!deletableEvents?.length) return true

      await EventServices.removeSpeakerFromEvents({
        speaker_id: oldUser._id.toString(),
        event_ids: deletableEvents,
      })

      return true
    }

    const addUserToEvents = async () => {
      if (!events.length) return true

      await EventServices.addSpeaker({
        speaker_id: oldUser._id.toString(),
        event_ids: events,
      })

      return true
    }

    const updateImage = async () => {
      if (file) {
        const uploadResp = await UploadsHelpers.uploadAvatar({
          file: file,
          user_id: oldUser.id,
        })

        if (!uploadResp.success) {
          return sendResponse({
            res,
            success: false,
            message: 'Profile image upload failed, please try again!',
            response_code: ResponseCodes.UPLOAD_FAILED,
          })
        }

        if (oldUser?.avatar) {
          await UploadsHelpers.deleteUpload({
            image_url: oldUser.avatar,
          })
        }

        oldUser.avatar = uploadResp.uploadRecord.file_url

        await oldUser.save()

        return true
      }
      return true
    }

    await Promise.all([
      deleteEventReferences(),
      updateImage(),
      addUserToEvents(),
    ])

    await oldUser.save()

    return sendResponse({
      res,
      success: true,
      message: 'Speaker updated successfully',
      response_code: ResponseCodes.UPDATE_SUCCESS,
    })
  }

}
