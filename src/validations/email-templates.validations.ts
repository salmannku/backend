import Joi from 'joi'
import { CommonEnums } from '../enums/common.enums'

export class EmailTemplateValidations {
  static update = {
    body: Joi.object().keys({
      event_id: Joi.string().required(),
      body_content: Joi.string().required(),
      user_type: Joi.string().required(),
      template_type: Joi.string().required(),
    }),
  }

  static getEmailTemplate = {
    query: Joi.object().keys({
      event_id: Joi.string().required(),
      user_type: Joi.string().required(),
      template_type: Joi.string().required(),
    }),
  }
}
