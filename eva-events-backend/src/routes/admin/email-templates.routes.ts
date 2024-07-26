import { Router } from 'express'
import validator from '../../middlewares/validator.middleware'
import { authenticateRequests } from '../../middlewares/authenticateRequest.middleware'
import { EmailTemplateValidations } from '../../validations/email-templates.validations'
import { EmailTemplateController } from '../../controllers/admin/email-templates.controller'

const multer = require('multer')

const storage = multer.memoryStorage()

const upload = multer({
  storage: storage,
  // limits: {},
})

const router = Router()

router.put(
  `/`,
  authenticateRequests,
  upload.single('image'),
  validator(EmailTemplateValidations.update),
  EmailTemplateController.updateEmailTemplate
)

router.get(
  `/`,
  authenticateRequests,
  validator(EmailTemplateValidations.getEmailTemplate),
  EmailTemplateController.getEmailTemplate
)

const emailTemplatesRoutes = router

export default emailTemplatesRoutes
