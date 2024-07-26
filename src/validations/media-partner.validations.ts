import Joi from 'joi'
import { CommonEnums } from '../enums/common.enums'

export class MediaPartnerValidations {
  static createMediaPartner = {
    body: Joi.object().keys({
      first_name: Joi.string().required(),
      last_name: Joi.string().required(),
      email: Joi.string().required(),
      phone: Joi.string().default('').allow('', null),
      telephone: Joi.string().default('').allow('', null),
      description: Joi.string().allow('', null),
      phone_country_code: Joi.string().default('').allow('', null),
      logo: Joi.any(),
      // city: Joi.string().allow('', null),
      // zip: Joi.string().allow('', null),
      // state: Joi.string().allow('', null),
      // country: Joi.string().required(),
      // address_line_1: Joi.string().allow('', null),
      // address_line_2: Joi.string().allow('', null),
      job_title: Joi.string().allow('', null),
      events: Joi.array().items(Joi.string()),
      mediapartner_URL: Joi.string().allow('', null),
      company_id: Joi.string().allow('', null),
      category_id: Joi.string().allow('', null),
    }),
  }

  static login = {
    body: Joi.object().keys({
      email: Joi.string().required(),
      password: Joi.string().required(),
      remember: Joi.boolean().default(false),
    }),
  }

  static getMediaPartners = {
    query: Joi.object().keys({
      page: Joi.string().required(),
      limit: Joi.string().required(),
      search: Joi.string().allow(''),
      status: Joi.string().allow(''),
      last_login: Joi.string().allow(''),
      created_at: Joi.string().allow(''),
    }),
  }

  static update = {
    body: Joi.object().keys({
      first_name: Joi.string().allow('', null),
      last_name: Joi.string().allow('', null),
      email: Joi.string().allow('', null),
      phone: Joi.string().allow('', null),
      telephone: Joi.string().default('').allow('', null),
      description: Joi.string().allow('', null).allow('', null),
      phone_country_code: Joi.string().allow('', null),
      logo: Joi.any(),
      // city: Joi.string().allow('', null),
      // zip: Joi.string().allow('', null),
      // state: Joi.string().allow('', null),
      // country: Joi.string().allow('', null),
      // address_line_1: Joi.string().allow('', null),
      // address_line_2: Joi.string().allow('', null),
      job_title: Joi.string().allow('', null),
      events: Joi.array().items(Joi.string()),
      mediapartner_URL: Joi.string().allow('', null),
      company_id: Joi.string().allow('', null),
      category_id: Joi.string().allow('', null),
    }),
  }

  static getAssignedEvents = {
    query: Joi.object().keys({
      page: Joi.string().required(),
      limit: Joi.string().required(),
      search: Joi.string().allow(''),
      created_at: Joi.string().allow(''),
    }),
  }

  static changeAccountStatus = {
    body: Joi.object().keys({
      status: Joi.string()
        .required()
        .equal(
          CommonEnums.status.ACTIVE,
          CommonEnums.status.DISABLED,
          CommonEnums.status.DRAFT
        ),
    }),
  }
}
