import { CommonEnums } from '../../enums/common.enums'
import { sendResponse } from '../../helpers/common'
import PermissionsModel from '../../models/permissions.model'
import { catchAsync } from '../../utils/catchAsync'
import { CommonUtils } from '../../utils/common.utils'
import ResponseCodes from '../../utils/responseCodes'

export class PermissionController {
  static addPermission = catchAsync(async (req: any, res: any) => {
    const { name, description } = req.body

    const existingPermission = await PermissionsModel.findOne({
      slug: CommonUtils.convertStringToSlug({ str: name }),
    })

    if (existingPermission) {
      return sendResponse({
        res,
        success: false,
        message: 'Permission is already exists',
        response_code: ResponseCodes.ALREADY_EXIST,
      })
    }

    const newPermission = await PermissionsModel.create({
      name,
      description,
      slug: CommonUtils.convertStringToSlug({ str: name }),
    })

    if (!newPermission) {
      return sendResponse({
        res,
        success: false,
        message: 'Permission is not created, try again!',
        response_code: ResponseCodes.CREATE_FAILED,
      })
    }

    return sendResponse({
      res,
      success: true,
      message: 'Permission added successfully',
      response_code: ResponseCodes.CREATE_SUCCESS,
    })
  })

  static getPermissions = catchAsync(async (req: any, res: any) => {
    const records = await PermissionsModel.find({
      status: { $ne: CommonEnums.BINNED },
    }).lean()

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.GET_SUCCESS,
      data: records,
    })
  })

  static updatePermission = catchAsync(async (req: any, res: any) => {
    const permissionId = req?.params?.permission_id

    const updatedPermission = await PermissionsModel.findByIdAndUpdate(
      permissionId,
      {
        ...req.body,
        slug: CommonUtils.convertStringToSlug({
          str: req.body?.name,
        }),
      },
      { new: true }
    )

    if (!updatedPermission) {
      return sendResponse({
        res,
        success: false,
        message: 'Permission not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.UPDATE_SUCCESS,
    })
  })

  static binPermission = catchAsync(async (req: any, res: any) => {
    const permissionId = req?.params?.permission_id

    const updatedPermission = await PermissionsModel.findByIdAndUpdate(
      permissionId,
      {
        status: CommonEnums.BINNED,
      },
      { new: true }
    )

    if (!updatedPermission) {
      return sendResponse({
        res,
        success: false,
        message: 'Permission not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.DELETE_SUCCESS,
    })
  })

  static deletePermission = catchAsync(async (req: any, res: any) => {
    const permissionId = req?.params?.permission_id

    const deleteResponse = await PermissionsModel.findByIdAndDelete(
      permissionId
    )

    if (!deleteResponse) {
      return sendResponse({
        res,
        success: false,
        message: 'Permission not found!',
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
