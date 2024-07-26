
import Joi from 'joi'
import { CommonEnums } from '../enums/common.enums'

export class categoriesValidations {
  static createCategory = {
    body: Joi.object().keys({
      category_name: Joi.string().required(),
      description: Joi.string().allow(''),
      // status: Joi.string().required(),
    }),
  }

  static updateCategory = {
    body: Joi.object().keys({
      category_name: Joi.string().required(),
      description: Joi.string().allow(''),
      // status: Joi.string().required(),
    }),
  }

  static getCategories = {
    query: Joi.object().keys({
      page: Joi.string().required(),
      limit: Joi.string().required(),
      search: Joi.string().allow(''),
      last_login: Joi.string().allow(''),
      created_at: Joi.string().allow(''),
    }),
  }
}

