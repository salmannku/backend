import Joi from 'joi'
import { CommonEnums } from '../enums/common.enums'

export class FAQSValidations {
  static createFAQS = {
    body: Joi.object().keys({
      question: Joi.string().required(),
      answer: Joi.string().required(),
      event_id: Joi.array().items(Joi.string()),
    }),
  }

  static updateFAQS = {
    body: Joi.object().keys({
      question: Joi.string().required(),
      answer: Joi.string().required(),
      event_id: Joi.array().items(Joi.string()),
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
