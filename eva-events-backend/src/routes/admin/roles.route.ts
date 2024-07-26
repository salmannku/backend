import { Router } from 'express'
import validator from '../../middlewares/validator.middleware'
import { authenticateRequests } from '../../middlewares/authenticateRequest.middleware'
import { RolesController } from '../../controllers/admin/roles.controller'
import { RoleValidations } from '../../validations/roles.validations'

const router = Router()

router.get(`/`, authenticateRequests, RolesController.getRoles)

router.post(
  `/add`,
  validator(RoleValidations.addRole),
  authenticateRequests,
  RolesController.addRole
)

router.put(
  `/:role_id`,
  validator(RoleValidations.updateRole),
  authenticateRequests,
  RolesController.updateRole
)

router.delete(
  `/delete-temporary/:role_id`,
  authenticateRequests,
  RolesController.binRole
)

router.delete(
  `/delete-permanent/:role_id`,
  authenticateRequests,
  RolesController.deleteRole
)

const rolesRoutes = router

export default rolesRoutes
