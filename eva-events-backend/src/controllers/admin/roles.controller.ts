import { CommonEnums } from '../../enums/common.enums'
import { sendResponse } from '../../helpers/common'
import PermissionsModel from '../../models/permissions.model'
import RolesModel from '../../models/roles.model'
import { catchAsync } from '../../utils/catchAsync'
import { CommonUtils } from '../../utils/common.utils'
import ResponseCodes from '../../utils/responseCodes'

export class RolesController {
  static addRole = catchAsync(async (req: any, res: any) => {
    const { role_name, role_description, permissions = [] } = req.body

    const existingRole = await RolesModel.findOne({
      slug: CommonUtils.convertStringToSlug({ str: role_name }),
    })

    if (existingRole) {
      return sendResponse({
        res,
        success: false,
        message: 'Role is already exists',
        response_code: ResponseCodes.ALREADY_EXIST,
      })
    }

    const newRole = await RolesModel.create({
      role_name,
      role_description,
      permissions,
      slug: CommonUtils.convertStringToSlug({ str: role_name }),
    })

    if (!newRole) {
      return sendResponse({
        res,
        success: false,
        message: 'Role is not created, try again!',
        response_code: ResponseCodes.CREATE_FAILED,
      })
    }

    return sendResponse({
      res,
      success: true,
      message: 'Role added successfully',
      response_code: ResponseCodes.CREATE_SUCCESS,
    })
  })

  static getRoles = catchAsync(async (req: any, res: any) => {
    const roles = await RolesModel.find({
      status: { $ne: CommonEnums.BINNED },
    })
      .populate({
        path: 'permissions',
        model: PermissionsModel,
      })
      .lean()

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.GET_SUCCESS,
      data: roles,
    })
  })

  static updateRole = catchAsync(async (req: any, res: any) => {
    const roleId = req?.params?.role_id

    const updatedRole = await RolesModel.findByIdAndUpdate(
      roleId,
      {
        ...req.body,
        slug: CommonUtils.convertStringToSlug({ str: req.body?.role_name }),
      },
      { new: true }
    )

    if (!updatedRole) {
      return sendResponse({
        res,
        success: false,
        message: 'Role not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.UPDATE_SUCCESS,
    })
  })

  static binRole = catchAsync(async (req: any, res: any) => {
    const roleId = req?.params?.role_id

    const updatedRole = await RolesModel.findByIdAndUpdate(
      roleId,
      {
        status: CommonEnums.BINNED,
      },
      { new: true }
    )

    if (!updatedRole) {
      return sendResponse({
        res,
        success: false,
        message: 'Role not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.DELETE_SUCCESS,
    })
  })

  static deleteRole = catchAsync(async (req: any, res: any) => {
    const roleId = req?.params?.role_id

    const deleteResponse = await RolesModel.findByIdAndDelete(roleId)

    if (!deleteResponse) {
      return sendResponse({
        res,
        success: false,
        message: 'Role not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.DELETE_SUCCESS,
    })
  })
}
