import { Router } from 'express'
import validator from '../../middlewares/validator.middleware'
import { authenticateRequests } from '../../middlewares/authenticateRequest.middleware'
import { FAQSController } from '../../controllers/admin/faqs.controllers'
import { FAQSValidations } from '../../validations/faqs.validation'
import { categoriesValidations } from '../../validations/categories.validations'
import { categoryController } from '../../controllers/admin/categories.controller'

const router = Router()

router.get(
  `/categories-list`,
  authenticateRequests,
  validator(categoriesValidations.getCategories),
  categoryController.getCategories
)

router.post(
  `/create`,
  authenticateRequests,
  validator(categoriesValidations.createCategory),
  categoryController.createCategory
)

router.put(
  `/update/:category_id`,
  authenticateRequests,
  validator(categoriesValidations.updateCategory),
  categoryController.updateCategory
)

router.delete(
  `/delete/:category_id`,
  authenticateRequests,
  categoryController.deleteCategory
)

const categoryRoutes = router

export default categoryRoutes
