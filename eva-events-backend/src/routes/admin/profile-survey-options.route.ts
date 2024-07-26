import { Router } from 'express'
import validator from '../../middlewares/validator.middleware'
import { authenticateRequests } from '../../middlewares/authenticateRequest.middleware'
import { RolesController } from '../../controllers/admin/roles.controller'
import { ProfileSurveyOptionValidations } from '../../validations/profile-survey-options.validation'
import { ProfileSurveyOptionsController } from '../../controllers/admin/profile-survey-options.controllers'

const router = Router()

router.get(`/`, authenticateRequests, RolesController.getRoles)

router.post(
  `/create`,
  authenticateRequests,
  validator(ProfileSurveyOptionValidations.create),
  ProfileSurveyOptionsController.create
)

router.put(
  `/:survey_option_id`,
  authenticateRequests,
  validator(ProfileSurveyOptionValidations.update),
  ProfileSurveyOptionsController.updateSurveyOption
)

router.put(
  `/fill-survey-option`,
  authenticateRequests,
  validator(ProfileSurveyOptionValidations.fillOption),
  ProfileSurveyOptionsController.fillOption
)

router.delete(
  `/delete-temporary/:role_id`,
  authenticateRequests,
  RolesController.binRole
)

router.delete(
  `/delete-permanent/:survey_option_id`,
  authenticateRequests,
  ProfileSurveyOptionsController.delete
)

const profileSurveyOptionRoutes = router

export default profileSurveyOptionRoutes
