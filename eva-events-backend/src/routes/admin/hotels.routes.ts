import { Router } from 'express'
import validator from '../../middlewares/validator.middleware'
import { authenticateRequests } from '../../middlewares/authenticateRequest.middleware'
import { HotelValidations } from '../../validations/hotels.validation'
import { HotelController } from '../../controllers/admin/hotels.controllers'

const router = Router()

router.get(
  `/all-hotels`,
  authenticateRequests,
  validator(HotelValidations.getHotels),
  HotelController.getAllHotels
)

router.get(
  `/:hotel_id`,
  authenticateRequests,
  HotelController.getHotelDetailsById
)

router.get(
  `/:hotel_id/events`,
  authenticateRequests,
  HotelController.getHotelEvents
)

router.post(
  `/create`,
  authenticateRequests,
  validator(HotelValidations.create),
  HotelController.create
)

router.post(
  `/add-hotels-to-event`,
  authenticateRequests,
  validator(HotelValidations.addHotelsToEvent),
  HotelController.addHotelsToEvent
)

router.post(
  `/remove-hotel-from-events`,
  authenticateRequests,
  validator(HotelValidations.removeHotelFromEvents),
  HotelController.removeHotelFromEvents
)

router.put(
  `/update/:hotel_id`,
  authenticateRequests,
  validator(HotelValidations.update),
  HotelController.update
)

router.delete(
  `/delete-permanent/:hotel_id`,
  authenticateRequests,
  HotelController.deletePermanent
)

const hotelRoutes = router

export default hotelRoutes
