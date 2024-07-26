import Joi from 'joi'
import { CommonEnums } from '../enums/common.enums'

export class CompanyValidations {
  static create = {
    body: Joi.object().keys({
      company_name: Joi.string().required(),
      company_type: Joi.string().allow(null, ''),
      email: Joi.string().allow(null, ''),
      phone: Joi.string().allow(null, ''),
      phone_country_code: Joi.string().allow(null, ''),
      city: Joi.string().allow(null, ''),
      country: Joi.string().allow(null, ''),
      zip: Joi.string().allow(null, ''),
      address_line_1: Joi.string().allow(null, ''),
      description: Joi.string().allow(null, ''),
      company_URL: Joi.string().allow(null, ''),
      sponsor_type_id: Joi.string().allow('', null),
      company_logo: Joi.any(),
      bio: Joi.string().allow(null, ''),
    }),
  }

  static update = {
    body: Joi.object().keys({
      company_name: Joi.string().allow(null, ''),
      company_type: Joi.string().allow(null, ''),
      email: Joi.string().allow(null, ''),
      phone: Joi.string().allow(null, ''),
      phone_country_code: Joi.string().allow(null, ''),
      city: Joi.string().allow(null, ''),
      country: Joi.string().allow(null, ''),
      zip: Joi.string().allow(null, ''),
      address_line_1: Joi.string().allow(null, ''),
      description: Joi.string().allow(null, ''),
      company_URL: Joi.string().allow(null, ''),
      sponsor_type_id: Joi.string().allow('', null),
      company_logo: Joi.any(),
      bio: Joi.string().allow(null, ''),
    }),
  }

  static getCompanies = {
    query: Joi.object().keys({
      page: Joi.string().required(),
      limit: Joi.string().required(),
      search: Joi.string().allow(''),
      created_at: Joi.string().allow(''),
    }),
  }
}
