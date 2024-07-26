import { Router } from 'express'
import validator from '../../middlewares/validator.middleware'
import { authenticateRequests } from '../../middlewares/authenticateRequest.middleware'
import { EventsController } from '../../controllers/admin/events.controller'
import { EventValidations } from '../../validations/events.validations'
import { FAQSValidations } from '../../validations/faqs.validation'
import { FAQSController } from '../../controllers/admin/faqs.controllers'
import { conferencProgramsValidations } from '../../validations/conferenc-programs.validations'
import { conferenceProgramsController } from '../../controllers/admin/conference-programs.controller'
import { networkingEventsValidations } from '../../validations/networking-events.validations'
import { networkingEventsController } from '../../controllers/admin/networking-events.controller'
import { HotelValidations } from '../../validations/hotels.validation'
import { HotelController } from '../../controllers/admin/hotels.controllers'

const multer = require('multer')

const storage = multer.memoryStorage()

const upload = multer({
  storage: storage,
  // limits: {},
})

const router = Router()

router.get(
  `/`,
  authenticateRequests,
  validator(EventValidations.getEvents),
  EventsController.getEvents
)

router.get(
  `/:event_id`,
  authenticateRequests,
  validator(EventValidations.getEventDetails),
  EventsController.getEventDetailsById
)

router.get(
  `/:event_id/event-dates`,
  authenticateRequests,
  EventsController.getEventDates
)

/**
 * Gallery images
 */
router.get(
  `/:event_id/gallery-images`,
  authenticateRequests,
  validator(EventValidations.getGalleryImages),
  EventsController.getGalleryImages
)

/**
 * Delegates
 */
router.get(
  `/:event_id/delegates`,
  authenticateRequests,
  validator(EventValidations.getDelegates),
  EventsController.getDelegates
)

router.get(
  `/:event_id/delegates-to-add`,
  authenticateRequests,
  validator(EventValidations.getDelegates),
  EventsController.getDelegatesToAdd
)

/**
 * Exhibitors
 */
router.get(
  `/:event_id/exhibitors`,
  authenticateRequests,
  validator(EventValidations.getExhibitors),
  EventsController.getExhibitors
)

router.get(
  `/:event_id/exhibitors-to-add`,
  authenticateRequests,
  validator(EventValidations.getExhibitors),
  EventsController.getExhibitorsToAdd
)

/**
 * Sponsors
 */
router.get(
  `/:event_id/sponsors`,
  // authenticateRequests,
  validator(EventValidations.getSponsors),
  EventsController.getSponsors
)

router.get(
  `/:event_id/sponsors-to-add`,
  authenticateRequests,
  validator(EventValidations.getSponsors),
  EventsController.getSponsorsToAdd
)

/**
 * Speakers
 */
router.get(
  `/:event_id/speakers`,
  authenticateRequests,
  validator(EventValidations.getSpeakers),
  EventsController.getSpeakers
)

router.get(
  `/:event_id/speakers-to-add`,
  authenticateRequests,
  validator(EventValidations.getSpeakers),
  EventsController.getSpeakersToAdd
)

/**
 * Speakers
 */
router.get(
  `/:event_id/media-partners`,
  authenticateRequests,
  validator(EventValidations.getMediaPartners),
  EventsController.getMediaPartners
)

router.get(
  `/:event_id/media-partners-to-add`,
  authenticateRequests,
  validator(EventValidations.getMediaPartners),
  EventsController.getMediaPartnersToAdd
)

/**
 * Event Invites
 */

router.post(
  `/:event_id/delegates/send-invite`,
  authenticateRequests,
  validator(EventValidations.sendInviteToDelegate),
  EventsController.sendInviteToDelegate
)

router.post(
  `/:event_id/exhibitors/send-invite`,
  authenticateRequests,
  validator(EventValidations.sendInviteToExhibitor),
  EventsController.sendInviteToExhibitor
)

router.post(
  `/:event_id/speakers/send-invite`,
  authenticateRequests,
  validator(EventValidations.sendInviteToSpeaker),
  EventsController.sendInviteToSpeaker
)

router.post(
  `/:event_id/media-partners/send-invite`,
  authenticateRequests,
  validator(EventValidations.sendInviteToMediaPartners),
  EventsController.sendInviteToMediaPartner
)

router.post(
  `/:event_id/sponsors/send-invite`,
  authenticateRequests,
  validator(EventValidations.sendInviteToSponsors),
  EventsController.sendInviteToSponsor
)

router.post(
  `/:event_id/event-invitation-status`,
  authenticateRequests,
  validator(EventValidations.eventInvitationStatus),
  EventsController.getEventInvitationStatus
)

