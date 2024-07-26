import { isValidObjectId } from 'mongoose'

import { catchAsync } from '../../utils/catchAsync'
import ResponseCodes from '../../utils/responseCodes'
import { ObjectId } from 'mongodb'
import CategoriesModel from '../../models/categories.model'
import { sendResponse } from '../../helpers/common'

export class categoryController {
  static createCategory = catchAsync(async (req: any, res: any) => {
    const { category_name, description, status } = req.body

    const existing = await CategoriesModel.findOne({
      category_name: category_name.trim(),
    })

    if (existing) {
      return sendResponse({
        res,
        success: false,
        message: 'Category with name already exists!',
        response_code: ResponseCodes.ALREADY_EXIST,
      })
    }

    const newCategory = await CategoriesModel.create({
      category_name,
      description,
      // status,
    })

    if (!newCategory) {
      return sendResponse({
        res,
        success: false,
        message: 'Category is not created, try again!',
        response_code: ResponseCodes.CREATE_FAILED,
      })
    }

    return sendResponse({
      res,
      success: true,
      data: newCategory,
      message: 'Category created successfully',
      response_code: ResponseCodes.CREATE_SUCCESS,
    })
  })

  static getCategories = catchAsync(async (req: any, res: any) => {
    const {
      page = 1,
      limit = 30,
      search = '',
      status = '',
      created_at = '',
    } = req.query

    let query: Record<any, any> = {}

    if (isValidObjectId(search)) {
      query = {
        $or: [
          { _id: new ObjectId(search) },
          { category_name: { $regex: search, $options: 'i' } },
        ],
      }
    } else if (search) {
      query = {
        $or: [{ category_name: { $regex: search, $options: 'i' } }],
      }
    }

    const options = {
      page: page,
      limit: limit,
      lean: true,
      sort: { createdAt: created_at },
    }

    const categories = await (CategoriesModel as any).paginate(query, options)

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.GET_SUCCESS,
      data: categories,
    })
  })

  static updateCategory = catchAsync(async (req: any, res: any) => {
    const categoryId = req?.params?.category_id

    const { category_name, description, status } = req.body

    const updateData: any = {}

    if (category_name) updateData.category_name = category_name
    if (description || description == '') updateData.description = description
    // if (status) updateData.status = status

    const updateCategory = await CategoriesModel.findByIdAndUpdate(
      categoryId,
      updateData,
      {
        new: true,
      }
    ).lean()

    if (!updateCategory) {
      return sendResponse({
        res,
        success: false,
        message: 'Category not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    return sendResponse({
      res,
      success: true,
      message: 'Category updated successfully',
      response_code: ResponseCodes.UPDATE_SUCCESS,
      data: null,
    })
  })

  static deleteCategory = catchAsync(async (req: any, res: any) => {
    const categoryId = req?.params?.category_id

    const deleteResponse = await CategoriesModel.findByIdAndDelete(categoryId)

    if (!deleteResponse) {
      return sendResponse({
        res,
        success: false,
        message: 'Category not found!',
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
