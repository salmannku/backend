import { Joi } from 'express-validation'

export class AnswersValidations {
  static getTrashList = {
    query: Joi.object().keys({
      page: Joi.string().required(),
      limit: Joi.string().required(),
    }),
  }

  static getDrafts = {
    query: Joi.object().keys({
      page: Joi.string().required(),
      limit: Joi.string().required(),
    }),
  }

  static getAnswersCompletedByExpert = {
    query: Joi.object().keys({
      page: Joi.string().required(),
      limit: Joi.string().required(),
    }),
  }
}
