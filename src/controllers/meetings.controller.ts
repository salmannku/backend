import { ObjectId } from 'mongodb'
import { sendResponse } from '../helpers/common'
import MeetingRequestsModel, {
  IMeetingRecipientUserDetails,
} from '../models/meeting-requests.model'
import { EmailService } from '../services/email'
import { catchAsync } from '../utils/catchAsync'
import ResponseCodes from '../utils/responseCodes'
import { CommonEnums } from '../enums/common.enums'
import { IUser, UserServices } from '../services/users.services'
import { isValidObjectId } from 'mongoose'
import { cloneDeep } from 'lodash'
import moment from 'moment-timezone'
//import momentTimeZone from 'moment-timezone'
import EventLocationsModel from '../models/event-locations.model'
import EventsModel from '../models/events.model'
import { APIError } from '../middlewares/errorHandler.middleware'
import { HttpStatusCode } from 'axios'
import { MeetingServices } from '../services/meeting.services'

export class MeetingsController {
  static createMeetingRequest = catchAsync(async (req: any, res: any) => {
    const user = req.user as IUser

    const { event_id } = req.params
    //console.log("event_id" , event_id );

    const eventInfo = await EventsModel.findOne({
      _id: new ObjectId(event_id),
    }).lean()

    const {
      requested_users = [],
      meeting_notes,
      meeting_date,
      meeting_start_time,
      meeting_end_time,
      meeting_location,
      converted_start_time,
      converted_end_time,
    } = req.body

    if (
      eventInfo?.time_zone_value &&
      converted_start_time &&
      converted_end_time
    ) {
      /*
      const utcStartTime = moment.utc(converted_start_time, 'HH:mm:ss');
      const utcEndTime = moment.utc(converted_end_time, 'HH:mm:ss');
      const targetTimezone = eventInfo?.time_zone_value;
      
      const meetingStartTimeAsEventTimeZone = utcStartTime.clone().format('HH:mm:ss');
      const meetingEndTimeAsEventTimeZone = utcEndTime.clone().format('HH:mm:ss');
      
      if( moment(meetingStartTimeAsEventTimeZone, "HH:mm:ss").isBefore(moment(eventInfo?.start_time, "HH:mm:ss")) ){
       	return sendResponse({
          res,
          success: false,
          message: 'Meeting Start Time Should be After ' + moment(eventInfo?.start_time, "HH:mm:ss").format('hh:mm A') ,
          response_code: ResponseCodes.FAILED,
        })
        
        
      }
  
      if( moment(meetingEndTimeAsEventTimeZone, "HH:mm:ss").isAfter(moment(eventInfo?.end_time, "HH:mm:ss") ) ){
        return sendResponse({
          res,
          success: false,
          message: 'Meeting End Time Should be Before ' + moment(eventInfo?.end_time, "HH:mm:ss").format('hh:mm A') ,
          response_code: ResponseCodes.FAILED,
        })
      }
      */
    }

    if (!requested_users?.length) {
      return sendResponse({
        res,
        success: false,
        message: 'Please select users to request the meeting!',
        response_code: ResponseCodes.FAILED,
      })
    }

    const responses: any = []

    const recipientUserDetailsPromises: any = []

    requested_users.forEach((requestor: any, _index: number) => {
      recipientUserDetailsPromises.push(async () =>
        UserServices.getUserById({
          user_id: requestor,
        })
      )
    })

    const recipientUserDetails = await Promise.all(
      recipientUserDetailsPromises.map((_func: any) => _func())
    )

    let firstName = user?.first_name || user?.sponsor_name
    let lastName = user?.last_name
    let email = user?.email

    let updatedMeetingDate = meeting_date.split('T')?.[0]

    const newMeeting = await MeetingRequestsModel.create({
      meeting_date: updatedMeetingDate,
      meeting_end_time: meeting_end_time,
      meeting_start_time: meeting_start_time,
      converted_start_time: converted_start_time,
      converted_end_time: converted_end_time,
      requestor: user?._id,
      requestor_first_name: firstName,
      requestor_last_name: lastName,
      requestor_email: email,
      requestor_user_type: user?.user_type,
      requested_users: requested_users,
      meeting_notes: meeting_notes,
      meeting_location,
      event: event_id,
      requestor_company_id: user?.company?._id,
      requestor_company_name: user?.company?.company_name,
      requested_users_details:
        recipientUserDetails?.map((recipient: IUser) => {
          return {
            first_name: recipient?.first_name,
            last_name: recipient?.last_name,
            email: recipient?.email,
            user_type: recipient?.user_type,
            user_id: recipient?._id,
            company_name: recipient?.company?.company_name ?? '',
            company_id: recipient?.company?._id ?? '',
            meeting_status: CommonEnums.meetingStatus.pending,
            avatar: recipient?.avatar,
          }
        }) ?? [],
    })

    if (!newMeeting) {
      return sendResponse({
        res,
        success: false,
        message: 'Meeting request is failed, please try again!',
        response_code: ResponseCodes.FAILED,
      })
    }

    const emailPromises: any = []

    recipientUserDetails.forEach((record) => {
      emailPromises.push(async () =>
        EmailService.sendMeetingRequestEmail({
          event_id: event_id,
          meeting_details: newMeeting,
          requested_user_id: record,
          requestor_user: user,
        })
      )
    })

    await Promise.all(emailPromises.map((_func: any) => _func()))

    return sendResponse({
      res,
      success: false,
      message:
        'Meeting request is created successfully, invite is sent to the requested users!',
      response_code: ResponseCodes.SUCCESS,
    })
  })

