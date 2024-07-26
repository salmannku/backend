import Joi, { string } from 'joi'

export class EventValidations {
  static addEvent = {
    body: Joi.object().keys({
      name: Joi.string().required(),
      description: Joi.string().allow(''),
      featured_image: Joi.any(),
      venue_city: Joi.string().allow('', null),
      event_logo: Joi.string().allow('', null),
      venue_zip: Joi.string().allow('', null),
      // venue_state: Joi.string().allow('', null),
      venue_country: Joi.string().allow('', null),
      venue_address_line_1: Joi.string().allow('', null),
      venue_address_line_2: Joi.string().allow('', null),
      start_date: Joi.string().required(),
      end_date: Joi.string(),
      start_time: Joi.string().required(),
      end_time: Joi.string(),
      time_zone: Joi.string().allow('', null),
      time_zone_value: Joi.string().allow('', null),
      delegates: Joi.array().items(Joi.string()),
      exhibitors: Joi.array().items(Joi.string()),
      sponsors: Joi.array().items(Joi.string()),
      speakers: Joi.array().items(Joi.string()),
      media_partners: Joi.array().items(Joi.string()),
      faqs: Joi.array().items(Joi.string()),
      hotels: Joi.array().items(Joi.string()),
      conference_programmes: Joi.array().items(Joi.string()),
      poster_images: Joi.array().items(Joi.string()),
    }),
  }

  static updateEvent = {
    body: Joi.object().keys({
      name: Joi.string().allow('', null),
      description: Joi.string().allow('', null),
      venue_city: Joi.string().allow('', null),
      venue_zip: Joi.string().allow('', null),
      event_logo: Joi.string().allow('', null),
      venue_state: Joi.string().allow('', null),
      venue_country: Joi.string().allow('', null),
      venue_address_line_2: Joi.string().allow('', null),
      start_date: Joi.string().allow('', null),
      end_date: Joi.string().allow('', null),
      start_time: Joi.string().allow('', null),
      end_time: Joi.string().allow('', null),
      time_zone: Joi.string().allow('', null),
      time_zone_value: Joi.string().allow('', null),
      venue_address_line_1: Joi.string().allow('', null),
      featured_image: Joi.any().allow(null),
      delegates: Joi.array().items(Joi.string()),
      exhibitors: Joi.array().items(Joi.string()),
      speakers: Joi.array().items(Joi.string()),
      media_partners: Joi.array().items(Joi.string()),
      sponsors: Joi.array().items(Joi.string()),
      faqs: Joi.array().items(Joi.string()),
      hotels: Joi.array().items(Joi.string()),
      conference_programmes: Joi.array().items(Joi.string()),
      poster_images: Joi.array().items(Joi.string()),
    }),
  }

  static uploadVenueMap = {
    body: Joi.object().keys({
      venue_map: Joi.any(),
    }),
  }

  static getEvents = {
    query: Joi.object().keys({
      page: Joi.string().required(),
      limit: Joi.string().required(),
      search: Joi.string().allow(''),
      status: Joi.string().allow(''),
      created_at: Joi.string().allow(''),
    }),
  }

  static getEventDetails = {
    query: Joi.object().keys({
      poster_images: Joi.string().required(),
    }),
  }

  static getGalleryImages = {
    query: Joi.object().keys({
      // page: Joi.string().required(),
      limit: Joi.string().required(),
    }),
  }

  static getDelegates = {
    query: Joi.object().keys({
      page: Joi.string().required(),
      limit: Joi.string().required(),
      search: Joi.string().allow(''),
      created_at: Joi.string().allow(''),
    }),
  }

  static getExhibitors = {
    query: Joi.object().keys({
      page: Joi.string().required(),
      limit: Joi.string().required(),
      search: Joi.string().allow(''),
      created_at: Joi.string().allow(''),
    }),
  }

  static getSponsors = {
    query: Joi.object().keys({
      page: Joi.string().required(),
      limit: Joi.string().required(),
      search: Joi.string().allow(''),
      created_at: Joi.string().allow(''),
    }),
  }

  static getSpeakers = {
    query: Joi.object().keys({
      page: Joi.string().required(),
      limit: Joi.string().required(),
      search: Joi.string().allow(''),
      created_at: Joi.string().allow(''),
    }),
  }

  static getMediaPartners = {
    query: Joi.object().keys({
      page: Joi.string().required(),
      limit: Joi.string().required(),
      search: Joi.string().allow(''),
      created_at: Joi.string().allow(''),
    }),
  }

  static sendInviteToDelegate = {
    body: Joi.object().keys({
      user_ids: Joi.array().items(Joi.string()),
    }),
  }

  static sendInviteToExhibitor = {
    body: Joi.object().keys({
      user_ids: Joi.array().items(Joi.string()),
    }),
  }

  static sendInviteToSpeaker = {
    body: Joi.object().keys({
      user_ids: Joi.array().items(Joi.string()),
    }),
  }

  static sendInviteToMediaPartners = {
    body: Joi.object().keys({
      user_ids: Joi.array().items(Joi.string()),
    }),
  }

  static sendInviteToSponsors = {
    body: Joi.object().keys({
      user_ids: Joi.array().items(Joi.string()),
    }),
  }

  static eventInvitationStatus = {
    body: Joi.object().keys({
      user_id: Joi.string().required(),
      user_type: Joi.string().required(),
    }),
  }

  static loginToEvent = {
    body: Joi.object().keys({
      email: Joi.string().required(),
      password: Joi.string().required(),
      event_id: Joi.string().required(),
    }),
  }

  static addDelegates = {
    body: Joi.object().keys({
      delegate_ids: Joi.array().items(Joi.string()),
    }),
  }

  static addExhibitors = {
    body: Joi.object().keys({
      exhibitor_ids: Joi.array().items(Joi.string()),
    }),
  }

  static addSponsors = {
    body: Joi.object().keys({
      sponsor_ids: Joi.array().items(Joi.string()),
    }),
  }

  static addSpeakers = {
    body: Joi.object().keys({
      speaker_ids: Joi.array().items(Joi.string()),
    }),
  }

  static addMediaPartners = {
    body: Joi.object().keys({
      media_partner_ids: Joi.array().items(Joi.string()),
    }),
  }

  static removeDelegatesFromEvent = {
    body: Joi.object().keys({
      delegate_ids: Joi.array().items(Joi.string()),
    }),
  }

  static removeExhibitorsFromEvent = {
    body: Joi.object().keys({
      exhibitor_ids: Joi.array().items(Joi.string()),
    }),
  }

  static removeSponsorsFromEvent = {
    body: Joi.object().keys({
      sponsor_ids: Joi.array().items(Joi.string()),
    }),
  }

  static removeSpeakersFromEvent = {
    body: Joi.object().keys({
      speakers_ids: Joi.array().items(Joi.string()),
    }),
  }

  static removeMediaPartnersFromEvent = {
    body: Joi.object().keys({
      media_partner_ids: Joi.array().items(Joi.string()),
    }),
  }
}
