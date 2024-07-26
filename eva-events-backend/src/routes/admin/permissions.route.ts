import { Router } from 'express'
import validator from '../../middlewares/validator.middleware'
import { authenticateRequests } from '../../middlewares/authenticateRequest.middleware'
import { PermissionValidations } from '../../validations/permissions.validations'
import { PermissionController } from '../../controllers/admin/permissions.controller'

const router = Router()

router.get(`/`, authenticateRequests, PermissionController.getPermissions)

router.post(
  `/add`,
  validator(PermissionValidations.addPermission),
  authenticateRequests,
  PermissionController.addPermission
)

router.put(
  `/:permission_id`,
  validator(PermissionValidations.updatePermission),
  authenticateRequests,
  PermissionController.updatePermission
)

router.delete(
  `/delete-temporary/:permission_id`,
  authenticateRequests,
  PermissionController.binPermission
)

router.delete(
  `/delete-permanent/:permission_id`,
  authenticateRequests,
  PermissionController.deletePermission
)

const permissionRoutes = router

export default permissionRoutes
