import { Router } from 'express'
import { AdminUsersController } from '../../controllers/admin/admins.controller'
import validator from '../../middlewares/validator.middleware'
import { AdminValidations } from '../../validations/admins.validations'
import { authenticateRequests } from '../../middlewares/authenticateRequest.middleware'
import { MediaPartnerValidations } from '../../validations/media-partner.validations'
import { MediaPartnerController } from '../../controllers/admin/media-partners.controller'
const multer = require('multer')

const storage = multer.memoryStorage()

const upload = multer({
  storage: storage,
  // limits: {},
})

const router = Router()

router.put(
  `/update/:media_partner_id`,
  authenticateRequests,
  upload.single('logo'),
  validator(MediaPartnerValidations.update),
  MediaPartnerController.update
)

router.post(
  `/create`,
  upload.single('logo'),
  validator(MediaPartnerValidations.createMediaPartner),
  MediaPartnerController.addMediaPartner
)

router.get(
  `/`,
  authenticateRequests,
  validator(MediaPartnerValidations.getMediaPartners),
  MediaPartnerController.getMediaPartners
)

router.get(
  `/:user_id`,
  authenticateRequests,
  MediaPartnerController.getMediaPartnerById
)

/**
 * Events
 */

router.get(
  `/:user_id/assigned-events`,
  authenticateRequests,
  validator(MediaPartnerValidations.getAssignedEvents),
  MediaPartnerController.getAssignedEvents
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
  MediaPartnerController.delete
)

router.delete(
  `/remove-logo/:user_id`,
  authenticateRequests,
  MediaPartnerController.removeLogo
)

router.post(
  `/change-account-status/:media_partner_id`,
  authenticateRequests,
  validator(MediaPartnerValidations.changeAccountStatus),
  MediaPartnerController.changeAccountStatus
)

/**
 * Profile Surveys
 */
router.get(
  `/profile-survey/:media_partner_id`,
  authenticateRequests,
  MediaPartnerController.getProfileSurvey
)

router.post(`/auth/logout`, authenticateRequests, AdminUsersController.logout)

const mediaPartnerRoutes = router

export default mediaPartnerRoutes