router.post(
  `/login`,
  authenticateRequests,
  validator(EventValidations.loginToEvent),
  EventsController.getEventInvitationStatus
)

/**
 * Events add new users
 */

router.post(
  `/:event_id/add-delegates`,
  authenticateRequests,
  validator(EventValidations.addDelegates),
  EventsController.addDelegatesToEvent
)

router.post(
  `/:event_id/add-exhibitors`,
  authenticateRequests,
  validator(EventValidations.addExhibitors),
  EventsController.addExhibitorsToEvent
)

router.post(
  `/:event_id/add-sponsors`,
  authenticateRequests,
  validator(EventValidations.addSponsors),
  EventsController.addSponsorsToEvent
)

router.post(
  `/:event_id/add-speakers`,
  authenticateRequests,
  validator(EventValidations.addSpeakers),
  EventsController.addSpeakersToEvent
)

router.post(
  `/:event_id/add-media-partners`,
  authenticateRequests,
  validator(EventValidations.addMediaPartners),
  EventsController.addMediaPartnersToEvent
)

/**
 * Events remove users
 */

router.post(
  `/:event_id/remove-delegates`,
  authenticateRequests,
  validator(EventValidations.removeDelegatesFromEvent),
  EventsController.removeDelegatesFromEvent
)

router.post(
  `/:event_id/remove-exhibitors`,
  authenticateRequests,
  validator(EventValidations.removeExhibitorsFromEvent),
  EventsController.removeExhibitorFromEvent
)

router.post(
  `/:event_id/remove-sponsors`,
  authenticateRequests,
  validator(EventValidations.removeSponsorsFromEvent),
  EventsController.removeSponsorsFromEvent
)

router.post(
  `/:event_id/remove-speakers`,
  authenticateRequests,
  validator(EventValidations.removeSpeakersFromEvent),
  EventsController.removeSpeakersFromEvent
)

router.post(
  `/:event_id/remove-media-partners`,
  authenticateRequests,
  validator(EventValidations.removeMediaPartnersFromEvent),
  EventsController.removeMediaPartnersFromEvent
)

router.post(
  `/add`,
  authenticateRequests,
  upload.single('featured_image'),
  validator(EventValidations.addEvent),
  EventsController.addEvent
)

router.post(
  `/update/:event_id`,
  authenticateRequests,
  upload.single('featured_image'),
  validator(EventValidations.updateEvent),
  EventsController.update
)

router.post(
  `/:event_id/upload-venue-map`,
  authenticateRequests,
  upload.single('venue_map'),
  validator(EventValidations.uploadVenueMap),
  EventsController.uploadVenueMap
)

router.get(
  `/:event_id/venue-map`,
  authenticateRequests,
  upload.single('venue_map'),
  EventsController.getVenueMap
)

router.delete(
  `/:event_id/venue-map`,
  authenticateRequests,
  upload.single('venue_map'),
  EventsController.deleteVenueMap
)

/**
 * FAQs
 */

router.get(
  `/:event_id/faqs`,
  authenticateRequests,
  validator(FAQSValidations.getFAQS),
  FAQSController.getFAQS
)

/**
 * Conference programs
 */

router.get(
  `/:event_id/conference-programs`,
  authenticateRequests,
  validator(conferencProgramsValidations.getConferencPrograms),
  conferenceProgramsController.getConferencePrograms
)

/**
 * Networking events
 */

router.get(
  `/:event_id/networking-events`,
  authenticateRequests,
  validator(networkingEventsValidations.getNetworkingEvents),
  networkingEventsController.getNetworkingEventsForEvent
)

/**
 * Hotels
 */

router.get(
  `/:event_id/hotels`,
  authenticateRequests,
  validator(HotelValidations.getHotels),
  HotelController.getHotelsForEvent
)

router.get(
  `/:event_id/hotels-to-add`,
  authenticateRequests,
  validator(HotelValidations.getHotels),
  HotelController.getHotelsToAdd
)

router.get(
  `/:event_id/generate-meeting-schedule-file`,
  authenticateRequests,
  EventsController.generateMeetingScheduleFile
)

// router.put(
//   `/:event_id`,
//   validator(RoleValidations.updateRole),
//   authenticateRequests,
//   RolesController.updateRole
// )

router.delete(
  `/delete-temporary/:event_id`,
  authenticateRequests,
  EventsController.binEvent
)

router.delete(
  `/delete-permanent/:event_id`,
  authenticateRequests,
  EventsController.deleteEvent
)

router.delete(
  `/delete-featured-image/:event_id`,
  authenticateRequests,
  EventsController.deleteFeaturedImage
)

router.delete(
  `/delete-logo/:event_id`,
  authenticateRequests,
  EventsController.deleteEventLogo
)

const eventRoutes = router

export default eventRoutes
