import { sendResponse } from '../../helpers/common'

import { catchAsync } from '../../utils/catchAsync'
import ResponseCodes from '../../utils/responseCodes'
import conferenceProgramsModel from '../../models/conference_programms.model'
import ConferenceProgrammeAttendeesModel from '../../models/conference-programme-attendees.model'

export class ConferenceProgrammeAttendeesController {
  static addToUserSchedule = catchAsync(async (req: any, res: any) => {
    const user = req?.user

    const {
      conference_programme_id,
      add_to_calender = true,
      event_id,
    } = req.body

    const userType = user?.user_type

    const conferenceProgramme = await conferenceProgramsModel.findById(
      conference_programme_id
    )

    if (!conferenceProgramme) {
      return sendResponse({
        res,
        success: false,
        message: 'Conference programme not found',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    const existing = await ConferenceProgrammeAttendeesModel.findOne({
      event: event_id,
      conference_programme: conferenceProgramme?._id,
      user: user?._id,
      user_type: userType,
    })

    if (existing) {
      return sendResponse({
        res,
        success: false,
        message: 'Conference programme is already scheduled',
        response_code: ResponseCodes.ALREADY_EXIST,
      })
    }

    const attendeeRecord = await ConferenceProgrammeAttendeesModel.create({
      add_to_calender,
      conference_date: conferenceProgramme.date,
      conference_start_time: conferenceProgramme.time_from,
      conference_end_time: conferenceProgramme.time_to,
      event: event_id,
      conference_programme: conferenceProgramme?._id,
      user: user?._id,
      user_type: userType,
      user_email: user?.email,
      user_first_name: user?.first_name ?? user?.sponsor_name,
      user_last_name: user?.last_name,
    })

    if (!attendeeRecord) {
      return sendResponse({
        res,
        success: false,
        message: 'Something went wrong, conference programme is not scheduled!',
        response_code: ResponseCodes.FAILED,
      })
    }

    return sendResponse({
      res,
      success: true,
      message: 'Conference programme is scheduled successfully',
      response_code: ResponseCodes.SUCCESS,
    })
  })

  static cancelSchedule = catchAsync(async (req: any, res: any) => {
    const { conference_programme_schedule_id } = req.body

    const deleteRecord =
      await ConferenceProgrammeAttendeesModel.findByIdAndDelete(
        conference_programme_schedule_id
      )

    if (!deleteRecord) {
      return sendResponse({
        res,
        success: false,
        message: 'Schedule is not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    return sendResponse({
      res,
      success: true,
      message:
        'Conference programme is removed from your schedule successfully',
      response_code: ResponseCodes.SUCCESS,
    })
  })
}
