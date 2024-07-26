import Joi, { string } from 'joi'

export class UserValidations {
  static login = {
    body: Joi.object().keys({
      email: Joi.string().required(),
      password: Joi.string().required(),
    }),
  }

  static changePassword = {
    body: Joi.object().keys({
      new_password: Joi.string().required(),
      old_password: Joi.string().required(),
      event_id: Joi.string().required(),
    }),
  }

  static updateMeetingManagementSettings = {
    body: Joi.object().keys({
      availability: Joi.string().allow('', null),
      one_to_one_meeting_coordinator_name: Joi.string().allow('', null),
      one_to_one_meeting_coordinator_email: Joi.string().allow('', null),
      suggestions: Joi.string().allow('', null),
    }),
  }

  static getAllUsersForEvent = {
    query: Joi.object().keys({
      page: Joi.string().required(),
      limit: Joi.string().required(),
      status: Joi.string().allow(''),
      search: Joi.string().allow(''),
      created_at: Joi.string().allow(''),
    }),
  }

  static getUserDetails = {
    query: Joi.object().keys({
      user_type: Joi.string().required(),
      user_id: Joi.string().required(),
      event_id: Joi.string().required(),
    }),
  }

  static createMeetingRequest = {
    body: Joi.object().keys({
      meeting_date: Joi.string().required(),
      meeting_start_time: Joi.string().required(),
      meeting_end_time: Joi.string().required(),
      meeting_notes: Joi.string().allow('', null),
      converted_start_time: Joi.string().allow('', null),
      converted_end_time: Joi.string().allow('', null),
      requested_users: Joi.array(),
      meeting_location: Joi.string().required(),
    }),
  }

  static acceptMeeting = {
    query: Joi.object().keys({
      meeting_id: Joi.string().required(),
      requested_to: Joi.string().required(),
    }),
  }

  static cancelColleagueMeeting = {
    query: Joi.object().keys({
      meeting_id: Joi.string().required(),
    }),
  }

  static getMeetingRequestsByUser = {
    query: Joi.object().keys({
      page: Joi.string().required(),
      limit: Joi.string().required(),
      status: Joi.string().allow(''),
      search: Joi.string().allow(''),
      created_at: Joi.string().allow(''),
    }),
  }

  static getMeetingRequestsByOthersToUser = {
    query: Joi.object().keys({
      page: Joi.string().required(),
      limit: Joi.string().required(),
      status: Joi.string().allow(''),
      search: Joi.string().allow(''),
      created_at: Joi.string().allow(''),
    }),
  }

  static getScheduledMeetingsForUser = {
    query: Joi.object().keys({
      page: Joi.string().required(),
      limit: Joi.string().required(),
      meeting_date: Joi.string().allow(''),
    }),
  }

  static cancelMeeting = {
    body: Joi.object().keys({
      meeting_id: Joi.string().required(),
    }),
  }

  static rescheduleMeeting = {
    body: Joi.object().keys({
      meeting_date: Joi.string().allow('', null),
      meeting_start_time: Joi.string().allow('', null),
      meeting_end_time: Joi.string().allow('', null),
      meeting_notes: Joi.string().allow('', null),
      meeting_location: Joi.string().allow('', null),
    }),
  }

  static getBookedSchedules = {
    body: Joi.object().keys({
      event_id: Joi.string().required(),
      date: Joi.string().required(),
      participant_users: Joi.array(),
    }),
  }
}
