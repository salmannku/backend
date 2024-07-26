import { isValidObjectId } from 'mongoose'
import { sendResponse } from '../../helpers/common'
import { catchAsync } from '../../utils/catchAsync'
import ResponseCodes from '../../utils/responseCodes'
import { ObjectId } from 'mongodb'
import conferenceProgramsModel, {
  IconferenceProgramsModelSchema,
} from '../../models/conference_programms.model'
import moment from 'moment'
import { AuthService } from '../../services/auth.service'
import ConferenceProgrammeAttendeesModel, {
  IConferenceProgrammeAttendeesModelSchema,
} from '../../models/conference-programme-attendees.model'
import { CommonEnums } from '../../enums/common.enums'
import DelegatesModel from '../../models/delegates.model'
import SpeakersModel from '../../models/speakers.model'
import ExhibitorsModel from '../../models/exhibitors.model'
import SponsorsModel from '../../models/sponsors.model'
import MediaPartnersModel from '../../models/media-partners.model'
import DatabaseServices from '../../services/database.services'
import CompaniesModel from '../../models/companies.model'
import CategoriesModel from '../../models/categories.model'

export class conferenceProgramsController {
  static createConferencePrograms = catchAsync(async (req: any, res: any) => {
    const {
      title,
      subtitle = '',
      date,
      time_from,
      time_to,
      description = '',
      add_to_calender = false,
      events = [],
      sponsors = [],
    } = req.body

    const create_conference_programme = await conferenceProgramsModel.create({
      title,
      subtitle,
      date,
      time_from,
      time_to,
      description,
      events,
      add_to_calender,
      sponsors,
    })

    if (!create_conference_programme) {
      return sendResponse({
        res,
        success: false,
        message: 'Conference programme is not created, try again!',
        response_code: ResponseCodes.CREATE_FAILED,
      })
    }

    return sendResponse({
      res,
      success: true,
      message: 'Conference programme created successfully',
      response_code: ResponseCodes.CREATE_SUCCESS,
    })
  })

