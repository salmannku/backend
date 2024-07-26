// conferenc-programs.validations
import Joi from 'joi'

export class conferencProgramsValidations {
  static createConferencProgramme = {
    body: Joi.object().keys({
      title: Joi.string().required(),
      subtitle: Joi.string().allow('', null),
      date: Joi.string().required(),
      time_from: Joi.string().required(),
      time_to: Joi.string().required(),
      add_to_calender: Joi.boolean().default(false),
      description: Joi.string().allow(''),
      events: Joi.array().items(Joi.string()),
      sponsors: Joi.array().items(Joi.string()),
    }),
  }

  static updateConferencProgramme = {
    body: Joi.object().keys({
      title: Joi.string().allow('', null),
      subtitle: Joi.string().allow('', null),
      date: Joi.string().allow('', null),
      time_from: Joi.string().allow('', null),
      time_to: Joi.string().allow('', null),
      add_to_calender: Joi.boolean().default(false),
      description: Joi.string().allow('', null),
      events: Joi.array().items(Joi.string()),
      sponsors: Joi.array().items(Joi.string()),
    }),
  }

  static getConferencPrograms = {
    query: Joi.object().keys({
      page: Joi.string().required(),
      limit: Joi.string().required(),
      search: Joi.string().allow(''),
      last_login: Joi.string().allow(''),
      date: Joi.string().allow(''),
      created_at: Joi.string().allow(''),
    }),
  }

  static getSchedulesForUser = {
    query: Joi.object().keys({
      page: Joi.string().required(),
      limit: Joi.string().required(),
      search: Joi.string().allow(''),
      date: Joi.string().allow(''),
    }),
  }

  static addToSchedule = {
    body: Joi.object().keys({
      conference_programme_id: Joi.string().required(),
      event_id: Joi.string().required(),
    }),
  }

  static cancelConferenceProgrammeFromSchedule = {
    body: Joi.object().keys({
      conference_programme_schedule_id: Joi.string().required(),
    }),
  }
}
