import Joi from 'joi'

export class AdminValidations {
  static addAdmin = {
    body: Joi.object().keys({
      first_name: Joi.string().required(),
      last_name: Joi.string().required(),
      email: Joi.string().required(),
      phone: Joi.string().default('').allow(''),
      phone_country_code: Joi.string().default('').allow(''),
      profile_image: Joi.any(),
      roles: Joi.array().items(Joi.string()),
    }),
  }

  static login = {
    body: Joi.object().keys({
      email: Joi.string().required(),
      password: Joi.string().required(),
      remember: Joi.boolean().default(false),
    }),
  }

  static getAdmins = {
    query: Joi.object().keys({
      page: Joi.string().required(),
      limit: Joi.string().required(),
      search: Joi.string().allow(''),
      status: Joi.string().allow(''),
      last_login: Joi.string().allow(''),
      created_at: Joi.string().allow(''),
    }),
  }

  static updateAdmin = {
    body: Joi.object().keys({
      first_name: Joi.string().allow(null, ''),
      last_name: Joi.string().allow(null, ''),
      email: Joi.string().allow(null, ''),
      phone: Joi.string().default('').allow(null, ''),
      phone_country_code: Joi.string().default('').allow(null, ''),
      profile_image: Joi.any().allow(null),
      roles: Joi.array().items(Joi.string()),
      created_by: Joi.string().allow(null, ''),
    }),
  }

  static updateProfileImage = {
    body: Joi.object().keys({
      profile_image: Joi.any().allow(null),
    }),
  }

  static changePassword = {
    body: Joi.object().keys({
      new_password: Joi.string().required(),
      confirm_new_password: Joi.string().required(),
      old_password: Joi.string().required(),
    }),
  }

  static resetPassword = {
    body: Joi.object().keys({
      email: Joi.string().required(),
    }),
  }

  static createNewPassword = {
    body: Joi.object().keys({
      password: Joi.string().required(),
      reset_password_token: Joi.string().required(),
    }),
  }

  static getScheduledMeetingsForUser = {
    query: Joi.object().keys({
      page: Joi.string().required(),
      limit: Joi.string().required(),
      meeting_date: Joi.string().allow('').default('desc'),
      event_id: Joi.string().allow(''),
      user_id: Joi.string().required(),
    }),
  }
}
