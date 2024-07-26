import Joi from 'joi'
import { CommonEnums } from '../enums/common.enums'

export class ExhibitionInfoValidations {
  static saveInfo = {
    body: Joi.object().keys({
      content: Joi.string().required().allow(''),
      info_type: Joi.string()
        .required()
        .equal(
          CommonEnums.exhibitionInfo.general_information,
          CommonEnums.exhibitionInfo.exhibition_stand_information,
          CommonEnums.exhibitionInfo.additional_orders,
          CommonEnums.exhibitionInfo.shipping_information,
          CommonEnums.exhibitionInfo.exhibitor_insurance,
          CommonEnums.exhibitionInfo.product_demos,
          CommonEnums.exhibitionInfo.parking,
          CommonEnums.exhibitionInfo.deadlines,
          CommonEnums.exhibitionInfo.raising_your_profile,
          CommonEnums.exhibitionInfo.marketing_graphics
        ),
      event_id: Joi.string().required(),
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
