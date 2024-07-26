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
import SponsorProfileSurveySelectionsModel from '../models/sponsor-profile-survey-selections.model'
import SponsorsModel from '../models/sponsors.model'
import ResponseCodes from '../utils/responseCodes'
import { EmailService } from './email'
import { EventServices } from './event.services'
import { UserServices } from './users.services'
import { EventInvitationServices } from './event-invitation.service'

export class SponsorServices {
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
          SponsorProfileSurveySelectionsModel.find({
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
  static addSponsor=async (user:any,body:any,file:any,res:any,sendResponse:any)=>{
    {
      const {
        sponsor_name,
        sponsor_logo,
        sponsor_description,
        sponsor_URL,
        representative_firstname,
        representative_lastname,
  
        //TODO
  
        // Need to work on sponsor graphics field
        // Sponsor graphics field is image from the event
        // sponsor_graphic,
        email,
        phone,
        phone_country_code,
        country,
        city,
        zip,
        job_title,
        // state,
        address_line_1,
        address_line_2,
        events = [],
        company_id,
        category_id,
        telephone,
        sponsor_type,
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
        user_type: CommonEnums.users.sponsor,
      })
  
      const values: any = {
        sponsor_name,
        sponsor_type,
        sponsor_logo,
        sponsor_description,
        sponsor_URL,
        representative_firstname,
        representative_lastname,
        email,
        phone,
        phone_country_code,
        city,
        country,
        zip,
        job_title,
        // state,
        address_line_1,
        address_line_2,
        events,
        password: passwordRes.encrypted,
        created_by: user?._id,
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
  
      // Setup logic to upload the profile image
  
      const newSponsor = await SponsorsModel.create(values)
  
      if (!newSponsor) {
        return sendResponse({
          res,
          success: false,
          message: 'Sponsor is not created, please try again',
          response_code: ResponseCodes.CREATE_FAILED,
        })
      }
  
      if (file) {
        const uploadResp = await UploadsHelpers.uploadAvatar({
          file: file,
          user_id: newSponsor.id,
        })
  
        if (!uploadResp.success) {
          return sendResponse({
            res,
            success: false,
            message: 'Upload failed for exhibitor logo, please try again!',
            response_code: ResponseCodes.UPLOAD_FAILED,
          })
        }
  
        newSponsor.sponsor_logo = uploadResp.uploadRecord.file_url
  
        await newSponsor.save()
      }
  
      if (events?.length) {
        await EventServices.addSponsor({
          sponsor_id: newSponsor._id.toString(),
          event_ids: events,
        })
      }
  
      const emailRes = await EmailService.sendSponsorRegistrationEmail({
        name: sponsor_name,
        password: passwordRes.password,
        email,
      })
  
      return sendResponse({
        res,
        success: true,
        message: 'Sponsor created successfully',
        response_code: ResponseCodes.CREATE_SUCCESS,
      })
    }
  }
  static updateSponsor=async (sponsor_id:any,body:any,file:any,res:any,sendResponse:any)=>{
    const {
      sponsor_name,
      sponsor_logo,
      sponsor_description,
      sponsor_URL,
      representative_firstname,
      representative_lastname,

      //TODO

      // Need to work on sponsor graphics field
      // Sponsor graphics field is image from the event
      // sponsor_graphic,
      email,
      phone,
      phone_country_code,
      country,
      city,
      zip,
      address_line_1,
      address_line_2,
      events = [],
      company_id,
      category_id,
      job_title,
      telephone,
      sponsor_type
    } = body

    const userId = sponsor_id
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

    if (company_id && user?.company?.toString() !== company_id?.trim()) {
      const company = await CompaniesModel.findById(company_id).lean()
      if (!company) {
        return sendResponse({
          res,
          success: false,
          message: 'Company not found!',
          response_code: ResponseCodes.NOT_FOUND,
        })
      }

      user.company_name = company.company_name
      user.company = company_id
    }

    if (category_id && user?.category?.toString() !== category_id?.trim()) {
      const category = await CategoriesModel.findById(category_id).lean()
      if (!category) {
        return sendResponse({
          res,
          success: false,
          message: 'Category not found!',
          response_code: ResponseCodes.NOT_FOUND,
        })
      }

      user.category_name = category.category_name
      user.category = category_id
    }

    let updatedEvents = user?.events.map((_id) => _id.toString())

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

    if (email && user.email != email?.trim()) {
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
        old_email: user?.email?.trim(),
      })
    }

    // Required fields
    if (sponsor_name) user.sponsor_name = sponsor_name
    if (sponsor_type) user.sponsor_type = sponsor_type
    if (sponsor_URL) user.sponsor_URL = sponsor_URL
    if (representative_firstname)
      user.representative_firstname = representative_firstname
    if (representative_lastname)
      user.representative_lastname = representative_lastname
    if (email) user.email = email
    if (country) user.country = country

    // Not required fields
    if (sponsor_description || sponsor_description === '')
      user.sponsor_description = sponsor_description
    if (phone || phone === '') user.phone = phone
    if (phone_country_code || phone_country_code === '')
      user.phone_country_code = phone_country_code
    if (city || city === '') user.city = city
    if (zip || zip === '') user.zip = zip
    if (address_line_1 || address_line_1 === '')
      user.address_line_1 = address_line_1
    if (address_line_2 || address_line_2 === '')
      user.address_line_2 = address_line_2
    if (events || events === '') user.events = events
    if (job_title || job_title == '') user.job_title = job_title
    if (telephone || telephone == '') user.telephone = telephone

    const deleteEventReferences = async () => {
      if (!deletableEvents?.length) return true

      await EventServices.removeSponsorFromEvents({
        sponsor_id: user._id.toString(),
        event_ids: deletableEvents,
      })

      return true
    }

    const addUserToEvents = async () => {
      if (!events.length) return true

      await EventServices.addSponsor({
        sponsor_id: user._id.toString(),
        event_ids: events,
      })

      return true
    }

    const updateImage = async () => {
      if (file) {
        const uploadResp = await UploadsHelpers.uploadAvatar({
          file: file,
          user_id: user.id,
        })

        if (!uploadResp.success) {
          return sendResponse({
            res,
            success: false,
            message: 'Profile image upload failed, please try again!',
            response_code: ResponseCodes.UPLOAD_FAILED,
          })
        }

        if (user?.sponsor_logo) {
          await UploadsHelpers.deleteUpload({
            image_url: user.sponsor_logo,
          })
        }

        user.sponsor_logo = uploadResp.uploadRecord.file_url

        await user.save()
      }
      return true
    }

    await Promise.all([
      deleteEventReferences(),
      updateImage(),
      addUserToEvents(),
    ])

    await user.save()

    return sendResponse({
      res,
      success: true,
      message: 'Sponsor updated successfully',
      response_code: ResponseCodes.UPDATE_SUCCESS,
    })
  }
}
