import { Router } from 'express'
import validator from '../../middlewares/validator.middleware'
import { authenticateRequests } from '../../middlewares/authenticateRequest.middleware'
import { FAQSController } from '../../controllers/admin/faqs.controllers'
import { FAQSValidations } from '../../validations/faqs.validation'

const router = Router()

router.get(
  `/faqs-list`,
  authenticateRequests,
  validator(FAQSValidations.getFAQS),
  FAQSController.getFAQS
)

router.post(
  `/create`,
  authenticateRequests,
  validator(FAQSValidations.createFAQS),
  FAQSController.createFAQS
)

router.put(
  `/update/:faqs_id`,
  authenticateRequests,
  validator(FAQSValidations.updateFAQS),
  FAQSController.updateFAQS
)

router.delete(
  `/delete/:faqs_id`,
  authenticateRequests,
  FAQSController.deleteFAQS
)

const faqsRoutes = router

export default faqsRoutes
