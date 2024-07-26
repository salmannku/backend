import Joi from 'joi'
import { CommonEnums } from '../enums/common.enums'

export class ProfileSurveyOptionValidations {
  static create = {
    body: Joi.object().keys({
      option_title: Joi.string().required(),
      description: Joi.string().allow(''),
      profile_survey_section_id: Joi.string().required(),
      option_type: Joi.string()
        .required()
        .equal(
          CommonEnums.profileSurveyOptionTypes.CHECKBOX,
          CommonEnums.profileSurveyOptionTypes.INPUT
        ),
    }),
  }

  static update = {
    body: Joi.object().keys({
      option_title: Joi.string().allow('', null),
      description: Joi.string().allow('', null),
      profile_survey_section_id: Joi.string().allow('', null),
      option_type: Joi.string()
        .allow('', null)
        .equal(
          CommonEnums.profileSurveyOptionTypes.CHECKBOX,
          CommonEnums.profileSurveyOptionTypes.INPUT
        ),
    }),
  }

  static fillOption = {
    body: Joi.object().keys({
      option_id: Joi.string().required(),
      checked: Joi.boolean().allow('', null).default(false),
      user_id: Joi.string().required(),
      text_input: Joi.string().allow('', null),
      user_type: Joi.string()
        .required()
        .equal(
          CommonEnums.users.delegate,
          CommonEnums.users.exhibitor,
          CommonEnums.users.sponsor,
          CommonEnums.users.speaker,
          CommonEnums.users.media_partner
        ),
    }),
  }

  static getFAQS = {
    query: Joi.object().keys({
      page: Joi.string().required(),
      limit: Joi.string().required(),
      search: Joi.string().allow(''),
      last_login: Joi.string().allow(''),
      created_at: Joi.string().allow(''),
    }),
  }
}
