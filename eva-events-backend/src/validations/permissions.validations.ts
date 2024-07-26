import Joi, { string } from 'joi'

export class PermissionValidations {
  static addPermission = {
    body: Joi.object().keys({
      name: Joi.string().required(),
      description: Joi.string().default('').allow(''),
    }),
  }

  static updatePermission = {
    body: Joi.object().keys({
      name: Joi.string().required(),
      description: Joi.string().default('').allow(''),
    }),
  }
}
