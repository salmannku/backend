import Joi from 'joi'
import { CommonEnums } from '../enums/common.enums'

export class HotelValidations {
  static create = {
    body: Joi.object().keys({
      hotel_name: Joi.string().required(),
      description: Joi.string().allow(''),
      hotel_url: Joi.string().allow(''),
      hotel_email: Joi.string().allow(''),
      phone: Joi.string().default('').allow('', null),
      phone_country_code: Joi.string().default('').allow('', null),
      city: Joi.string().allow('', null),
      zip: Joi.string().allow('', null),
      country: Joi.string().required(),
      address_line_1: Joi.string().allow('', null),
      address_line_2: Joi.string().allow('', null),
      events: Joi.array(),
      hotel_images: Joi.array(),
    }),
  }

  static update = {
    body: Joi.object().keys({
      hotel_name: Joi.string().allow(null),
      description: Joi.string().allow('', null),
      hotel_url: Joi.string().allow('', null),
      hotel_email: Joi.string().allow('', null),
      phone: Joi.string().default('').allow('', null),
      phone_country_code: Joi.string().default('').allow('', null),
      city: Joi.string().allow('', null),
      country: Joi.string().allow(null),
      zip: Joi.string().allow('', null),
      address_line_1: Joi.string().allow('', null),
      address_line_2: Joi.string().allow('', null),
      events: Joi.array(),
      hotel_images: Joi.array(),
    }),
  }

  static addHotelsToEvent = {
    body: Joi.object().keys({
      event_id: Joi.string().required(),
      hotel_ids: Joi.array(),
    }),
  }

  static removeHotelFromEvents = {
    body: Joi.object().keys({
      hotel_id: Joi.string().required(),
      event_ids: Joi.array(),
    }),
  }

  static getHotels = {
    query: Joi.object().keys({
      page: Joi.string().required(),
      limit: Joi.string().required(),
      search: Joi.string().allow(''),
      last_login: Joi.string().allow(''),
      created_at: Joi.string().allow(''),
    }),
  }
}
