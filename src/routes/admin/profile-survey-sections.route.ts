import { Router } from 'express'
import validator from '../../middlewares/validator.middleware'
import { authenticateRequests } from '../../middlewares/authenticateRequest.middleware'
import { RolesController } from '../../controllers/admin/roles.controller'
import { ProfileSurveyOptionValidations } from '../../validations/profile-survey-options.validation'
import { ProfileSurveyOptionsController } from '../../controllers/admin/profile-survey-options.controllers'

const router = Router()

router.get(
  `/`,
  authenticateRequests,
  ProfileSurveyOptionsController.getProfileSurveySections
)

router.get(
  `/with-survey-options`,
  authenticateRequests,
  ProfileSurveyOptionsController.getProfileSurveySectionsWithOptions
)

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

const profileSurveySectionRoutes = router

export default profileSurveySectionRoutes
