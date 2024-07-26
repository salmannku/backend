import { Router } from 'express'
import { AdminUsersController } from '../../controllers/admin/admins.controller'
import validator from '../../middlewares/validator.middleware'
import { AdminValidations } from '../../validations/admins.validations'
import { authenticateRequests } from '../../middlewares/authenticateRequest.middleware'
import { ExhibitorController } from '../../controllers/admin/exhibitors.controller'
import { ExhibitorValidations } from '../../validations/exhibitors.validations'

const multer = require('multer')

const storage = multer.memoryStorage()

const upload = multer({
  storage: storage,
  // limits: {},
})

const router = Router()

router.post(
  `/create`,
  upload.single('exhibitor_logo'),
  validator(ExhibitorValidations.createExhibitor),
  ExhibitorController.addExhibitor
)

router.put(
  `/update/:exhibitor_id`,
  authenticateRequests,
  upload.single('exhibitor_logo'),
  validator(ExhibitorValidations.updateExhibitor),
  ExhibitorController.updateExhibitor
)

router.get(
  `/`,
  authenticateRequests,
  validator(ExhibitorValidations.getExhibitors),
  ExhibitorController.getExhibitors
)

router.get(
  `/:exhibitor_id`,
  authenticateRequests,
  ExhibitorController.getExhibitorById
)

/**
 * Events
 */

router.get(
  `/:exhibitor_id/assigned-events`,
  authenticateRequests,
  validator(ExhibitorValidations.getAssignedEvents),
  ExhibitorController.getAssignedEvents
)

router.post(
  `/auth/login`,
  validator(AdminValidations.login),
  AdminUsersController.logIn
)

router.delete(
  `/delete-temporary/:exhibitor_id`,
  authenticateRequests,
  AdminUsersController.binAdmin
)

router.delete(
  `/delete-permanent/:user_id`,
  authenticateRequests,
  ExhibitorController.delete
)

router.delete(
  `/remove-profile-image/:user_id`,
  authenticateRequests,
  ExhibitorController.removeProfileImage
)

router.post(
  `/change-account-status/:user_id`,
  authenticateRequests,
  validator(ExhibitorValidations.changeAccountStatus),
  ExhibitorController.changeAccountStatus
)

/**
 * Profile Surveys
 */
router.get(
  `/profile-survey/:exhibitor_id`,
  authenticateRequests,
  ExhibitorController.getProfileSurvey
)

router.post(`/auth/logout`, authenticateRequests, AdminUsersController.logout)

const exhibitorRoutes = router

export default exhibitorRoutes
