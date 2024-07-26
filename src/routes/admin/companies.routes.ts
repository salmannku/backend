import { Router } from 'express'
import validator from '../../middlewares/validator.middleware'
import { authenticateRequests } from '../../middlewares/authenticateRequest.middleware'
import { FAQSController } from '../../controllers/admin/faqs.controllers'
import { FAQSValidations } from '../../validations/faqs.validation'
import { categoriesValidations } from '../../validations/categories.validations'
import { categoryController } from '../../controllers/admin/categories.controller'
import { CompanyValidations } from '../../validations/company.validations'
import { CompaniesController } from '../../controllers/admin/companies.controller'

const multer = require('multer')

const storage = multer.memoryStorage()

const upload = multer({
  storage: storage,
  // limits: {},
})

const router = Router()

router.get(
  `/`,
  authenticateRequests,
  validator(CompanyValidations.getCompanies),
  CompaniesController.getCompanies
)

router.post(
  `/create`,
  authenticateRequests,
  upload.single('company_logo'),
  validator(CompanyValidations.create),
  CompaniesController.create
)

router.put(
  `/update/:company_id`,
  authenticateRequests,
  upload.single('company_logo'),
  validator(CompanyValidations.update),
  CompaniesController.update
)

router.delete(
  `/delete/:company_id`,
  authenticateRequests,
  CompaniesController.delete
)

router.get(
  `/:company_id`,
  authenticateRequests,
  CompaniesController.getCompanyDetailsById
)

const companiesRoutes = router

export default companiesRoutes
