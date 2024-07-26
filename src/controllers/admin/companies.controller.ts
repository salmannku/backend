import { isValidObjectId } from 'mongoose'

import { catchAsync } from '../../utils/catchAsync'
import ResponseCodes from '../../utils/responseCodes'
import { ObjectId } from 'mongodb'
import CategoriesModel from '../../models/categories.model'
import { sendResponse } from '../../helpers/common'
import CompaniesModel from '../../models/companies.model'
import { UploadsHelpers } from '../../helpers/uploads.helpers'

export class CompaniesController {
  static create = catchAsync(async (req: any, res: any) => {
    const {
      company_name,
      company_type = '',
      email = '',
      phone = '',
      phone_country_code = '',
      description = '',
      city = '',
      country = '',
      zip = '',
      address_line_1 = '',
      company_URL = '',
      sponsor_type_id = '',
      company_logo,
      bio = '',
    } = req.body

    const existing = await CompaniesModel.findOne({
      company_name: company_name.trim(),
    })

    if (existing) {
      return sendResponse({
        res,
        success: false,
        message: 'Company with name already exists!',
        response_code: ResponseCodes.ALREADY_EXIST,
      })
    }

    const values: any = {
      company_name,
      company_type,
      email,
      phone,
      phone_country_code,
      description,
      city,
      zip,
      country,
      address_line_1,
      company_URL,
      company_logo,
      bio,
    }

    if (sponsor_type_id) {
      const [category] = await Promise.all([
        CategoriesModel.findById(sponsor_type_id).lean(),
      ])

      if (sponsor_type_id && !category) {
        return sendResponse({
          res,
          success: false,
          message: 'Sponsor type not found!',
          response_code: ResponseCodes.NOT_FOUND,
        })
      }

      if (category) {
        values.sponsor_type = category?._id as any
        values.sponsor_type_name = category?.category_name
      }
    }

    const newCompany = await CompaniesModel.create(values)

    if (!newCompany) {
      return sendResponse({
        res,
        success: false,
        message: 'Company is not created, try again!',
        response_code: ResponseCodes.CREATE_FAILED,
      })
    }

    if (req?.file) {
      const uploadResp = await UploadsHelpers.uploadAvatar({
        file: req?.file,
        user_id: newCompany.id,
      })

      if (!uploadResp.success) {
        return sendResponse({
          res,
          success: false,
          message: 'Upload failed for company logo, please try again!',
          response_code: ResponseCodes.UPLOAD_FAILED,
        })
      }

      newCompany.company_logo = uploadResp.uploadRecord.file_url

      await newCompany.save()
    }

    return sendResponse({
      res,
      success: true,
      data: newCompany,
      message: 'Company created successfully',
      response_code: ResponseCodes.CREATE_SUCCESS,
    })
  })

  static getCompanies = catchAsync(async (req: any, res: any) => {
    const {
      page = 1,
      limit = 30,
      search = '',
      status = '',
      created_at = 'desc',
    } = req.query

    let query: Record<any, any> = {}

    if (isValidObjectId(search)) {
      query = {
        $or: [
          { _id: new ObjectId(search) },
          { company_name: { $regex: search, $options: 'i' } },
        ],
      }
    } else if (search) {
      query = {
        $or: [{ company_name: { $regex: search, $options: 'i' } }],
      }
    }

    if (status) {
      query.status = status
    }

    const options = {
      page: page,
      limit: limit,
      lean: true,
      sort: { createdAt: created_at },
    }

    const companies = await (CompaniesModel as any).paginate(query, options)

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.GET_SUCCESS,
      data: companies,
    })
  })

  static update = catchAsync(async (req: any, res: any) => {
    const companyId = req?.params?.company_id

    const {
      company_name,
      company_type = '',
      email = '',
      phone = '',
      phone_country_code = '',
      description = '',
      city = '',
      country = '',
      zip = '',
      address_line_1 = '',
      company_URL = '',
      sponsor_type_id = '',
      company_logo,
      bio = '',
    } = req.body

    const companyRecord = await CompaniesModel.findByIdAndUpdate(
      companyId,
      {},
      {
        new: true,
      }
    )

    if (!companyRecord) {
      return sendResponse({
        res,
        success: false,
        message: 'Category not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    if (sponsor_type_id && companyRecord?.sponsor_type?.toString() !== sponsor_type_id?.trim()) {
      const category = await CategoriesModel.findById(sponsor_type_id).lean()
      if (!category) {
        return sendResponse({
          res,
          success: false,
          message: 'Sponsor type not found!',
          response_code: ResponseCodes.NOT_FOUND,
        })
      }

      companyRecord.sponsor_type_name = category.category_name
      companyRecord.sponsor_type = sponsor_type_id
    }

    if (company_name) companyRecord.company_name = company_name
    if (description || description == '')
      companyRecord.description = description

    if (company_type || company_type == '')
      companyRecord.company_type = company_type

    if (email || email == '') companyRecord.email = email

    if (phone || phone == '') companyRecord.phone = phone

    if (phone_country_code || phone_country_code == '')
      companyRecord.phone_country_code = phone_country_code

    if (description || description == '')
      companyRecord.description = description

    if (city || city == '') companyRecord.city = city

    if (country || country == '') companyRecord.country = country

    if (zip || zip == '') companyRecord.zip = zip

    if (address_line_1 || address_line_1 == '')
      companyRecord.address_line_1 = address_line_1

    if (company_URL || company_URL == '') companyRecord.company_URL = company_URL
    if (bio || bio == '') companyRecord.bio = bio

    const updateImage = async () => {
      if (req?.file) {
        const uploadResp = await UploadsHelpers.uploadAvatar({
          file: req?.file,
          user_id: companyRecord.id,
        })

        if (!uploadResp.success) {
          return sendResponse({
            res,
            success: false,
            message: 'Profile image upload failed, please try again!',
            response_code: ResponseCodes.UPLOAD_FAILED,
          })
        }

        if (companyRecord?.company_logo) {
          await UploadsHelpers.deleteUpload({
            image_url: companyRecord.company_logo,
          })
        }

        companyRecord.company_logo = uploadResp.uploadRecord.file_url

        await companyRecord.save()
      }
      return true
    }

    await Promise.all([
      updateImage(),
    ])

    await companyRecord.save()

    return sendResponse({
      res,
      success: true,
      message: 'Company updated successfully',
      response_code: ResponseCodes.UPDATE_SUCCESS,
      data: null,
    })
  })

  static getCompanyDetailsById = catchAsync(async (req: any, res: any) => {
    const companyId = req?.params?.company_id

    const company = await CompaniesModel.findById(companyId)
    .populate({
      path: 'sponsor_type',
      model: CategoriesModel,
    })
    .lean();

    if (!company) {
      return sendResponse({
        res,
        success: false,
        message: 'Company not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.GET_SUCCESS,
      data: company
    })
  })

  static delete = catchAsync(async (req: any, res: any) => {
    const companyId = req?.params?.company_id

    const deleteResponse = await CompaniesModel.findByIdAndDelete(companyId)

    if (!deleteResponse) {
      return sendResponse({
        res,
        success: false,
        message: 'Company not found!',
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
