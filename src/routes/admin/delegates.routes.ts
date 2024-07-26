import { Router } from 'express'
import { AdminUsersController } from '../../controllers/admin/admins.controller'
import validator from '../../middlewares/validator.middleware'
import { AdminValidations } from '../../validations/admins.validations'
import { authenticateRequests } from '../../middlewares/authenticateRequest.middleware'
import { DelegateController } from '../../controllers/admin/delegate.controller'
import { DelegateValidations } from '../../validations/delegates.validations'
const multer = require('multer')

const storage = multer.memoryStorage()

const upload = multer({
  storage: storage,
  // limits: {},
})

const router = Router()

router.put(
  `/update/:delegate_id`,
  authenticateRequests,
  upload.single('avatar'),
  validator(DelegateValidations.update),
  DelegateController.update
)

router.post(
  `/create`,
  authenticateRequests,
  upload.single('avatar'),
  validator(DelegateValidations.createDelegate),
  DelegateController.addDelegate
)

router.get(
  `/`,
  authenticateRequests,
  validator(DelegateValidations.getDelegates),
  DelegateController.getDelegates
)

router.get(
  `/:user_id`,
  authenticateRequests,
  DelegateController.getDelegateById
)

/**
 * Events
 */

router.get(
  `/:user_id/assigned-events`,
  authenticateRequests,
  validator(DelegateValidations.getAssignedEvents),
  DelegateController.getAssignedEvents
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
  DelegateController.delete
)

router.post(
  `/change-account-status/:delegate_id`,
  authenticateRequests,
  validator(DelegateValidations.changeAccountStatus),
  DelegateController.changeAccountStatus
)

router.delete(
  `/remove-profile-image/:user_id`,
  authenticateRequests,
  DelegateController.removeProfileImage
)

router.post(`/auth/logout`, authenticateRequests, AdminUsersController.logout)

/**
 * Profile Surveys
 */
router.get(
  `/profile-survey/:delegate_id`,
  authenticateRequests,
  DelegateController.getProfileSurvey
)

const delegateRoutes = router

export default delegateRoutes
