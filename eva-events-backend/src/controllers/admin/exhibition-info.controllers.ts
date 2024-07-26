import { sendResponse } from '../../helpers/common'
import { catchAsync } from '../../utils/catchAsync'
import ResponseCodes from '../../utils/responseCodes'
import EventsModel from '../../models/events.model'
import ExhibitionInfoModel from '../../models/exhibition-info.model'

export class ExhibitionInfoController {
  static saveExhibitionInfo = catchAsync(async (req: any, res: any) => {
    const { info_type, event_id, content } = req.body

    const exhibitionInfo = await ExhibitionInfoModel.findOneAndUpdate(
      { event: event_id },
      {},
      {
        new: true,
      }
    )

    if (!exhibitionInfo) {
      return sendResponse({
        res,
        success: false,
        message: 'Exhibition info not found for the event!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    let updatedExhibitionInfo = exhibitionInfo as any

    updatedExhibitionInfo[info_type?.trim()] = content

    await updatedExhibitionInfo.save()

    return sendResponse({
      res,
      success: true,
      message: 'Info saved successfully!',
      response_code: ResponseCodes.CREATE_SUCCESS,
    })
  })

  static getExhibitionInfo = catchAsync(async (req: any, res: any) => {
    const { event_id } = req.params

    const exhibitionInfo = await ExhibitionInfoModel.findOne({
      event: event_id,
    })
      .populate({
        path: 'event',
        model: EventsModel,
      })
      .lean()

    if (!exhibitionInfo) {
      return sendResponse({
        res,
        success: false,
        message: 'Exhibition info not found for the event!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    return sendResponse({
      res,
      data: exhibitionInfo,
      success: true,
      response_code: ResponseCodes.GET_SUCCESS,
    })
  })

  static getExhibitionInfoByInfoType = catchAsync(
    async (req: any, res: any) => {
      const { event_id } = req.params

      const { info_type } = req.query

      const exhibitionInfo = await ExhibitionInfoModel.findOne({
        event: event_id,
      })
        .populate({
          path: 'event',
          model: EventsModel,
          select:
            '_id name start_date end_date venue_city venue_country venue_zip venue_address_line_1 venue_address_line_2 createdAt',
        })
        .lean()

      if (!exhibitionInfo) {
        return sendResponse({
          res,
          success: false,
          message: 'Exhibition info not found for the event!',
          response_code: ResponseCodes.NOT_FOUND,
        })
      }

      const data: any = {}

      let updatedExhibitionInfo = exhibitionInfo as any

      const content = updatedExhibitionInfo?.[info_type as any]

      data.event = exhibitionInfo.event
      data.content = content
      data._id = exhibitionInfo?._id

      return sendResponse({
        res,
        data,
        success: true,
        response_code: ResponseCodes.GET_SUCCESS,
      })
    }
  )
}
