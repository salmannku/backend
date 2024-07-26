import Joi from 'joi'
import { CommonEnums } from '../enums/common.enums'

export class networkingEventsValidations {
  static createNetworkingEvent = {
    body: Joi.object().keys({
      event_name: Joi.string().required(),
      label_for_input_field: Joi.string().allow('', null),
      date: Joi.string().isoDate().required(),
      start_time: Joi.string().isoDate().required(),
      end_time: Joi.string().isoDate().required(),
      description: Joi.string().allow('', null),
      notes: Joi.string().allow('', null),
      location: Joi.string().allow('', null),
      theme: Joi.string().allow('', null),
      user_input_field: Joi.boolean().default(false),
      events: Joi.array(),
    }),
  }

  static updateNetworkingEvent = {
    body: Joi.object().keys({
      event_name: Joi.string().allow(null),
      label_for_input_field: Joi.string().allow('', null),
      date: Joi.string().isoDate().allow('', null),
      start_time: Joi.string().isoDate().allow('', null),
      end_time: Joi.string().isoDate().allow('', null),
      description: Joi.string().allow('', null),
      notes: Joi.string().allow('', null),
      location: Joi.string().allow('', null),
      theme: Joi.string().allow('', null),
      user_input_field: Joi.boolean().default(false),
    }),
  }

  static getNetworkingEvents = {
    query: Joi.object().keys({
      page: Joi.string().required(),
      limit: Joi.string().required(),
      search: Joi.string().allow(''),
      last_login: Joi.string().allow(''),
      created_at: Joi.string().allow(''),
    }),
  }

  static getNetworkingEventsForWeb = {
    query: Joi.object().keys({
      page: Joi.string().required(),
      limit: Joi.string().required(),
      search: Joi.string().allow(''),
    }),
  }

  static schedule = {
    body: Joi.object().keys({
      networking_event_id: Joi.string().required(),
      event_id: Joi.string().required(),
    }),
  }
}
