import Joi from 'joi'
import { CommonEnums } from '../enums/common.enums'

export class SponsorValidations {
  static createSponsor = {
    body: Joi.object().keys({
      sponsor_name: Joi.string().required(),
      sponsor_type: Joi.string().allow('', null),
      sponsor_logo: Joi.any(),
      sponsor_description: Joi.string().allow('', null),
      sponsor_URL: Joi.string().allow('', null),
      representative_firstname: Joi.string().required(),
      representative_lastname: Joi.string().required(),
      sponsor_graphic: Joi.string().allow('', null),
      email: Joi.string().required(),
      phone: Joi.string().default('').allow('', null),
      telephone: Joi.string().default('').allow('', null),
      phone_country_code: Joi.string().default('').allow('', null),
      city: Joi.string().allow('', null),
      zip: Joi.string().allow('', null),
      state: Joi.string().allow('', null),
      job_title: Joi.string().allow('', null),
      country: Joi.string().allow('', null),
      address_line_1: Joi.string().allow('', null),
      address_line_2: Joi.string().allow('', null),
      events: Joi.array().items(Joi.string()),
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

  static getSponsors = {
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
      sponsor_name: Joi.string().allow('', null),
      sponsor_type: Joi.string().allow('', null),
      sponsor_logo: Joi.any(),
      sponsor_description: Joi.string().allow('', null),
      sponsor_URL: Joi.string().allow('', null),
      representative_firstname: Joi.string().allow('', null),
      representative_lastname: Joi.string().allow('', null),
      sponsor_graphic: Joi.string().allow('', null),
      email: Joi.string().allow('', null),
      phone: Joi.string().default('').allow('', null),
      telephone: Joi.string().default('').allow('', null),
      phone_country_code: Joi.string().default('').allow('', null),
      city: Joi.string().allow('', null),
      zip: Joi.string().allow('', null),
      state: Joi.string().allow('', null),
      country: Joi.string().allow('', null),
      job_title: Joi.string().allow('', null),
      address_line_1: Joi.string().allow('', null),
      address_line_2: Joi.string().allow('', null),
      events: Joi.array().items(Joi.string()),
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
