import { isValidObjectId } from 'mongoose'
import { sendResponse } from '../../helpers/common'
import { catchAsync } from '../../utils/catchAsync'
import ResponseCodes from '../../utils/responseCodes'
import { ObjectId } from 'mongodb'
import networkingEventsModel from '../../models/networking_events.model'
import NetworkingEventSchedulesModel from '../../models/networking-event-schedules.model'
import DatabaseServices from '../../services/database.services'
import moment from 'moment'
import DelegatesModel from '../../models/delegates.model'
import { CommonEnums } from '../../enums/common.enums'
import ExhibitorsModel from '../../models/exhibitors.model'
import CategoriesModel from '../../models/categories.model'
import CompaniesModel from '../../models/companies.model'
import SponsorsModel from '../../models/sponsors.model'
import SpeakersModel from '../../models/speakers.model'
import MediaPartnersModel from '../../models/media-partners.model'

export class networkingEventsController {
  static createNetworkingEvent = catchAsync(async (req: any, res: any) => {
    const {
      event_name,
      label_for_input_field = '',
      date,
      start_time,
      end_time,
      description = '',
      notes = '',
      user_input_field = false,
      location = '',
      theme = '',
      events,
    } = req.body

    const createRes = await networkingEventsModel.create({
      event_name,
      label_for_input_field,
      date,
      start_time,
      end_time,
      description,
      notes,
      user_input_field,
      location,
      theme,
      events,
    })

    if (!createRes) {
      return sendResponse({
        res,
        success: false,
        message: 'Networking event is not created, try again!',
        response_code: ResponseCodes.CREATE_FAILED,
      })
    }

    return sendResponse({
      res,
      success: true,
      message: 'Networking event created successfully',
      response_code: ResponseCodes.CREATE_SUCCESS,
    })
  })

