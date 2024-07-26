import { isValidObjectId } from 'mongoose'
import { catchAsync } from '../../utils/catchAsync'
import ResponseCodes from '../../utils/responseCodes'
import { ObjectId } from 'mongodb'
import faqModel from '../../models/faqs.model'
import ProfileSurveyOptionsModel from '../../models/profile-survey-options.model'
import { sendResponse } from '../../helpers/common'
import ProfileSurveySectionsModel from '../../models/profile-survey-sections.model'
import { CommonEnums } from '../../enums/common.enums'
import DelegatesProfileSurveySelectionsModel from '../../models/delegates-profile-survey-selections.model'
import ExhibitorProfileSurveySelectionsModel from '../../models/exhibitor-profile-survey-selections.model'
import SponsorProfileSurveySelectionsModel from '../../models/sponsor-profile-survey-selections.model'
import SpeakerProfileSurveySelectionsModel from '../../models/speaker-profile-survey-selections.model'
import MediaPartnerProfileSurveySelectionsModel from '../../models/media-partner-profile-survey-selections.model'

export class ProfileSurveyOptionsController {
  static create = catchAsync(async (req: any, res: any) => {
    let {
      option_title,
      description,
      option_type,
      profile_survey_section_id,
      // order,
    } = req.body

    const existing = await ProfileSurveyOptionsModel.findOne({
      option_title: option_title.trim(),
    })

    if (existing) {
      return sendResponse({
        res,
        success: false,
        message: 'Survey option already exists',
        response_code: ResponseCodes.ALREADY_EXIST,
      })
    }

    const surveySection = await ProfileSurveySectionsModel.findByIdAndUpdate(
      profile_survey_section_id,
      {},
      {
        new: true,
      }
    )

    if (!surveySection) {
      return sendResponse({
        res,
        success: false,
        message: 'Survey section not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    const optionWithMaxOrder = await ProfileSurveyOptionsModel.findOne({
      profile_survey_section_id,
    }).sort('-order')

    let order = 0

    if (optionWithMaxOrder) {
      order = optionWithMaxOrder.order + 1
    }

    const newOption = await ProfileSurveyOptionsModel.create({
      option_title,
      description,
      option_type,
      profile_survey_section_id,
      order,
    })

    if (!newOption) {
      return sendResponse({
        res,
        success: false,
        message: 'Survey option not created, try again!',
        response_code: ResponseCodes.CREATE_FAILED,
      })
    }

    surveySection.survey_options.push(newOption._id)

    await surveySection.save()

    return sendResponse({
      res,
      success: true,
      message: 'Survey option created successfully',
      response_code: ResponseCodes.CREATE_SUCCESS,
    })
  })

  static delete = catchAsync(async (req: any, res: any) => {
    const optionId = req?.params?.survey_option_id

    const deleteResponse = await ProfileSurveyOptionsModel.findByIdAndDelete(
      optionId
    )

    /**
     * TODO
     *
     * Run cleanup on delete the options
     *
     * Delete the option from selection collections and from the survey section as well
     */

    if (!deleteResponse) {
      return sendResponse({
        res,
        success: false,
        message: 'Survey option not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    const surveySection = await ProfileSurveySectionsModel.findByIdAndUpdate(
      deleteResponse.profile_survey_section_id,
      {},
      {
        new: true,
      }
    )

    if (surveySection) {
      const options = surveySection.survey_options.map((_id) => _id.toString())

      let updatedOptions = options.filter((_id) => _id != optionId.toString())

      ;(surveySection as any).survey_options = updatedOptions

      await surveySection.save()
    }

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.DELETE_SUCCESS,
    })
  })

  static updateSurveyOption = catchAsync(async (req: any, res: any) => {
    const optionId = req?.params?.survey_option_id

    let {
      option_title,
      description,
      option_type,
      profile_survey_section_id,
      order,
    } = req.body

    const updateResponse = await ProfileSurveyOptionsModel.findByIdAndUpdate(
      optionId,
      {},
      {
        new: true,
      }
    )

    if (!updateResponse) {
      return sendResponse({
        res,
        success: false,
        message: 'Survey option not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    if (option_title) updateResponse.option_title = option_title
    else updateResponse.option_title = updateResponse.option_title

    if (description) updateResponse.description = description
    else updateResponse.description = updateResponse.description

    if (option_type) updateResponse.option_type = option_type
    else updateResponse.option_type = updateResponse.option_type

    if (profile_survey_section_id)
      updateResponse.profile_survey_section_id = profile_survey_section_id
    else
      updateResponse.profile_survey_section_id =
        updateResponse.profile_survey_section_id

    if (order) updateResponse.order = order
    else updateResponse.order = updateResponse.order

    await updateResponse.save()

    return sendResponse({
      res,
      success: true,
      message: 'Survey option updated successfully',
      response_code: ResponseCodes.UPDATE_SUCCESS,
      data: null,
    })
  })

  static fillOption = catchAsync(async (req: any, res: any) => {
    let {
      option_id,
      checked = false,
      text_input = '',
      selection_record_id,
    } = req.body
    const user = req?.user

    const userType = user?.user_type

    const option = await ProfileSurveyOptionsModel.findById(option_id.trim())

    if (!option) {
      return sendResponse({
        res,
        success: false,
        message: 'Survey option already exists',
        response_code: ResponseCodes.ALREADY_EXIST,
      })
    }

    let updateValues: any = {
      selected: checked,
      text_input,
    }

    let createValues = {
      profile_survey_section: selection_record_id,
      selected: checked,
      survey_option: option._id,
      text_input: text_input,
      user_type: userType,
      user: user?._id,
      order: option.order,
    }

    let updateRes: any

    let findQuery = {
      user: user._id,
      profile_survey_section: option?.profile_survey_section_id,
      survey_option: option?._id,
      order: option?.order,
    }

    if (userType === CommonEnums.users.delegate) {
      updateRes = await DelegatesProfileSurveySelectionsModel.findOneAndUpdate(
        findQuery,
        updateValues,
        {
          new: true,
        }
      )

      if (updateRes) {
        updateRes = await DelegatesProfileSurveySelectionsModel.create(
          createValues
        )
      }
    }

    if (userType === CommonEnums.users.exhibitor) {
      updateRes = await ExhibitorProfileSurveySelectionsModel.findOneAndUpdate(
        selection_record_id,
        updateValues,
        {
          new: true,
        }
      )

      if (updateRes) {
        updateRes = await ExhibitorProfileSurveySelectionsModel.create(
          createValues
        )
      }
    }

    if (userType === CommonEnums.users.sponsor) {
      updateRes = await SponsorProfileSurveySelectionsModel.findOneAndUpdate(
        selection_record_id,
        updateValues,
        {
          new: true,
        }
      )

      if (updateRes) {
        updateRes = await SponsorProfileSurveySelectionsModel.create(
          createValues
        )
      }
    }

    if (userType === CommonEnums.users.media_partner) {
      updateRes =
        await MediaPartnerProfileSurveySelectionsModel.findOneAndUpdate(
          selection_record_id,
          updateValues,
          {
            new: true,
          }
        )

      if (updateRes) {
        updateRes = await MediaPartnerProfileSurveySelectionsModel.create(
          createValues
        )
      }
    }

    if (userType === CommonEnums.users.speaker) {
      updateRes = await SpeakerProfileSurveySelectionsModel.findOneAndUpdate(
        selection_record_id,
        updateValues,
        {
          new: true,
        }
      )

      if (updateRes) {
        updateRes = await SpeakerProfileSurveySelectionsModel.create(
          createValues
        )
      }
    }

    if (!updateRes) {
      return sendResponse({
        res,
        success: false,
        message: 'Survey option not filled up, try again!',
        response_code: ResponseCodes.CREATE_FAILED,
      })
    }

    return sendResponse({
      res,
      success: true,
      message: 'Survey option created successfully',
      response_code: ResponseCodes.CREATE_SUCCESS,
    })
  })

  /**
   * Profile section controllers
   */

  static getProfileSurveySections = catchAsync(async (req: any, res: any) => {
    const sections = await ProfileSurveySectionsModel.find({})
      .sort({
        order: 1,
      })
      .lean()

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.GET_SUCCESS,
      data: sections,
    })
  })

  static getProfileSurveySectionsWithOptions = catchAsync(
    async (req: any, res: any) => {
      const sections = await ProfileSurveySectionsModel.find({})
        .sort({
          order: 1,
        })
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

      return sendResponse({
        res,
        success: true,
        response_code: ResponseCodes.GET_SUCCESS,
        data: sections,
      })
    }
  )
}
