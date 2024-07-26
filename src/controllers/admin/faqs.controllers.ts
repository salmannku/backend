import { isValidObjectId } from 'mongoose'
import { CommonEnums } from '../../enums/common.enums'
import { JwtHelpers, PasswordHelpers, sendResponse } from '../../helpers/common'

import { catchAsync } from '../../utils/catchAsync'
import ResponseCodes from '../../utils/responseCodes'
import { ObjectId } from 'mongodb'
import faqModel from '../../models/faqs.model'

export class FAQSController {
  static createFAQS = catchAsync(async (req: any, res: any) => {
    const { question, answer, event_id = [] } = req.body

    const newFAQS = await faqModel.create({
      question,
      answer,
      event_id,
    })

    if (!newFAQS) {
      return sendResponse({
        res,
        success: false,
        message: 'FAQS is not created, try again!',
        response_code: ResponseCodes.CREATE_FAILED,
      })
    }

    return sendResponse({
      res,
      success: true,
      message: 'FAQS created successfully',
      response_code: ResponseCodes.CREATE_SUCCESS,
    })
  })

  static getFAQS = catchAsync(async (req: any, res: any) => {
    const eventId = req?.params?.event_id

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
          { question: { $regex: search, $options: 'i' } },
        ],
      }
    } else if (search) {
      query = {
        $or: [{ question: { $regex: search, $options: 'i' } }],
      }
    }

    if (status) {
      query.status = status
    }

    query.event_id = new ObjectId(eventId)

    const options = {
      page: page,
      limit: limit,
      lean: true,
      sort: { createdAt: created_at },
    }

    const faqs = await (faqModel as any).paginate(query, options)

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.GET_SUCCESS,
      data: faqs,
    })
  })

  static updateFAQS = catchAsync(async (req: any, res: any) => {
    const faqsId = req?.params?.faqs_id

    const { question, answer, event_id = [] } = req.body

    const updateData: any = {}

    if (question) updateData.question = question
    if (answer) updateData.answer = answer
    if (event_id) updateData.event_id = event_id

    const questionDetails = await faqModel
      .findByIdAndUpdate(faqsId, updateData, {
        new: true,
      })
      .lean()

    if (!questionDetails) {
      return sendResponse({
        res,
        success: false,
        message: 'FAQS not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    return sendResponse({
      res,
      success: true,
      message: 'FAQS updated successfully',
      response_code: ResponseCodes.UPDATE_SUCCESS,
      data: null,
    })
  })

  static deleteFAQS = catchAsync(async (req: any, res: any) => {
    const faqsId = req?.params?.faqs_id

    const deleteResponse = await faqModel.findByIdAndDelete(faqsId)

    if (!deleteResponse) {
      return sendResponse({
        res,
        success: false,
        message: 'FAQS not found!',
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