  static getNetworkingEvents = catchAsync(async (req: any, res: any) => {
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
          { event_name: { $regex: search, $options: 'i' } },
        ],
      }
    } else if (search) {
      query = {
        $or: [{ event_name: { $regex: search, $options: 'i' } }],
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

    const admins = await (networkingEventsModel as any).paginate(query, options)

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.GET_SUCCESS,
      data: admins,
    })
  })

  static getNetworkingEventsForEvent = catchAsync(
    async (req: any, res: any) => {
      const eventId = req?.params?.event_id

      const {
        page = 1,
        limit = 30,
        search = '',
        status = '',
        created_at = 1,
      } = req.query

      let query: Record<any, any> = {}

      if (isValidObjectId(search)) {
        query = {
          $or: [
            { _id: new ObjectId(search) },
            { event_name: { $regex: search, $options: 'i' } },
          ],
        }
      } else if (search) {
        query = {
          $or: [{ event_name: { $regex: search, $options: 'i' } }],
        }
      }

      if (status) {
        query.status = status
      }

      query.events = new ObjectId(eventId)

      const options = {
        page: page,
        limit: limit,
        lean: true,
        sort: { createdAt: created_at },
      }

      const admins = await (networkingEventsModel as any).paginate(
        query,
        options
      )

      return sendResponse({
        res,
        success: true,
        response_code: ResponseCodes.GET_SUCCESS,
        data: admins,
      })
    }
  )

  static getNetworkingEventsForUser = catchAsync(async (req: any, res: any) => {
    const eventId = req?.params?.event_id
    const user = req?.user

    const { page = 1, limit = 30, search = '', status = '' } = req.query

    let query: Record<any, any> = {}

    if (isValidObjectId(search)) {
      query = {
        $or: [
          { _id: new ObjectId(search) },
          { event_name: { $regex: search, $options: 'i' } },
        ],
      }
    } else if (search) {
      query = {
        $or: [{ event_name: { $regex: search, $options: 'i' } }],
      }
    }

    if (status) {
      query.status = status
    }

    query.events = new ObjectId(eventId)

    const options = {
      page: page,
      limit: limit,
      lean: true,
      sort: { date: 1, start_time: 1 },
    }

    const events = await (networkingEventsModel as any).paginate(query, options)

    let updatedEvents: any = {}
    const eventIds: any[] = []

    events.docs.forEach((event: any) => {
      updatedEvents[event?._id?.toString()] = { ...event, schedule: null }
      eventIds.push(event._id)
    })

    const schedules = await NetworkingEventSchedulesModel.find({
      networking_event: { $in: eventIds },
      user: user?._id,
    }).lean()

    schedules.forEach((schedule) => {
      updatedEvents[schedule?.networking_event?._id?.toString()] = {
        ...updatedEvents[schedule?.networking_event?._id?.toString()],
        schedule: {
          _id: schedule?._id,
        },
      }
    })

    updatedEvents = Object.values(updatedEvents)

    events.docs = updatedEvents

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.GET_SUCCESS,
      data: events,
    })
  })

  static updateNetworkingEvent = catchAsync(async (req: any, res: any) => {
    const networkingEventId = req?.params?.networking_event_id

    const {
      event_name,
      label_for_input_field,
      date,
      start_time,
      end_time,
      description,
      notes,
      user_input_field,
      location,
      theme,
    } = req.body

    const updateResponse = await networkingEventsModel.findByIdAndUpdate(
      networkingEventId,
      {},
      {
        new: true,
      }
    )

    if (!updateResponse) {
      return sendResponse({
        res,
        success: false,
        message: 'Networking event not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    if (event_name) updateResponse.event_name = event_name
    else updateResponse.event_name = updateResponse.event_name

    if (label_for_input_field || label_for_input_field === '')
      updateResponse.label_for_input_field = label_for_input_field
    else
      updateResponse.label_for_input_field =
        updateResponse.label_for_input_field

    if (date) updateResponse.date = date
    if (start_time) updateResponse.start_time = start_time
    if (end_time) updateResponse.end_time = end_time

    if (description || description === '')
      updateResponse.description = description
    else updateResponse.description = updateResponse.description

    if (notes || notes === '') updateResponse.notes = notes
    else updateResponse.notes = updateResponse.notes

    if (theme || theme === '') updateResponse.theme = theme
    else updateResponse.theme = updateResponse.theme

    if (location || location === '') updateResponse.location = location
    else updateResponse.location = updateResponse.location

    if (user_input_field || user_input_field === false)
      updateResponse.user_input_field = user_input_field

    await updateResponse.save()

    return sendResponse({
      res,
      success: true,
      message: 'Networking event updated successfully',
      response_code: ResponseCodes.UPDATE_SUCCESS,
      data: null,
    })
  })

  static getNetworkingEventById = catchAsync(async (req: any, res: any) => {
    const networkingEventId = req?.params?.networking_event_id

    const event = await networkingEventsModel
      .findById(networkingEventId)
      .populate('events')
      .lean()

    if (!event) {
      return sendResponse({
        res,
        success: false,
        message: 'Networking event not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    const [
      attendeeDelegates,
      attendeeExhibitors,
      attendeeSponsors,
      attendeeSpeakers,
      attendeeMediaPartners,
    ] = await Promise.all([
      NetworkingEventSchedulesModel.find({
        networking_event: new ObjectId(networkingEventId),
        user_type: CommonEnums.users.delegate,
      }).count(),

      NetworkingEventSchedulesModel.find({
        networking_event: new ObjectId(networkingEventId),
        user_type: CommonEnums.users.exhibitor,
      }).count(),

      NetworkingEventSchedulesModel.find({
        networking_event: new ObjectId(networkingEventId),
        user_type: CommonEnums.users.sponsor,
      }).count(),

      NetworkingEventSchedulesModel.find({
        networking_event: new ObjectId(networkingEventId),
        user_type: CommonEnums.users.speaker,
      }).count(),

      NetworkingEventSchedulesModel.find({
        networking_event: new ObjectId(networkingEventId),
        user_type: CommonEnums.users.media_partner,
      }).count(),
    ])

    let updatedRecord: any = event

    updatedRecord.attendee_delegates = attendeeDelegates
    updatedRecord.attendee_exhibitors = attendeeExhibitors
    updatedRecord.attendee_sponsors = attendeeSponsors
    updatedRecord.attendee_speakers = attendeeSpeakers
    updatedRecord.attendee_media_partners = attendeeMediaPartners

    return sendResponse({
      res,
      success: true,
      data: event,
      response_code: ResponseCodes.GET_SUCCESS,
    })
  })

  static deleteNetworkingEvent = catchAsync(async (req: any, res: any) => {
    const networkingEventId = req?.params?.networking_event_id

    const deleteResponse = await networkingEventsModel.findByIdAndDelete(
      networkingEventId
    )

    if (!deleteResponse) {
      return sendResponse({
        res,
        success: false,
        message: 'Networking event not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    await DatabaseServices.deleteNetworkingEventSchedules({
      networking_event_id: networkingEventId,
    })

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.DELETE_SUCCESS,
    })
  })

  static addToSchedule = catchAsync(async (req: any, res: any) => {
    const user = req.user

    const { networking_event_id, event_id } = req.body

    const existing = await NetworkingEventSchedulesModel.findOne({
      user: user._id.toString(),
      networking_event: networking_event_id,
      event: event_id,
    })

    if (existing) {
      return sendResponse({
        res,
        success: false,
        message: 'Networking event already scheduled!',
        response_code: ResponseCodes.ALREADY_EXIST,
      })
    }

    const networkingEvent = await networkingEventsModel.findById(
      networking_event_id
    )

    if (!networkingEvent) {
      return sendResponse({
        res,
        success: false,
        message: 'Networking event not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    const schedule = await NetworkingEventSchedulesModel.create({
      user: user._id,
      networking_event: networkingEvent._id,
      networking_event_date: networkingEvent.date,
      networking_event_start_time: networkingEvent.start_time,
      networking_event_end_time: networkingEvent.end_time,
      event: event_id,
      networking_event_name: networkingEvent.event_name,
      user_email: user.email,
      user_type: user.user_type,
      user_first_name: user?.first_name ?? user?.sponsor_name,
      user_last_name: user?.last_name,
    })

    if (!schedule) {
      return sendResponse({
        res,
        success: false,
        message: 'Networking event is not scheduled, please try again!',
        response_code: ResponseCodes.FAILED,
      })
    }

    return sendResponse({
      res,
      message: 'Networking event is scheduled successfully!',
      success: true,
      response_code: ResponseCodes.SUCCESS,
    })
  })

  static cancelSchedule = catchAsync(async (req: any, res: any) => {
    const { networking_event_schedule_id } = req.params

    const deleteRecord = await NetworkingEventSchedulesModel.findByIdAndDelete(
      networking_event_schedule_id
    )

    if (!deleteRecord) {
      return sendResponse({
        res,
        success: false,
        message: 'Schedule not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    return sendResponse({
      res,
      success: true,
      message: 'Schedule cancelled successfully',
      response_code: ResponseCodes.SUCCESS,
    })
  })

  static getAttendeeDelegates = catchAsync(async (req: any, res: any) => {
    const networkingEventId = req?.params?.networking_event_id

    const {
      page = 1,
      limit = 30,
      search = '',
      status = '',
      created_at = '',
      date = '',
    } = req.query

    let query: Record<any, any> = {}

    if (isValidObjectId(search)) {
      query = {
        $or: [
          { user: new ObjectId(search) },
          { user_first_name: { $regex: search, $options: 'i' } },
          { user_last_name: { $regex: search, $options: 'i' } },
          { user_email: { $regex: search, $options: 'i' } },
        ],
      }
    } else if (search) {
      query = {
        $or: [
          { user_first_name: { $regex: search, $options: 'i' } },
          { user_last_name: { $regex: search, $options: 'i' } },
          { user_email: { $regex: search, $options: 'i' } },
        ],
      }
    }

    if (status) {
      query.status = status
    }

    if (date) {
      query.date = {
        $gte: moment(date).toDate(),
        $lte: moment(date).add(1, 'days').toDate(),
      }
    }

    const options = {
      page: page,
      limit: limit,
      lean: true,
      sort: { createdAt: created_at },
      select: 'user',

      populate: [
        {
          path: 'user',
          model: DelegatesModel,
          populate: [
            {
              path: 'company',
              model: CompaniesModel,
              select: '_id company_name',
            },
            {
              path: 'category',
              model: CategoriesModel,
              select: '_id category_name',
            },
          ],
          select:
            '_id first_name last_name avatar email phone phone_country_code status createdAt updatedAt delegate_URL delegate_linkedin company company_name category category_name country city zip',
        },
      ],
    }

    query.networking_event = new ObjectId(networkingEventId)
    query.user_type = CommonEnums.users.delegate

    const delegates = await (NetworkingEventSchedulesModel as any).paginate(
      query,
      options
    )

    const updatedDelegates: any = []

    delegates.docs.forEach((delegate: any) => {
      if (delegate?.user) updatedDelegates.push(delegate?.user)
    })

    delegates.docs = updatedDelegates

    return sendResponse({
      res,
      success: true,
      data: delegates,
      response_code: ResponseCodes.GET_SUCCESS,
    })
  })

  static getAttendeeExhibitors = catchAsync(async (req: any, res: any) => {
    const networkingEventId = req?.params?.networking_event_id

    const {
      page = 1,
      limit = 30,
      search = '',
      status = '',
      created_at = '',
      date = '',
    } = req.query

    let query: Record<any, any> = {}

    if (isValidObjectId(search)) {
      query = {
        $or: [
          { user: new ObjectId(search) },
          { user_first_name: { $regex: search, $options: 'i' } },
          { user_last_name: { $regex: search, $options: 'i' } },
          { user_email: { $regex: search, $options: 'i' } },
        ],
      }
    } else if (search) {
      query = {
        $or: [
          { user_first_name: { $regex: search, $options: 'i' } },
          { user_last_name: { $regex: search, $options: 'i' } },
          { user_email: { $regex: search, $options: 'i' } },
        ],
      }
    }

    if (status) {
      query.status = status
    }

    if (date) {
      query.date = {
        $gte: moment(date).toDate(),
        $lte: moment(date).add(1, 'days').toDate(),
      }
    }

    const options = {
      page: page,
      limit: limit,
      lean: true,
      sort: { createdAt: created_at },
      select: 'user',

      populate: [
        {
          path: 'user',
          model: ExhibitorsModel,
          populate: [
            {
              path: 'company',
              model: CompaniesModel,
              select: '_id company_name',
            },
            {
              path: 'category',
              model: CategoriesModel,
              select: '_id category_name',
            },
          ],
          select:
            '_id first_name last_name avatar email phone phone_country_code status createdAt updatedAt delegate_URL delegate_linkedin company company_name category category_name country city zip',
        },
      ],
    }

    query.networking_event = new ObjectId(networkingEventId)
    query.user_type = CommonEnums.users.exhibitor

    const users = await (NetworkingEventSchedulesModel as any).paginate(
      query,
      options
    )

    const updatedDelegates: any = []

    users.docs.forEach((user: any) => {
      if (user?.user) updatedDelegates.push(user?.user)
    })

    users.docs = updatedDelegates

    return sendResponse({
      res,
      success: true,
      data: users,
      response_code: ResponseCodes.GET_SUCCESS,
    })
  })

  static getAttendeeSponsors = catchAsync(async (req: any, res: any) => {
    const networkingEventId = req?.params?.networking_event_id

    const {
      page = 1,
      limit = 30,
      search = '',
      status = '',
      created_at = '',
      date = '',
    } = req.query

    let query: Record<any, any> = {}

    if (isValidObjectId(search)) {
      query = {
        $or: [
          { user: new ObjectId(search) },
          { user_first_name: { $regex: search, $options: 'i' } },
          { user_last_name: { $regex: search, $options: 'i' } },
          { user_email: { $regex: search, $options: 'i' } },
        ],
      }
    } else if (search) {
      query = {
        $or: [
          { user_first_name: { $regex: search, $options: 'i' } },
          { user_last_name: { $regex: search, $options: 'i' } },
          { user_email: { $regex: search, $options: 'i' } },
        ],
      }
    }

    if (status) {
      query.status = status
    }

    if (date) {
      query.date = {
        $gte: moment(date).toDate(),
        $lte: moment(date).add(1, 'days').toDate(),
      }
    }

    const options = {
      page: page,
      limit: limit,
      lean: true,
      sort: { createdAt: created_at },
      select: 'user',

      populate: [
        {
          path: 'user',
          model: SponsorsModel,
          populate: [
            {
              path: 'company',
              model: CompaniesModel,
              select: '_id company_name',
            },
            {
              path: 'category',
              model: CategoriesModel,
              select: '_id category_name',
            },
          ],
          select:
            '_id sponsor_name sponsor_logo email sponsor_graphic representative_firstname representative_lastname phone phone_country_code sponsor_URL status company company_name category category_name createdAt updatedAt country city zip',
        },
      ],
    }

    query.networking_event = new ObjectId(networkingEventId)
    query.user_type = CommonEnums.users.sponsor

    const users = await (NetworkingEventSchedulesModel as any).paginate(
      query,
      options
    )

    const updatedDelegates: any = []

    users.docs.forEach((user: any) => {
      if (user?.user) updatedDelegates.push(user?.user)
    })

    users.docs = updatedDelegates

    return sendResponse({
      res,
      success: true,
      data: users,
      response_code: ResponseCodes.GET_SUCCESS,
    })
  })

  static getAttendeeSpeakers = catchAsync(async (req: any, res: any) => {
    const networkingEventId = req?.params?.networking_event_id

    const {
      page = 1,
      limit = 30,
      search = '',
      status = '',
      created_at = '',
      date = '',
    } = req.query

    let query: Record<any, any> = {}

    if (isValidObjectId(search)) {
      query = {
        $or: [
          { user: new ObjectId(search) },
          { user_first_name: { $regex: search, $options: 'i' } },
          { user_last_name: { $regex: search, $options: 'i' } },
          { user_email: { $regex: search, $options: 'i' } },
        ],
      }
    } else if (search) {
      query = {
        $or: [
          { user_first_name: { $regex: search, $options: 'i' } },
          { user_last_name: { $regex: search, $options: 'i' } },
          { user_email: { $regex: search, $options: 'i' } },
        ],
      }
    }

    if (status) {
      query.status = status
    }

    if (date) {
      query.date = {
        $gte: moment(date).toDate(),
        $lte: moment(date).add(1, 'days').toDate(),
      }
    }

    const options = {
      page: page,
      limit: limit,
      lean: true,
      sort: { createdAt: created_at },
      select: 'user',

      populate: [
        {
          path: 'user',
          model: SpeakersModel,
          populate: [
            {
              path: 'company',
              model: CompaniesModel,
              select: '_id company_name',
            },
            {
              path: 'category',
              model: CategoriesModel,
              select: '_id category_name',
            },
          ],
          select:
            '_id first_name last_name bio avatar email phone phone_country_code speaker_URL speaker_linkedin status company company_name category category_name createdAt updatedAt country city zip',
        },
      ],
    }

    query.networking_event = new ObjectId(networkingEventId)
    query.user_type = CommonEnums.users.speaker

    const users = await (NetworkingEventSchedulesModel as any).paginate(
      query,
      options
    )

    const updatedDelegates: any = []

    users.docs.forEach((user: any) => {
      if (user?.user) updatedDelegates.push(user?.user)
    })

    users.docs = updatedDelegates

    return sendResponse({
      res,
      success: true,
      data: users,
      response_code: ResponseCodes.GET_SUCCESS,
    })
  })

  static getAttendeeMediaPartners = catchAsync(async (req: any, res: any) => {
    const networkingEventId = req?.params?.networking_event_id

    const {
      page = 1,
      limit = 30,
      search = '',
      status = '',
      created_at = '',
      date = '',
    } = req.query

    let query: Record<any, any> = {}

    if (isValidObjectId(search)) {
      query = {
        $or: [
          { user: new ObjectId(search) },
          { user_first_name: { $regex: search, $options: 'i' } },
          { user_last_name: { $regex: search, $options: 'i' } },
          { user_email: { $regex: search, $options: 'i' } },
        ],
      }
    } else if (search) {
      query = {
        $or: [
          { user_first_name: { $regex: search, $options: 'i' } },
          { user_last_name: { $regex: search, $options: 'i' } },
          { user_email: { $regex: search, $options: 'i' } },
        ],
      }
    }

    if (status) {
      query.status = status
    }

    if (date) {
      query.date = {
        $gte: moment(date).toDate(),
        $lte: moment(date).add(1, 'days').toDate(),
      }
    }

    const options = {
      page: page,
      limit: limit,
      lean: true,
      sort: { createdAt: created_at },
      select: 'user',

      populate: [
        {
          path: 'user',
          model: MediaPartnersModel,
          populate: [
            {
              path: 'company',
              model: CompaniesModel,
              select: '_id company_name',
            },
            {
              path: 'category',
              model: CategoriesModel,
              select: '_id category_name',
            },
          ],
          select:
            '_id first_name last_name logo email status phone phone_country_code mediapartner_URL company company_name category category_name createdAt updatedAt country city zip',
        },
      ],
    }

    query.networking_event = new ObjectId(networkingEventId)
    query.user_type = CommonEnums.users.media_partner

    const users = await (NetworkingEventSchedulesModel as any).paginate(
      query,
      options
    )

    const updatedDelegates: any = []

    users.docs.forEach((user: any) => {
      if (user?.user) updatedDelegates.push(user?.user)
    })

    users.docs = updatedDelegates

    return sendResponse({
      res,
      success: true,
      data: users,
      response_code: ResponseCodes.GET_SUCCESS,
    })
  })
}
