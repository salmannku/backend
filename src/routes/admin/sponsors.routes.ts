import { Router } from 'express'
import { AdminUsersController } from '../../controllers/admin/admins.controller'
import validator from '../../middlewares/validator.middleware'
import { AdminValidations } from '../../validations/admins.validations'
import { authenticateRequests } from '../../middlewares/authenticateRequest.middleware'
import { SponsorValidations } from '../../validations/sponsors.validations'
import { SponsorsController } from '../../controllers/admin/sponsors.controller'

const multer = require('multer')

const storage = multer.memoryStorage()

const upload = multer({
  storage: storage,
  // limits: {},
})

const router = Router()

router.put(
  `/update/:sponsor_id`,
  authenticateRequests,
  upload.single('sponsor_logo'),
  validator(SponsorValidations.update),
  SponsorsController.update
)

router.post(
  `/create`,
  upload.single('sponsor_logo'),
  validator(SponsorValidations.createSponsor),
  SponsorsController.addSponsor
)

router.get(
  `/`,
  // authenticateRequests,
  validator(SponsorValidations.getSponsors),
  SponsorsController.getSponsors
)

router.get(`/:user_id`, authenticateRequests, SponsorsController.getSponsorById)

/**
 * Events
 */

router.get(
  `/:user_id/assigned-events`,
  authenticateRequests,
  validator(SponsorValidations.getAssignedEvents),
  SponsorsController.getAssignedEvents
)

router.post(
  `/auth/login`,
  validator(AdminValidations.login),
  AdminUsersController.logIn
)

router.delete(
  `/delete-temporary/:admin_id`,
  authenticateRequests,
  AdminUsersController.binAdmin
)

router.delete(
  `/delete-permanent/:user_id`,
  authenticateRequests,
  SponsorsController.delete
)

router.delete(
  `/remove-logo/:user_id`,
  authenticateRequests,
  SponsorsController.removeSponsorLogo
)

router.post(
  `/change-account-status/:sponsor_id`,
  authenticateRequests,
  validator(SponsorValidations.changeAccountStatus),
  SponsorsController.changeAccountStatus
)

/**
 * Profile Surveys
 */
router.get(
  `/profile-survey/:sponsor_id`,
  authenticateRequests,
  SponsorsController.getProfileSurvey
)

router.post(`/auth/logout`, authenticateRequests, AdminUsersController.logout)

const sponsorRoutes = router

export default sponsorRoutes