  static getMeetingRequestsByUser = catchAsync(async (req: any, res: any) => {
    const user = req.user

    const { event_id } = req.params

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
          { first_name: { $regex: search, $options: 'i' } },
          { last_name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }
    } else if (search) {
      query = {
        $or: [
          { first_name: { $regex: search, $options: 'i' } },
          { last_name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }
    }

    if (status) {
      query.meeting_status = status
    }

    query.requestor = user?._id
    query.event = event_id

    const options = {
      page: page,
      limit: limit,
      lean: true,
      sort: { createdAt: created_at },
      // select: ""
    }

    const meetings = await (MeetingRequestsModel as any).paginate(
      query,
      options
    )

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.GET_SUCCESS,
      data: meetings,
    })
  })

  static getMeetingRequestsByOtherToUser = catchAsync(
    async (req: any, res: any) => {
      const user = req.user

      const { event_id } = req.params

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
            { first_name: { $regex: search, $options: 'i' } },
            { last_name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        }
      } else if (search) {
        query = {
          $or: [
            { first_name: { $regex: search, $options: 'i' } },
            { last_name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        }
      }

      if (status) {
        query.meeting_status = status
      }

      query.requested_users = user?._id
      query.event = event_id

      const options = {
        page: page,
        limit: limit,
        lean: true,
        sort: { createdAt: created_at },
        // select: ""
      }

      const meetings = await (MeetingRequestsModel as any).paginate(
        query,
        options
      )

      return sendResponse({
        res,
        success: true,
        response_code: ResponseCodes.GET_SUCCESS,
        data: meetings,
      })
    }
  )

  static getMeetingFromColleagues = catchAsync(async (req: any, res: any) => {
    const user = req.user as IUser

    const { event_id } = req.params

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
          { first_name: { $regex: search, $options: 'i' } },
          { last_name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }
    } else if (search) {
      query = {
        $or: [
          { first_name: { $regex: search, $options: 'i' } },
          { last_name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }
    }

    if (status) {
      query.meeting_status = status
    }

    // query.requested_users = user?._id
    query.event = event_id

    query.requested_users_details = {
      $elemMatch: {
        company_id: user?.company?._id?.toString(),
        // meeting_status: CommonEnums.meetingStatus.accepted,
      },
    }

    query.requestor = {
      $ne: user._id,
    }

    query.requested_users = {
      $ne: user._id,
    }

    const options = {
      page: page,
      limit: limit,
      lean: true,
      sort: { createdAt: created_at },
      // select: ""
    }

    const meetings = await (MeetingRequestsModel as any).paginate(
      query,
      options
    )

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.GET_SUCCESS,
      data: meetings,
    })
  })

  static getMeetingDetailsById = catchAsync(async (req: any, res: any) => {
    const { meeting_id } = req.params

    const meeting = await MeetingRequestsModel.findOne({
      _id: new ObjectId(meeting_id),
    }).lean()

    const requestor = meeting?.requestor

    const requestorUser = await UserServices.getUserById({
      user_id: requestor?._id.toString(),
    })

    if (!requestorUser) {
      return sendResponse({
        res,
        success: false,
        message: 'Requestor user not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    if (!meeting) {
      return sendResponse({
        res,
        success: false,
        message: 'Meeting not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    meeting.requestor = requestorUser as any

    return sendResponse({
      res,
      success: true,
      data: meeting,
      message: 'Meeting details get successfully!',
      response_code: ResponseCodes.GET_SUCCESS,
    })
  })

  static getMeetingRequestedByOtherUsers = catchAsync(
    async (req: any, res: any) => {}
  )

  static getMeetingsScheduleForUser = catchAsync(
    async (req: any, res: any) => {}
  )

  static acceptMeeting = catchAsync(async (req: any, res: any) => {
    const acceptorUser = req.user

    const { meeting_id, requested_to } = req.query

    const meeting = await MeetingRequestsModel.findOneAndUpdate(
      {
        _id: meeting_id,
        requested_users: new ObjectId(requested_to),
        meeting_status: {
          $ne: CommonEnums.meetingStatus.cancelled,
        },
      },
      {},
      {
        new: true,
      }
    ).populate({
      path: 'meeting_location',
      model: EventLocationsModel,
    })

    if (!meeting) {
      return sendResponse({
        res,
        success: false,
        message: 'Meeting request not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    const getUserDetailsPromises: any = []

    meeting.requested_users.forEach((userId: any, index: number) => {
      getUserDetailsPromises.push(
        UserServices.getUserById({
          user_id: userId,
        })
      )
    })

    getUserDetailsPromises.push(
      UserServices.getUserById({
        user_id: meeting?.requestor,
      })
    )

    const users = await Promise.all(getUserDetailsPromises)

    const sendEmails: any = []

    users.forEach((user: any, index: number) => {
      sendEmails.push(async () =>
        EmailService.sendMeetingRequestAcceptedEmail({
          event_id: meeting?.event?.toString(),
          meeting_details: meeting?.toJSON(),
          email: user?.email,
          meeting_users: users,
        })
      )
    })

    meeting.requested_users_details = meeting.requested_users_details.map(
      (element) => {
        if (requested_to?.trim() == element?.user_id) {
          return {
            ...element,
            meeting_status: CommonEnums.meetingStatus.accepted,
          }
        }

        return element
      }
    )

    await Promise.all(sendEmails.map((_func: any) => _func()))

    const updatedMetingStatus = await MeetingServices.getMeetingStatus({
      meeting: meeting,
    })

    meeting.meeting_status = updatedMetingStatus.status

    await meeting.save()

    return sendResponse({
      res,
      success: true,
      message: 'Meeting request accepted successfully!',
      response_code: ResponseCodes.SUCCESS,
    })
  })

  static joinColleagueMeeting = catchAsync(async (req: any, res: any) => {
    const acceptorUser = req.user as IUser

    const { meeting_id } = req.query

    const meeting = await MeetingRequestsModel.findOneAndUpdate(
      {
        _id: meeting_id,
        // requested_users: new ObjectId(acceptorUser?._id),
        meeting_status: {
          $ne: CommonEnums.meetingStatus.cancelled,
        },
      },
      {},
      {
        new: true,
      }
    ).populate({
      path: 'meeting_location',
      model: EventLocationsModel,
    })

    if (!meeting) {
      return sendResponse({
        res,
        success: false,
        message: 'Meeting request not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    const meetingAttendees = meeting.requested_users
    const meetingAttendeeDetails = meeting.requested_users_details

    let alreadyAccepted = false

    meetingAttendeeDetails.forEach(
      (user: IMeetingRecipientUserDetails, index: number) => {
        if (
          user.user_id == acceptorUser._id.toString() &&
          user.meeting_status === CommonEnums.meetingStatus.accepted
        ) {
          alreadyAccepted = true
        }
      }
    )

    if (alreadyAccepted) {
      return sendResponse({
        res,
        success: false,
        message: 'Meeting is already accepted!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    const recipientUserDetails = await UserServices.getUserById({
      user_id: acceptorUser?._id?.toString(),
    })

    // meetingAttendees.push(acceptorUser._id)

    const acceptorUserDetails = {
      first_name: recipientUserDetails?.first_name,
      last_name: recipientUserDetails?.last_name,
      email: recipientUserDetails?.email,
      user_type: recipientUserDetails?.user_type,
      user_id: recipientUserDetails?._id,
      company_name: recipientUserDetails?.company?.company_name ?? '',
      company_id: recipientUserDetails?.company?._id ?? '',
      meeting_status: CommonEnums.meetingStatus.pending,
      avatar: recipientUserDetails?.avatar,
    }

    meetingAttendeeDetails.push({
      first_name: recipientUserDetails?.first_name,
      last_name: recipientUserDetails?.last_name,
      email: recipientUserDetails?.email,
      user_type: recipientUserDetails?.user_type,
      user_id: recipientUserDetails?._id?.toString(),
      company_name: recipientUserDetails?.company?.company_name ?? '',
      company_id: recipientUserDetails?.company?._id?.toString() ?? '',
      meeting_status: CommonEnums.meetingStatus.accepted,
      avatar: recipientUserDetails?.avatar,
    })

    const getUserDetailsPromises: any = []

    // meeting.requested_users.forEach((userId: any, index: number) => {
    //   getUserDetailsPromises.push(
    //     UserServices.getUserById({
    //       user_id: userId,
    //     })
    //   )
    // })

    getUserDetailsPromises.push(
      UserServices.getUserById({
        user_id: meeting?.requestor,
      })
    )

    const users = await Promise.all(getUserDetailsPromises)

    users.push(recipientUserDetails)

    const sendEmails: any = []

    users.forEach((user: any, index: number) => {
      sendEmails.push(async () =>
        EmailService.sendMeetingRequestAcceptedEmail({
          event_id: meeting?.event?.toString(),
          meeting_details: meeting?.toJSON(),
          email: user?.email,
          meeting_users: users,
        })
      )
    })

    await Promise.all(sendEmails.map((_func: any) => _func()))

    meeting.requested_users = meetingAttendees
    meeting.requested_users_details = meetingAttendeeDetails

    const updatedMetingStatus = await MeetingServices.getMeetingStatus({
      meeting: meeting,
    })

    meeting.meeting_status = updatedMetingStatus.status

    await meeting.save()

    return sendResponse({
      res,
      success: true,
      message: 'Meeting request accepted successfully!',
      response_code: ResponseCodes.SUCCESS,
    })
  })

  static cancelColleagueMeeting = catchAsync(async (req: any, res: any) => {
    const currentUser = req.user as IUser

    const { meeting_id } = req.query

    const meeting = await MeetingRequestsModel.findOneAndUpdate(
      {
        _id: meeting_id,
      },
      {},
      {
        new: true,
      }
    ).populate({
      path: 'meeting_location',
      model: EventLocationsModel,
    })

    if (!meeting) {
      return sendResponse({
        res,
        success: false,
        message: 'Meeting request not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    const updatedAttendees: any[] = []

    meeting.requested_users_details.forEach(
      (user: IMeetingRecipientUserDetails, index: number) => {
        if (user.user_id == currentUser._id.toString()) {
          return false
        } else {
          updatedAttendees.push(user)
        }
      }
    )

    meeting.requested_users_details = updatedAttendees

    const updatedMetingStatus = await MeetingServices.getMeetingStatus({
      meeting: meeting,
    })

    meeting.meeting_status = updatedMetingStatus.status

    await meeting.save()

    return sendResponse({
      res,
      success: true,
      message: 'Meeting cancelled successfully!',
      response_code: ResponseCodes.SUCCESS,
    })
  })

  static declineMeeting = catchAsync(async (req: any, res: any) => {
    const { meeting_id } = req.params

    const { requested_to } = req.query

    const user = await UserServices.getUserById({
      user_id: requested_to,
    })

    if (!user) {
      throw new APIError({
        message: 'Requested to user not found',
        code: ResponseCodes.USER_NOT_FOUND,
        status: HttpStatusCode.BadGateway,
      })
    }

    const meeting = await MeetingRequestsModel.findOneAndUpdate(
      {
        _id: meeting_id,
        requested_users: new ObjectId(requested_to?.trim()),
        meeting_status: {
          $ne: CommonEnums.meetingStatus.cancelled,
        },
      },
      {},
      {
        new: true,
      }
    ).populate({
      path: 'meeting_location',
      model: EventLocationsModel,
    })

    if (!meeting) {
      return sendResponse({
        res,
        success: false,
        message: 'Meeting request not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    meeting.requested_users_details = meeting.requested_users_details.map(
      (element) => {
        if (requested_to.toString() == element?.user_id) {
          return {
            ...element,
            meeting_status: CommonEnums.meetingStatus.declined,
          }
        }

        return element
      }
    )

    const sendEmails: any = []

    sendEmails.push(async () => {
      EmailService.sendMeetingIsDeclinedByUserEmail({
        event_id: meeting?.event?.toString(),
        meeting_details: meeting,
        email: meeting?.requestor_email,
        meeting_users: meeting.requested_users_details,
        declined_by: user,
      })
    })

    sendEmails.push(async () => {
      EmailService.sendMeetingDeclinedReportToAdmin({
        event_id: meeting?.event?.toString(),
        meeting_details: meeting,
        meeting_users: meeting.requested_users_details,
        declined_by: user,
      })
    })

    sendEmails.push(async () => {
      EmailService.sendMeetingIsDeclinedConfirmationEmail({
        event_id: meeting?.event?.toString(),
        meeting_details: meeting,
        email: user?.email,
        meeting_users: meeting.requested_users_details,
        declined_by: user,
      })
    })

    await Promise.all(sendEmails.map((_func: any) => _func()))

    const updatedMetingStatus = await MeetingServices.getMeetingStatus({
      meeting: meeting,
    })

    meeting.meeting_status = updatedMetingStatus.status

    await meeting.save()

    return sendResponse({
      res,
      success: false,
      message: 'Meeting is declined successfully!',
      response_code: ResponseCodes.UPDATE_SUCCESS,
    })
  })

  static rescheduleMeeting = catchAsync(async (req: any, res: any) => {
    const user = req.user

    const { meeting_id } = req.params

    const {
      meeting_date,
      meeting_start_time,
      meeting_end_time,
      meeting_notes,
      meeting_location,
    } = req.body

    const updatedMeeting = await MeetingRequestsModel.findByIdAndUpdate(
      meeting_id,
      {},
      { new: true }
    ).populate({
      path: 'meeting_location',
      model: EventLocationsModel,
    })

    const oldMeetingRecord = cloneDeep(updatedMeeting)

    if (!updatedMeeting) {
      return sendResponse({
        res,
        success: false,
        message: 'Meeting not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    const recipientUserDetailsPromises: any = []

    updatedMeeting.requested_users.forEach((requestor: any, _index: number) => {
      recipientUserDetailsPromises.push(async () =>
        UserServices.getUserById({
          user_id: requestor,
        })
      )
    })

    const recipientUserDetails = await Promise.all(
      recipientUserDetailsPromises.map((_func: any) => _func())
    )

    let firstName = user?.first_name || user?.sponsor_name
    let lastName = user?.last_name
    let email = user?.email

    updatedMeeting.requested_users_details =
      (recipientUserDetails?.map((recipient: IUser) => {
        return {
          first_name: recipient?.first_name,
          last_name: recipient?.last_name,
          email: recipient?.email,
          user_type: recipient?.user_type,
          user_id: recipient?._id,
          company_name: recipient?.company?.company_name ?? '',
          company_id: recipient?.company?._id ?? '',
          meeting_status: CommonEnums.meetingStatus.pending,
          avatar: recipient?.avatar,
        }
      }) as any) ?? []

    if (meeting_notes || meeting_notes === '')
      updatedMeeting.meeting_notes = meeting_notes

    if (meeting_date) updatedMeeting.meeting_date = meeting_date

    if (meeting_start_time)
      updatedMeeting.meeting_start_time = meeting_start_time

    if (meeting_end_time) updatedMeeting.meeting_end_time = meeting_end_time
    
    if (meeting_location) {
    	var meetingLocationInfo = await EventLocationsModel.findById(meeting_location)
	    if (meetingLocationInfo?.location_name) {
	        updatedMeeting.meeting_location.location_name = meetingLocationInfo?.location_name
      	} else {
      		updatedMeeting.meeting_location = meeting_location
      	}
    	
    }

    updatedMeeting.meeting_status = CommonEnums.meetingStatus.rescheduled
	
    const emailPromises: any = []
	
    recipientUserDetails.forEach((record) => {
      emailPromises.push(async () =>
        EmailService.sendMeetingRescheduledByRequestorEmail({
          event_id: updatedMeeting.toJSON().event?.toString(),
          meeting_details: updatedMeeting,
          old_meeting_details: oldMeetingRecord?.toJSON() as any,
          meeting_users: recipientUserDetails,
          email: record?.email,
          requested_to_user: record,
        })
      )
    })

    await Promise.all(emailPromises.map((_func: any) => _func()))

    await updatedMeeting.save()

    return sendResponse({
      res,
      success: false,
      message: 'Meeting is rescheduled successfully!',
      response_code: ResponseCodes.UPDATE_SUCCESS,
    })
  })

  static cancelMeeting = catchAsync(async (req: any, res: any) => {
    const requestorUser = req.user
    const { meeting_id } = req.body

    const meeting = await MeetingRequestsModel.findOneAndUpdate(
      {
        _id: meeting_id,
        requestor: requestorUser?._id,
      },
      {},
      {
        new: true,
      }
    ).populate({
      path: 'meeting_location',
      model: EventLocationsModel,
    })

    if (!meeting) {
      return sendResponse({
        res,
        success: false,
        message: 'Meeting not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    const getUserDetailsPromises: any = []

    meeting.requested_users.forEach((userId: any, index: number) => {
      getUserDetailsPromises.push(
        UserServices.getUserById({
          user_id: userId,
        })
      )
    })

    getUserDetailsPromises.push(
      UserServices.getUserById({
        user_id: meeting?.requestor,
      })
    )

    const users = await Promise.all(getUserDetailsPromises)

    const sendEmails: any = []

    users.forEach((user: any) => {
      sendEmails.push(async () =>
        EmailService.sendMeetingCancellationEmail({
          event_id: meeting?.event?.toString(),
          meeting_details: meeting.toJSON(),
          email: user?.email,
          meeting_users: users,
        })
      )
    })

    sendEmails.push(async () =>
      EmailService.sendMeetingIsCancelledByRequestorEmailToAdmin({
        event_id: meeting?.event?.toString(),
        meeting_details: meeting.toJSON(),
        meeting_users: users,
      })
    )

    await Promise.all(sendEmails.map((_func: any) => _func()))

    meeting.meeting_status = CommonEnums.meetingStatus.cancelled

    await meeting.save()

    return sendResponse({
      res,
      success: true,
      message: 'Meeting cancelled successfully!',
      response_code: ResponseCodes.SUCCESS,
    })
  })

  static getScheduledMeetingsForUser = catchAsync(
    async (req: any, res: any) => {
      const user = req.user

      const { event_id } = req.params

      const {
        page = 1,
        limit = 30,
        search = '',
        status = '',
        meeting_date = '-1',
      } = req.query

      let query: Record<any, any> = {}

      if (isValidObjectId(search)) {
        query = {
          $or: [
            { _id: new ObjectId(search) },
            { first_name: { $regex: search, $options: 'i' } },
            { last_name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        }
      } else if (search) {
        query = {
          $or: [
            { first_name: { $regex: search, $options: 'i' } },
            { last_name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        }
      }

      query.meeting_status = {
        $ne: CommonEnums.meetingStatus.cancelled,
      }

      // query.requestor = user?._id
      query.event = event_id
      query.requested_users_details = {
        $elemMatch: {
          user_id: user?._id,
          meeting_status: CommonEnums.meetingStatus.accepted,
        },
      }

      const options = {
        page: page,
        limit: limit,
        lean: true,
        sort: { meeting_date: meeting_date, meeting_start_time: '1' },
        // select: 'meeting_date',
      }

      const meetings = await (MeetingRequestsModel as any).paginate(
        query,
        options
      )

      const updatedMeetings: Record<any, any> = {}

      meetings?.docs?.forEach((meeting: any) => {
        let eventDate = moment(meeting?.meeting_date).format('YYYY-MM-DD')

        updatedMeetings[eventDate] = {
          date: meeting?.meeting_date,
          meetings: [
            ...(updatedMeetings?.[eventDate]?.meetings ?? []),
            meeting,
          ],
        }
      })

      const meetingRecords = Object.values(updatedMeetings) ?? []

      return sendResponse({
        res,
        data: meetingRecords,
        success: true,
        response_code: ResponseCodes.GET_SUCCESS,
      })
    }
  )

  static getScheduledMeetingsForUserForAdmin = catchAsync(
    async (req: any, res: any) => {
      const user = req.user

      const { event_id, user_id } = req.query

      const {
        page = 1,
        limit = 30,
        search = '',
        status = '',
        meeting_date = '-1',
      } = req.query

      let query: Record<any, any> = {}

      if (isValidObjectId(search)) {
        query = {
          $or: [
            { _id: new ObjectId(search) },
            { first_name: { $regex: search, $options: 'i' } },
            { last_name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        }
      } else if (search) {
        query = {
          $or: [
            { first_name: { $regex: search, $options: 'i' } },
            { last_name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        }
      }

      query.meeting_status = {
        $ne: CommonEnums.meetingStatus.cancelled,
      }

      // query.requestor = user?._id
      if (event_id) query.event = event_id

      query.requested_users_details = {
        $elemMatch: {
          user_id: new ObjectId(user_id),
          meeting_status: CommonEnums.meetingStatus.accepted,
        },
      }

      const options = {
        page: page,
        limit: limit,
        lean: true,
        sort: { meeting_date: meeting_date, meeting_start_time: '1' },
        // select: 'meeting_date',
      }

      const meetings = await (MeetingRequestsModel as any).paginate(
        query,
        options
      )

      const updatedMeetings: Record<any, any> = {}

      meetings?.docs?.forEach((meeting: any) => {
        let eventDate = moment(meeting?.meeting_date).format('YYYY-MM-DD')

        updatedMeetings[eventDate] = {
          date: meeting?.meeting_date,
          meetings: [
            ...(updatedMeetings?.[eventDate]?.meetings ?? []),
            meeting,
          ],
        }
      })

      const meetingRecords = Object.values(updatedMeetings) ?? []

      return sendResponse({
        res,
        data: meetingRecords,
        success: true,
        response_code: ResponseCodes.GET_SUCCESS,
      })
    }
  )

  static getBookedSchedules = catchAsync(async (req: any, res: any) => {
    const user = req.user as IUser

    const { event_id, date, participant_users } = req.body

    const bookedTimes = await UserServices.getBookedMeetingSchedules({
      date,
      event_id,
      participant_users,
      user_id: user?._id?.toString(),
    })

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.GET_SUCCESS,
      data: bookedTimes?.meetings,
    })

    // For testing

    // return sendResponse({
    //   res,
    //   success: true,
    //   response_code: ResponseCodes.GET_SUCCESS,
    //   data: {
    //     booked_schedules: bookedTimes?.booked_schedules,
    //     meetings: bookedTimes?.meetings,
    //   },
    // })
  })

  static updateMeeting = catchAsync(async (req: any, res: any) => {
    const { meeting_id, meeting_status } = req.body

    const meeting = await MeetingRequestsModel.findByIdAndUpdate(
      meeting_id?.trim(),
      {
        meeting_status: meeting_status,
      },
      {
        new: true,
      }
    )

    if (!meeting) {
      throw new APIError({
        code: ResponseCodes.NOT_FOUND,
        message: 'Meeting not found!',
        status: HttpStatusCode.NotFound,
      })
    }

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.UPDATE_SUCCESS,
    })
  })
}
