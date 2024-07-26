import { Router } from 'express'
import validator from '../../middlewares/validator.middleware'
import { authenticateRequests } from '../../middlewares/authenticateRequest.middleware'
import { ExhibitionInfoValidations } from '../../validations/exhibition-info.validation'
import { ExhibitionInfoController } from '../../controllers/admin/exhibition-info.controllers'

const router = Router()

router.post(
  `/save-info`,
  authenticateRequests,
  validator(ExhibitionInfoValidations.saveInfo),
  ExhibitionInfoController.saveExhibitionInfo
)

router.get(`/:event_id`, ExhibitionInfoController.getExhibitionInfo)

// router.post(
//   `/create`,
//   authenticateRequests,
//   validator(FAQSValidations.createFAQS),
//   FAQSController.createFAQS
// )

// router.put(
//   `/update/:faqs_id`,
//   authenticateRequests,
//   validator(FAQSValidations.updateFAQS),
//   FAQSController.updateFAQS
// )

// router.delete(
//   `/delete/:faqs_id`,
//   authenticateRequests,
//   FAQSController.deleteFAQS
// )

const exhibitionInfoRoutes = router

export default exhibitionInfoRoutes
