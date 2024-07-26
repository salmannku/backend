// networkingEventRoutes
import { Router } from 'express'
import validator from '../../middlewares/validator.middleware'
import { networkingEventsValidations } from '../../validations/networking-events.validations'
import { networkingEventsController } from '../../controllers/admin/networking-events.controller'
import { authenticateRequests } from '../../middlewares/authenticateRequest.middleware'

const router = Router()

router.get(
  ``,
  authenticateRequests,
  networkingEventsController.getNetworkingEvents
)

router.get(
  `/:networking_event_id`,
  authenticateRequests,
  networkingEventsController.getNetworkingEventById
)

router.post(
  `/create`,
  authenticateRequests,
  validator(networkingEventsValidations.createNetworkingEvent),
  networkingEventsController.createNetworkingEvent
)

router.put(
  `/update/:networking_event_id`,
  authenticateRequests,
  validator(networkingEventsValidations.updateNetworkingEvent),
  networkingEventsController.updateNetworkingEvent
)

router.delete(
  `/delete/:networking_event_id`,
  authenticateRequests,
  networkingEventsController.deleteNetworkingEvent
)

/**
 * Attendee users
 */

router.get(
  `/:networking_event_id/attendee-delegates`,
  authenticateRequests,
  networkingEventsController.getAttendeeDelegates
)

router.get(
  `/:networking_event_id/attendee-speakers`,
  authenticateRequests,
  networkingEventsController.getAttendeeSpeakers
)

router.get(
  `/:networking_event_id/attendee-exhibitors`,
  authenticateRequests,
  networkingEventsController.getAttendeeExhibitors
)

router.get(
  `/:networking_event_id/attendee-sponsors`,
  authenticateRequests,
  networkingEventsController.getAttendeeSponsors
)

router.get(
  `/:networking_event_id/attendee-media-partners`,
  authenticateRequests,
  networkingEventsController.getAttendeeMediaPartners
)

const networkingEventRoutes = router

export default networkingEventRoutes
