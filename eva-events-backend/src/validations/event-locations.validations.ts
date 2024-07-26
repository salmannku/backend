import Joi from 'joi'
import { CommonEnums } from '../enums/common.enums'

export class EventLocationValidations {
  static create = {
    body: Joi.object().keys({
      event_id: Joi.string().required(),
      locations: Joi.array()
        .items(
          Joi.object().keys({
            location_name: Joi.string().required(),
            assigned_to: Joi.string().allow('', null),
          })
        )
        .required(),
    }),
  }

  static update = {
    body: Joi.object().keys({
      location_name: Joi.string().allow('', null),
      assigned_to: Joi.string().allow('', null),
    }),
  }

  static getLocations = {
    query: Joi.object().keys({
      page: Joi.string().required(),
      limit: Joi.string().required(),
      search: Joi.string().allow(''),
      created_at: Joi.string().allow(''),
      assignee_id: Joi.string().allow(''),
    }),
  }
}
