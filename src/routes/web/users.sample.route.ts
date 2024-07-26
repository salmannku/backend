import { Router } from 'express'
import UserController from '../../controllers/web/users.controller'
import { authenticateRequests } from '../../middlewares/authenticateRequest.middleware'

const router = Router()

router.post(`/users/phone-authentication`, UserController.phoneAuthentication)
router.post(
  `/users/resend/phone-authentication`,
  UserController.ResendphoneAuthentication
)
router.post(
  `/users/phone-authentication/verify-phone`,
  authenticateRequests,
  UserController.verifyPhone
)
router.post(`/users/signup`, authenticateRequests, UserController.signUp)
router.post(`/users/signin`, UserController.signIn)
router.post(`/users/send-reset-password-email`, UserController.forgotPassword)
router.post(
  `/users/resend-reset-password-email`,
  UserController.resendResetPassword
)
router.post(`/users/change-password/:token`, UserController.changePassword)

/**
 * Register routes
 * Register from ask questions flow
 */

router.post(`/register`, UserController.addUser)
router.post(`/verify-otp`, authenticateRequests, UserController.otpVarify)
router.post(`/resend-otp`, UserController.otpResend)

router.post(`/pre-launch/register`, UserController.preLaunchAddUser)
// router.post(`/login`, UserController.login);
router.get(`/users`, UserController.getByRoleAdmin)

/**
 * Credits routes
 */

router.get(`/users/credits/balance`, authenticateRequests, UserController.getCreditsBalance)

const usersRoutes = router

export default usersRoutes
