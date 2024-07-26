import { Router } from 'express'
import { AdminUsersController } from '../../controllers/admin/admins.controller'
import validator from '../../middlewares/validator.middleware'
import { AdminValidations } from '../../validations/admins.validations'
import { authenticateRequests } from '../../middlewares/authenticateRequest.middleware'
import { MeetingsController } from '../../controllers/meetings.controller'
const multer = require('multer')

const storage = multer.memoryStorage()

const upload = multer({
  storage: storage,
  // limits: {},
})

const router = Router()

router.put(
  `/update/:admin_id`,
  authenticateRequests,
  upload.single('profile_image'),
  validator(AdminValidations.updateAdmin),
  AdminUsersController.updateAdmin
)

router.put(
  `/update/profile-image/:admin_id`,
  authenticateRequests,
  upload.single('profile_image'),
  validator(AdminValidations.updateProfileImage),
  AdminUsersController.updateProfileImage
)

router.put(
  `/change-password/:admin_id`,
  authenticateRequests,
  validator(AdminValidations.changePassword),
  AdminUsersController.changePassword
)

router.put(
  `/reset-password`,
  validator(AdminValidations.resetPassword),
  AdminUsersController.resetPassword
)

router.post(
  `/reset-password/create-new-password`,
  validator(AdminValidations.createNewPassword),
  AdminUsersController.createNewPassword
)

router.post(
  `/add`,
  upload.single('profile_image'),
  validator(AdminValidations.addAdmin),
  AdminUsersController.addAdmin
)

router.get(
  `/`,
  authenticateRequests,
  validator(AdminValidations.getAdmins),
  AdminUsersController.getAdmins
)

router.get(
  `/:admin_id`,
  authenticateRequests,
  AdminUsersController.getAdminById
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
  `/delete-permanent/:admin_id`,
  authenticateRequests,
  AdminUsersController.deleteAdmin
)

router.delete(
  `/remove-profile-image/:user_id`,
  authenticateRequests,
  AdminUsersController.removeProfileImage
)

router.get(
  `/users/one-to-one-meetings/scheduled-meetings-for-user`,
  authenticateRequests,
  validator(AdminValidations.getScheduledMeetingsForUser),
  MeetingsController.getScheduledMeetingsForUserForAdmin
)

router.post(`/auth/logout`, authenticateRequests, AdminUsersController.logout)

const adminUsersRoutes = router

export default adminUsersRoutes
