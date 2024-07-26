import { Router } from 'express'
import { AdminUsersController } from '../../controllers/admin/admins.controller'
import validator from '../../middlewares/validator.middleware'
import { AdminValidations } from '../../validations/admins.validations'
import { authenticateRequests } from '../../middlewares/authenticateRequest.middleware'
import { ExhibitorController } from '../../controllers/admin/exhibitors.controller'
import { SpeakersController } from '../../controllers/admin/speakers.controller'
import { SpeakerValidations } from '../../validations/speakers.validations'

const multer = require('multer')

const storage = multer.memoryStorage()

const upload = multer({
  storage: storage,
  // limits: {},
})

const router = Router()

router.put(
  `/update/:speaker_id`,
  authenticateRequests,
  upload.single('avatar'),
  validator(SpeakerValidations.update),
  SpeakersController.update
)

router.post(
  `/create`,
  upload.single('avatar'),
  validator(SpeakerValidations.createSpeaker),
  SpeakersController.addSpeaker
)

router.get(
  `/`,
  authenticateRequests,
  validator(SpeakerValidations.getSpeakers),
  SpeakersController.getSpeakers
)

router.get(`/:user_id`, authenticateRequests, SpeakersController.getSpeakerById)

/**
 * Events
 */

router.get(
  `/:user_id/assigned-events`,
  authenticateRequests,
  validator(SpeakerValidations.getAssignedEvents),
  SpeakersController.getAssignedEvents
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
  SpeakersController.delete
)

router.delete(
  `/remove-profile-image/:user_id`,
  authenticateRequests,
  SpeakersController.removeProfileImage
)

router.post(
  `/change-account-status/:speaker_id`,
  authenticateRequests,
  validator(SpeakerValidations.changeAccountStatus),
  SpeakersController.changeAccountStatus
)

/**
 * Profile Surveys
 */
router.get(
  `/profile-survey/:speaker_id`,
  authenticateRequests,
  SpeakersController.getProfileSurvey
)

router.post(`/auth/logout`, authenticateRequests, AdminUsersController.logout)

const speakerRoutes = router

export default speakerRoutes
