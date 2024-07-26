import { HttpStatusCode } from 'axios'
import { CommonEnums } from '../../enums/common.enums'
import { sendResponse } from '../../helpers/common'
import { APIError } from '../../middlewares/errorHandler.middleware'
import EmailTemplateModel from '../../models/email-templates.model'
import { catchAsync } from '../../utils/catchAsync'
import ResponseCodes from '../../utils/responseCodes'
import { EmailTemplateServices } from '../../services/email-template.services'

let eventInviteEmailBody = EmailTemplateServices.defaultEventInviteStaticBody

export class EmailTemplateController {
  static updateEmailTemplate = catchAsync(async (req: any, res: any) => {
    const { event_id, body_content, user_type, template_type } = req.body

    let updatedContent = body_content?.trim()

    let emailTemplate = await EmailTemplateModel.findOneAndUpdate(
      { event: event_id, user_type, template_type },
      {
        metadata: {
          body_content: updatedContent ?? eventInviteEmailBody,
        },
      },
      {
        new: true,
      }
    )

    if (!emailTemplate) {
      emailTemplate = await EmailTemplateModel.create({
        event: event_id,
        metadata: {
          body_content: updatedContent,
        },
        user_type: user_type,
        template_type: CommonEnums.emailTypes.event_invite_to_user,
      })
    }

    if (!emailTemplate) {
      throw new APIError({
        code: ResponseCodes.CREATE_FAILED,
        message: 'Email templates is not updated, please try again!',
        status: HttpStatusCode.BadRequest,
      })
    }

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.UPDATE_SUCCESS,
    })
  })

  static getEmailTemplate = catchAsync(async (req: any, res: any) => {
    const { event_id, user_type, template_type } = req.query

    let emailTemplate = await EmailTemplateModel.findOne({
      event: event_id,
      user_type,
      template_type,
    }).populate('event')

    if (!emailTemplate) {
      emailTemplate = await EmailTemplateModel.create({
        event: event_id,
        metadata: {
          body_content: eventInviteEmailBody,
        },
        user_type: user_type,
        template_type: CommonEnums.emailTypes.event_invite_to_user,
      })

      emailTemplate = await EmailTemplateModel.findOne({
        event: event_id,
        user_type,
        template_type,
      }).populate('event')
    }

    if (!emailTemplate) {
      throw new APIError({
        code: ResponseCodes.NOT_FOUND,
        message: 'Email template not found, please try again!',
        status: HttpStatusCode.BadRequest,
      })
    }

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.GET_SUCCESS,
      data: emailTemplate,
    })
  })
}
