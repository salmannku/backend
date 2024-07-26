import { Router } from 'express'
import validator from '../../middlewares/validator.middleware'
import { authenticateRequests } from '../../middlewares/authenticateRequest.middleware'
import { EventLocationsController } from '../../controllers/admin/event-locations.controllers'
import { EventLocationValidations } from '../../validations/event-locations.validations'

const router = Router()

router.get(
  `/list/:event_id`,
  authenticateRequests,
  validator(EventLocationValidations.getLocations),
  EventLocationsController.getLocations
)

router.post(
  `/create`,
  authenticateRequests,
  validator(EventLocationValidations.create),
  EventLocationsController.create
)

router.put(
  `/update/:location_id`,
  authenticateRequests,
  validator(EventLocationValidations.update),
  EventLocationsController.update
)

router.delete(
  `/delete/:location_id`,
  authenticateRequests,
  EventLocationsController.delete
)

const eventLocationsRoutes = router

export default eventLocationsRoutes