  static getConferencePrograms = catchAsync(async (req: any, res: any) => {
    const eventId = req?.params?.event_id

    const authUser = await AuthService.getAuthUser(req)

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
          { _id: new ObjectId(search) },
          { title: { $regex: search, $options: 'i' } },
          { subtitle: { $regex: search, $options: 'i' } },
        ],
      }
    } else if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { subtitle: { $regex: search, $options: 'i' } },
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

    query.events = new ObjectId(eventId)

    const options = {
      page: page,
      limit: limit,
      lean: true,
      sort: { date: 1, time_from: 1 },
      populate: [
        {
          path: 'sponsors',
          select: '_id sponsor_name sponsor_logo sponsor_URL createdAt',
        },
      ],
    }

    const allProgramsForEvent = await conferenceProgramsModel
      .find({
        events: new ObjectId(eventId),
      })
      .sort({
        date: 1,
        time_from: 1,
      })
      .lean()

    const eventDates: any[] = []

    const updatedEventDates: any[] = []

    allProgramsForEvent.forEach((_event: any) => {
      let eventDate = moment(_event?.date).format('YYYY-MM-DD')

      if (!eventDates.includes(eventDate)) {
        eventDates.push(eventDate)
        updatedEventDates.push(moment(_event?.date).toISOString())
      }
    })

    if (!date && eventDates.length) {
      query.date = {
        $gte: moment(eventDates[0]).toDate(),
        $lte: moment(eventDates[0]).add(1, 'days').toDate(),
      }
    }

    const programs = await (conferenceProgramsModel as any).paginate(
      query,
      options
    )

    if (authUser) {
      let getSchedulePromises: any = []

      programs.docs.forEach(
        (program: IconferenceProgramsModelSchema, _index: any) => {
          getSchedulePromises.push(async () => {
            const schedule = await ConferenceProgrammeAttendeesModel.findOne({
              user: authUser._id,
              user_type: authUser.user_type,
              conference_programme: program._id,
            })
              .lean()
              .select('_id createdAt updatedAt')

            if (schedule && programs?.docs?.[_index]) {
              programs.docs[_index].schedule = schedule
            } else if (programs?.docs?.[_index]) {
              programs.docs[_index].schedule = null
            }
          })
        }
      )

      await Promise.all(getSchedulePromises.map((fn: any) => fn()))
    }

    const data = {
      ...programs,
      event_dates: updatedEventDates,
    }

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.GET_SUCCESS,
      data,
    })
  })

  static getConferenceProgramSchedulesForUser = catchAsync(
    async (req: any, res: any) => {
      const authUser = req?.user
      const eventId = req?.params?.event_id

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
            { _id: new ObjectId(search) },
            { title: { $regex: search, $options: 'i' } },
            { subtitle: { $regex: search, $options: 'i' } },
          ],
        }
      } else if (search) {
        query = {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { subtitle: { $regex: search, $options: 'i' } },
          ],
        }
      }

      if (status) {
        query.status = status
      }

      if (date) {
        query.conference_date = {
          $gte: moment(date).toDate(),
          $lte: moment(date).add(1, 'days').toDate(),
        }
      }

      query.event = eventId
      query.user = authUser?._id

      const options = {
        page: page,
        limit: limit,
        lean: true,
        sort: { conference_date: 1, conference_start_time: 1 },

        populate: [
          {
            path: 'conference_programme',
            model: conferenceProgramsModel,
            populate: {
              path: 'sponsors',
              model: SponsorsModel,
              select: '_id sponsor_name sponsor_logo sponsor_URL createdAt',
            },
          },
        ],
      }

      const getAllSchedulesQuery = {
        user: authUser?._id,
        user_type: authUser.user_type,
        event: eventId,
      }

      const allProgramsForEvent = await ConferenceProgrammeAttendeesModel.find(
        getAllSchedulesQuery
      )
        .populate({
          path: 'conference_programme',
          model: conferenceProgramsModel,
        })
        .sort({
          conference_date: 1,
          conference_start_time: 1,
        })
        .select('_id conference_programme conference_date')
        .lean()

      const eventDates: any[] = []

      const updatedEventDates: any[] = []

      allProgramsForEvent.forEach((_event: any) => {
        let eventDate = moment(_event?.conference_date).format('YYYY-MM-DD')

        if (!eventDates.includes(eventDate)) {
          eventDates.push(eventDate)
          updatedEventDates.push(moment(_event?.conference_date).toISOString())
        }
      })

      if (!date && eventDates.length) {
        query.conference_date = {
          $gte: moment(eventDates[0]).toDate(),
          $lte: moment(eventDates[0]).add(1, 'days').toDate(),
        }
      }

      const programs = await (
        ConferenceProgrammeAttendeesModel as any
      ).paginate(query, options)

      const updatedPrograms: any[] = []

      programs.docs.forEach(
        (program: IConferenceProgrammeAttendeesModelSchema, _index: any) => {
          updatedPrograms.push({
            ...program?.conference_programme,
            schedule: { _id: program?._id },
          })
        }
      )

      const data = {
        conference_programs: updatedPrograms,
        event_dates: updatedEventDates,
      }

      return sendResponse({
        res,
        success: true,
        response_code: ResponseCodes.GET_SUCCESS,
        data,
      })
    }
  )

  static updateConferencePrograms = catchAsync(async (req: any, res: any) => {
    const conferenceProgrammeId = req?.params?.conference_program_id

    const {
      title,
      subtitle,
      date,
      time_from,
      time_to,
      description,
      add_to_calender,
      events = [],
      sponsors = [],
    } = req.body

    const conferenceProgramme = await conferenceProgramsModel.findByIdAndUpdate(
      conferenceProgrammeId,
      {},
      {
        new: true,
      }
    )

    if (!conferenceProgramme) {
      return sendResponse({
        res,
        success: false,
        message: 'Conference programme not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    if (title) conferenceProgramme.title = title

    if (subtitle || subtitle === '') conferenceProgramme.subtitle = subtitle
    else conferenceProgramme.subtitle = conferenceProgramme.subtitle

    if (date) conferenceProgramme.date = date
    if (time_from) conferenceProgramme.time_from = time_from
    if (time_to) conferenceProgramme.time_to = time_to

    if (description || description === '')
      conferenceProgramme.description = description
    else conferenceProgramme.description = conferenceProgramme.description

    if (events) conferenceProgramme.events = events

    if (sponsors) conferenceProgramme.sponsors = sponsors

    if (add_to_calender === false || add_to_calender)
      conferenceProgramme.add_to_calender = add_to_calender
    else
      conferenceProgramme.add_to_calender = conferenceProgramme.add_to_calender

    await conferenceProgramme.save()

    return sendResponse({
      res,
      success: true,
      message: 'Conference programme updated successfully',
      response_code: ResponseCodes.UPDATE_SUCCESS,
      data: null,
    })
  })

  static getConferenceProgrammeDetails = catchAsync(
    async (req: any, res: any) => {
      const conferenceProgrammeId = req?.params?.conference_program_id

      const record = await conferenceProgramsModel
        .findById(conferenceProgrammeId)
        .lean()

      if (!record) {
        return sendResponse({
          res,
          success: false,
          message: 'Conference programme not found!',
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
        ConferenceProgrammeAttendeesModel.find({
          conference_programme: new ObjectId(conferenceProgrammeId),
          user_type: CommonEnums.users.delegate,
        }).count(),

        ConferenceProgrammeAttendeesModel.find({
          conference_programme: new ObjectId(conferenceProgrammeId),
          user_type: CommonEnums.users.exhibitor,
        }).count(),

        ConferenceProgrammeAttendeesModel.find({
          conference_programme: new ObjectId(conferenceProgrammeId),
          user_type: CommonEnums.users.sponsor,
        }).count(),

        ConferenceProgrammeAttendeesModel.find({
          conference_programme: new ObjectId(conferenceProgrammeId),
          user_type: CommonEnums.users.speaker,
        }).count(),

        ConferenceProgrammeAttendeesModel.find({
          conference_programme: new ObjectId(conferenceProgrammeId),
          user_type: CommonEnums.users.media_partner,
        }).count(),
      ])

      let updatedRecord: any = record

      updatedRecord.attendee_delegates = attendeeDelegates
      updatedRecord.attendee_exhibitors = attendeeExhibitors
      updatedRecord.attendee_sponsors = attendeeSponsors
      updatedRecord.attendee_speakers = attendeeSpeakers
      updatedRecord.attendee_media_partners = attendeeMediaPartners

      return sendResponse({
        res,
        success: true,
        response_code: ResponseCodes.GET_SUCCESS,
        data: updatedRecord,
      })
    }
  )

  static deleteConferenceProgramme = catchAsync(async (req: any, res: any) => {
    const conferenceProgrammeId = req?.params?.conference_program_id

    const deleteResponse = await conferenceProgramsModel.findByIdAndDelete(
      conferenceProgrammeId
    )

    if (!deleteResponse) {
      return sendResponse({
        res,
        success: false,
        message: 'Conference programme not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    await DatabaseServices.deleteConferenceAttendeesForConferenceProgram({
      conference_programme_id: deleteResponse?._id.toString(),
    })

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.DELETE_SUCCESS,
    })
  })

  static getAttendeeDelegates = catchAsync(async (req: any, res: any) => {
    const conferenceProgrammeId = req?.params?.conference_program_id

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

    query.conference_programme = new ObjectId(conferenceProgrammeId)
    query.user_type = CommonEnums.users.delegate

    const delegates = await (ConferenceProgrammeAttendeesModel as any).paginate(
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

  static getAttendeeSpeakers = catchAsync(async (req: any, res: any) => {
    const conferenceProgrammeId = req?.params?.conference_program_id

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

    query.conference_programme = new ObjectId(conferenceProgrammeId)
    query.user_type = CommonEnums.users.speaker

    const speakers = await (ConferenceProgrammeAttendeesModel as any).paginate(
      query,
      options
    )

    const updatedUsers: any = []

    speakers.docs.forEach((delegate: any) => {
      if (delegate?.user) updatedUsers.push(delegate?.user)
    })

    speakers.docs = updatedUsers

    return sendResponse({
      res,
      success: true,
      data: speakers,
      response_code: ResponseCodes.GET_SUCCESS,
    })
  })

  static getAttendeeExhibitors = catchAsync(async (req: any, res: any) => {
    const conferenceProgrammeId = req?.params?.conference_program_id

    const {
      page = 1,
      limit = 30,
      search = '',
      status = '',
      created_at = '',
      date = '',
    } = req.query

    let userQuery: Record<any, any> = {}

    if (isValidObjectId(search)) {
      userQuery = {
        $or: [
          { user: new ObjectId(search) },
          { user_first_name: { $regex: search, $options: 'i' } },
          { user_last_name: { $regex: search, $options: 'i' } },
          { user_email: { $regex: search, $options: 'i' } },
        ],
      }
    } else if (search) {
      userQuery = {
        $or: [
          { user_first_name: { $regex: search, $options: 'i' } },
          { user_last_name: { $regex: search, $options: 'i' } },
          { user_email: { $regex: search, $options: 'i' } },
        ],
      }
    }

    if (status) {
      userQuery.status = status
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

    userQuery.conference_programme = new ObjectId(conferenceProgrammeId)
    userQuery.user_type = CommonEnums.users.exhibitor

    const exhibitors = await (
      ConferenceProgrammeAttendeesModel as any
    ).paginate(userQuery, options)

    const updatedUsers: any = []

    exhibitors.docs.forEach((delegate: any) => {
      if (delegate?.user) updatedUsers.push(delegate?.user)
    })

    exhibitors.docs = updatedUsers

    return sendResponse({
      res,
      success: true,
      data: exhibitors,
      response_code: ResponseCodes.GET_SUCCESS,
    })
  })

  static getAttendeeSponsors = catchAsync(async (req: any, res: any) => {
    const conferenceProgrammeId = req?.params?.conference_program_id

    const {
      page = 1,
      limit = 30,
      search = '',
      status = '',
      created_at = '',
      date = '',
    } = req.query

    let userQuery: Record<any, any> = {}

    if (isValidObjectId(search)) {
      userQuery = {
        $or: [
          { user: new ObjectId(search) },
          { user_first_name: { $regex: search, $options: 'i' } },
          { user_last_name: { $regex: search, $options: 'i' } },
          { user_email: { $regex: search, $options: 'i' } },
        ],
      }
    } else if (search) {
      userQuery = {
        $or: [
          { user_first_name: { $regex: search, $options: 'i' } },
          { user_last_name: { $regex: search, $options: 'i' } },
          { user_email: { $regex: search, $options: 'i' } },
        ],
      }
    }

    if (status) {
      userQuery.status = status
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

    userQuery.conference_programme = new ObjectId(conferenceProgrammeId)
    userQuery.user_type = CommonEnums.users.sponsor

    const sponsors = await (ConferenceProgrammeAttendeesModel as any).paginate(
      userQuery,
      options
    )

    const updatedUsers: any = []

    sponsors.docs.forEach((delegate: any) => {
      if (delegate?.user) updatedUsers.push(delegate?.user)
    })

    sponsors.docs = updatedUsers

    return sendResponse({
      res,
      success: true,
      data: sponsors,
      response_code: ResponseCodes.GET_SUCCESS,
    })
  })

  static getAttendeeMediaPartners = catchAsync(async (req: any, res: any) => {
    const conferenceProgrammeId = req?.params?.conference_program_id

    const {
      page = 1,
      limit = 30,
      search = '',
      status = '',
      created_at = '',
      date = '',
    } = req.query

    let userQuery: Record<any, any> = {}

    if (isValidObjectId(search)) {
      userQuery = {
        $or: [
          { user: new ObjectId(search) },
          { user_first_name: { $regex: search, $options: 'i' } },
          { user_last_name: { $regex: search, $options: 'i' } },
          { user_email: { $regex: search, $options: 'i' } },
        ],
      }
    } else if (search) {
      userQuery = {
        $or: [
          { user_first_name: { $regex: search, $options: 'i' } },
          { user_last_name: { $regex: search, $options: 'i' } },
          { user_email: { $regex: search, $options: 'i' } },
        ],
      }
    }

    if (status) {
      userQuery.status = status
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

    userQuery.conference_programme = new ObjectId(conferenceProgrammeId)
    userQuery.user_type = CommonEnums.users.media_partner

    const mediaPartners = await (
      ConferenceProgrammeAttendeesModel as any
    ).paginate(userQuery, options)

    const updatedUsers: any = []

    mediaPartners.docs.forEach((delegate: any) => {
      if (delegate?.user) updatedUsers.push(delegate?.user)
    })

    mediaPartners.docs = updatedUsers

    return sendResponse({
      res,
      success: true,
      data: mediaPartners,
      response_code: ResponseCodes.GET_SUCCESS,
    })
  })
}
