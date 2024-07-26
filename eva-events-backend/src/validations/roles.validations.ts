import Joi, { string } from 'joi'

export class RoleValidations {
  static addRole = {
    body: Joi.object().keys({
      role_name: Joi.string().required(),
      role_description: Joi.string().default('').allow(''),
      permissions: Joi.array().items(Joi.string()),
    }),
  }

  static updateRole = {
    body: Joi.object().keys({
      role_name: Joi.string().required(),
      role_description: Joi.string().default('').allow(''),
      permissions: Joi.array().items(Joi.string()),
    }),
  }
}
