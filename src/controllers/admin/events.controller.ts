import { isValidObjectId } from 'mongoose'
import { CommonEnums } from '../../enums/common.enums'
import { JwtHelpers, PasswordHelpers, sendResponse } from '../../helpers/common'
import EventsModel from '../../models/events.model'
import { catchAsync } from '../../utils/catchAsync'
import ResponseCodes from '../../utils/responseCodes'
import { ObjectId } from 'mongodb'
import { UploadsHelpers } from '../../helpers/uploads.helpers'
import DelegatesModel from '../../models/delegates.model'
import ExhibitorsModel from '../../models/exhibitors.model'
import SponsorsModel from '../../models/sponsors.model'
import SpeakersModel from '../../models/speakers.model'
import MediaPartnersModel from '../../models/media-partners.model'
import EventInvitesModel from '../../models/event-invites.model'
import { EmailService } from '../../services/email'
import { EventInvitationServices } from '../../services/event-invitation.service'
import { EventServices } from '../../services/event.services'
import UploadsModel from '../../models/uploads.model'
import { ExhibitionInfoServices } from '../../services/exhibition-info.services'
import moment from 'moment'
import { APIError } from '../../middlewares/errorHandler.middleware'
import { HttpStatusCode } from 'axios'
import { MeetingServices } from '../../services/meeting.services'

export class EventsController {
  static addEvent = catchAsync(async (req: any, res: any) => {
    const {
      name,
      start_date,
      end_date,
      start_time,
      end_time,
      time_zone,
      time_zone_value,
      description,
      featured_image,
      event_logo,
      venue_city,
      venue_zip = '',
      venue_country = '',
      venue_address_line_1 = '',
      venue_address_line_2 = '',
      delegates = [],
      exhibitors = [],
      speakers = [],
      media_partners = [],
      sponsors = [],
      faqs = [],
      hotels = [],
      conference_programmes = [],
      poster_images = [],
    } = req.body
    //console.log("request");
    //console.log(req.body);
    //return false;
    const alreadyExist = await EventsModel.findOne({ name: name?.trim() })

    if (alreadyExist) {
      return sendResponse({
        res,
        success: false,
        message: 'Event with name already exists!',
        response_code: ResponseCodes.ALREADY_EXIST,
      })
    }

    if (end_date) {
      const momentStartDate = moment(start_date).format('YYYY-MM-DD')
      const momentEndDate = moment(end_date).format('YYYY-MM-DD')
      if (moment(momentStartDate).isSame(moment(momentEndDate))) {
        if (
          start_time &&
          end_time &&
          moment(start_time).isAfter(moment(end_time))
        ) {
          return sendResponse({
            res,
            success: false,
            message: 'Event End time Should be After Start Time',
            response_code: ResponseCodes.CREATE_FAILED,
          })
        }

        if (
          start_time &&
          end_time &&
          moment(end_time).isBefore(moment(start_time))
        ) {
          return sendResponse({
            res,
            success: false,
            message: 'Event Start time Should be Before End Time',
            response_code: ResponseCodes.CREATE_FAILED,
          })
        }
      }
    }

    const newEvent = await EventsModel.create({
      name,
      start_date,
      end_date,
      start_time,
      end_time,
      time_zone,
      time_zone_value,
      description,
      venue_city,
      venue_zip,
      // venue_state,
      venue_address_line_1,
      venue_address_line_2,
      delegates,
      exhibitors,
      speakers,
      media_partners,
      faqs,
      hotels,
      conference_programmes,
      poster_images,
      venue_country,
      featured_image,
      sponsors,
      event_logo,
    })

    if (!newEvent) {
      return sendResponse({
        res,
        success: false,
        message: 'Event is not created, try again!',
        response_code: ResponseCodes.CREATE_FAILED,
      })
    }

    let _promises = [
      EventServices.addEventToDelegates({
        event_id: newEvent._id.toString(),
        delegate_ids: delegates,
      }),
      EventServices.addEventToExhibitors({
        event_id: newEvent._id.toString(),
        exhibitor_ids: exhibitors,
      }),
      EventServices.addEventToSponsors({
        event_id: newEvent._id.toString(),
        sponsor_ids: sponsors,
      }),
      EventServices.addEventToSpeakers({
        event_id: newEvent._id.toString(),
        speaker_ids: speakers,
      }),
      EventServices.addEventToMediaPartners({
        event_id: newEvent._id.toString(),
        media_partner_ids: media_partners,
      }),
    ]

    await Promise.all(_promises)

    if (req?.file) {
      const uploadResp = await UploadsHelpers.uploadFeaturedImageForEvent({
        file: req?.file,
        event_id: newEvent.id,
      })

      if (!uploadResp.success) {
        return sendResponse({
          res,
          success: false,
          message: 'Event featured image upload failed, please try again!',
          response_code: ResponseCodes.UPLOAD_FAILED,
        })
      }

      newEvent.featured_image = uploadResp.uploadRecord.file_url

      await newEvent.save()
    }

    const exhibitionInfo = await ExhibitionInfoServices.createExhibitionInfo({
      event_id: newEvent._id.toString(),
    })

    if (!exhibitionInfo?.success) {
      return sendResponse({
        res,
        success: false,
        message: exhibitionInfo?.message,
        response_code: ResponseCodes.FAILED,
      })
    }

    return sendResponse({
      res,
      success: true,
      data: newEvent?.toObject(),
      message: 'Event created successfully',
      response_code: ResponseCodes.CREATE_SUCCESS,
    })
  })

  static getEvents = catchAsync(async (req: any, res: any) => {
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
          { name: { $regex: search, $options: 'i' } },
        ],
      }
    } else if (search) {
      query = {
        $or: [{ name: { $regex: search, $options: 'i' } }],
      }
    }

    if (status) {
      query.status = status
    }

    const options = {
      page: page,
      limit: limit,
      lean: true,
      sort: { _id: -1 },
      // select: ""
    }

    const events = await (EventsModel as any).paginate(query, options)

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.GET_SUCCESS,
      data: events,
    })
  })

  static update = catchAsync(async (req: any, res: any) => {
    const {
      name,
      start_date,
      end_date,
      start_time,
      end_time,
      time_zone,
      time_zone_value,
      description,
      featured_image,
      event_logo,
      venue_city,
      venue_zip = '',
      // venue_state = '',
      venue_country = '',
      venue_address_line_1 = '',
      venue_address_line_2 = '',
      faqs = [],
      hotels = [],
      conference_programmes = [],
      poster_images = [],
    } = req.body
    //console.log("req.body" , req.body );
    const eventId = req?.params?.event_id

    const updateData: any = {}

    const oldEvent = await EventsModel.findById(eventId).populate({
      path: 'poster_images',
      model: UploadsModel,
      select: '_id file_url',
    })

    if (!oldEvent) {
      return sendResponse({
        res,
        success: false,
        message: 'Event not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    if (end_date) {
      const momentStartDate = moment(start_date).format('YYYY-MM-DD')
      const momentEndDate = moment(end_date).format('YYYY-MM-DD')
      if (moment(momentStartDate).isSame(moment(momentEndDate))) {
        if (
          start_time &&
          end_time &&
          moment(start_time).isAfter(moment(end_time))
        ) {
          return sendResponse({
            res,
            success: false,
            message: 'Event End time Should be After Start Time',
            response_code: ResponseCodes.UPDATE_FAILED,
          })
        }

        if (
          start_time &&
          end_time &&
          moment(end_time).isBefore(moment(start_time))
        ) {
          return sendResponse({
            res,
            success: false,
            message: 'Event Start time Should be Before End Time',
            response_code: ResponseCodes.UPDATE_FAILED,
          })
        }
      }
    }

    let updatedSponsors = oldEvent?.sponsors.map((_id) => _id.toString())
    let updatedSpeakers = oldEvent?.speakers.map((_id) => _id.toString())
    let updatedDelegates = oldEvent?.delegates.map((_id) => _id.toString())
    let updatedMediaPartners = oldEvent?.media_partners.map((_id) =>
      _id.toString()
    )
    let updatedExhibitors = oldEvent?.exhibitors.map((_id) => _id.toString())
    let updatedPosterImages = oldEvent?.poster_images.map((rec) =>
      rec._id.toString()
    )

    let deletablePosterImages: any[] = []

    updatedPosterImages.forEach((id: string) => {
      if (!poster_images.includes(id)) {
        deletablePosterImages.push(id)
        updatedPosterImages = updatedPosterImages.filter((_id) => _id !== id)
      }
    })

    poster_images.forEach((id: string) => {
      if (!updatedPosterImages.includes(id)) {
        updatedPosterImages.push(id)
      }
    })

    let updatedDeletablePosterImages: string[] = []

    oldEvent.poster_images.forEach((image: any) => {
      if (deletablePosterImages.includes(image._id.toString())) {
        updatedDeletablePosterImages.push(image?.file_url)
      }
    })

    if (name) updateData.name = name
    if (start_date) updateData.start_date = start_date
    if (end_date) updateData.end_date = end_date
    if (description) updateData.description = description
    if (venue_city) updateData.venue_city = venue_city
    if (venue_zip) updateData.venue_zip = venue_zip
    if (venue_country) updateData.venue_country = venue_country
    if (venue_address_line_1)
      updateData.venue_address_line_1 = venue_address_line_1
    if (venue_address_line_2)
      updateData.venue_address_line_2 = venue_address_line_2
    if (faqs) updateData.faqs = faqs
    if (hotels) updateData.hotels = hotels
    if (conference_programmes)
      updateData.conference_programmes = conference_programmes
    if (poster_images) updateData.poster_images = poster_images
    if (event_logo) updateData.event_logo = event_logo

    updateData.start_time = start_time
    updateData.end_time = end_time
    updateData.time_zone = time_zone
    updateData.time_zone_value = time_zone_value

    //console.log("updateData" , updateData );

    const event = await EventsModel.findByIdAndUpdate(eventId, updateData, {
      new: true,
    })

    if (!event) {
      return sendResponse({
        res,
        success: false,
        message: 'Event not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    let removePosterImagePromises: any[] = []

    updatedDeletablePosterImages.forEach((image) => {
      removePosterImagePromises.push(
        UploadsHelpers.deleteUpload({
          image_url: image,
        })
      )
    })

    const updateFeaturedImage = async () => {
      if (req?.file) {
        const uploadResp = await UploadsHelpers.uploadFeaturedImageForEvent({
          file: req?.file,
          event_id: event._id.toString(),
        })

        if (!uploadResp.success) {
          return sendResponse({
            res,
            success: false,
            message: 'Event featured image upload failed, please try again!',
            response_code: ResponseCodes.UPLOAD_FAILED,
          })
        }

        if (event?.featured_image) {
          await UploadsHelpers.deleteUpload({
            image_url: event.featured_image,
          })
        }

        event.featured_image = uploadResp.uploadRecord.file_url

        await event.save()
      }
    }

    await Promise.all([...removePosterImagePromises, updateFeaturedImage()])

    return sendResponse({
      res,
      success: true,
      message: 'Event updated successfully',
      response_code: ResponseCodes.UPDATE_SUCCESS,
    })
  })

  static getEventDetailsById = catchAsync(async (req: any, res: any) => {
    const eventId = req?.params?.event_id

    const { poster_images = 6 } = req.query

    const eventRecord = await EventsModel.findById(eventId)
      .populate({ path: 'delegates' })
      .populate({ path: 'exhibitors' })
      .populate({ path: 'speakers' })
      .populate({ path: 'sponsors' })
      .populate({
        path: 'media_partners',
      })
      .populate({ path: 'faqs' })
      .populate({ path: 'hotels' })
      .populate({ path: 'conference_programmes' })
      .populate({
        path: 'poster_images',
        // options: { limit: poster_images },
        select: '_id file_name file_url',
      })
      .lean()
      .exec()

    if (!eventRecord) {
      return sendResponse({
        res,
        success: false,
        message: 'Event not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.GET_SUCCESS,
      data: eventRecord,
    })
  })

  static getEventDates = catchAsync(async (req: any, res: any) => {
    const eventId = req?.params?.event_id

    const eventRecord = await EventsModel.findById(eventId).lean().exec()

    if (!eventRecord) {
      return sendResponse({
        res,
        success: false,
        message: 'Event not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    const eventStartDate = moment(eventRecord?.start_date)
    const eventEndDate = moment(eventRecord?.end_date)

    const diffDays = eventEndDate.diff(eventStartDate, 'days')

    let dates: any[] = []

    for (let i = 0; i <= diffDays + 1; i++) {
      dates.push(moment(eventStartDate).add(i, 'days').toISOString())
    }

    dates = dates.map((_date) => {
      let updatedDate = new Date(_date)
      let outputDate = new Date()

      outputDate.setDate(updatedDate.getDate())
      outputDate.setMonth(updatedDate.getMonth())
      outputDate.setFullYear(updatedDate.getFullYear())
      outputDate.setHours(updatedDate.getHours())
      outputDate.setMinutes(updatedDate.getMinutes())
      outputDate.setSeconds(updatedDate.getSeconds())

      return outputDate.toISOString()
    })

    let data = {
      ...eventRecord,
      event_dates: dates,
    }

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.GET_SUCCESS,
      data: data,
    })
  })

  static getEventDetailsByForWeb = catchAsync(async (req: any, res: any) => {
    const eventId = req?.params?.event_id

    const { poster_images = 6 } = req.query

    const eventRecord = await EventsModel.findById(eventId)
      .populate({ path: 'sponsors' })
      .populate({
        path: 'media_partners',
      })

      .populate({
        path: 'poster_images',
        // options: { limit: poster_images },
        select: '_id file_name file_url',
      })
      .lean()
      .exec()

    if (!eventRecord) {
      return sendResponse({
        res,
        success: false,
        message: 'Event not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.GET_SUCCESS,
      data: eventRecord,
    })
  })

  static getGalleryImages = catchAsync(async (req: any, res: any) => {
    const eventId = req?.params?.event_id

    const { limit = 30, page = 1 } = req.query

    const [eventRecord, eventRecordForImagesCount] = await Promise.all([
      EventsModel.findById(eventId)
        .populate({
          path: 'poster_images',
          options: { limit: Number(limit) },
          select: '_id file_name file_url',
        })
        .lean()
        .exec(),

      EventsModel.findById(eventId)
        .populate({
          path: 'poster_images',
          select: '_id file_name file_url',
        })
        .lean()
        .exec(),
    ])

    if (!eventRecord) {
      return sendResponse({
        res,
        success: false,
        message: 'Event not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.GET_SUCCESS,
      data: {
        docs: eventRecord?.poster_images ?? [],
        totalDocs: eventRecordForImagesCount?.poster_images?.length ?? 0,
        limit,
        page,
      },
    })
  })

  /**
   * Get delegates assigned to event
   */
  static getDelegates = catchAsync(async (req: any, res: any) => {
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
      query.status = status
    }

    const options = {
      page: page,
      limit: limit,
      lean: true,
      sort: { createdAt: created_at },
      select:
        '_id id events first_name last_name avatar email phone phone_country_code delegate_URL delegate_linkedin createdAt ',
    }

    query.events = new ObjectId(eventId)

    const delegates = await (DelegatesModel as any).paginate(query, options)

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.GET_SUCCESS,
      data: delegates,
    })
  })

  /**
   * Get delegates to add to events
   */
  static getDelegatesToAdd = catchAsync(async (req: any, res: any) => {
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
      query.status = status
    }

    const options = {
      page: page,
      limit: limit,
      lean: true,
      sort: { createdAt: created_at },
      select:
        '_id id events first_name last_name avatar email phone phone_country_code delegate_URL delegate_linkedin createdAt ',
    }

    query.events = { $ne: new ObjectId(eventId) }

    const delegates = await (DelegatesModel as any).paginate(query, options)

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.GET_SUCCESS,
      data: delegates,
    })
  })

  /**
   * Get exhibitors assigned to event
   */
  static getExhibitors = catchAsync(async (req: any, res: any) => {
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
      query.status = status
    }
    query.events = { $in: [new ObjectId(eventId)] }
    // query.events = new ObjectId(eventId)

 

    const options = {
      page: page,
      limit: limit,
      lean: true,
      sort: { createdAt: created_at },
      // select:
      //   '_id id events first_name last_name avatar email phone phone_country_code delegate_URL delegate_linkedin createdAt ',
    }

    const exhibitors = await (ExhibitorsModel as any).paginate(query, options)

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.GET_SUCCESS,
      data: exhibitors,
    })
  })

  /**
   * Get exhibitors assigned to event
   */
  static getExhibitorsToAdd = catchAsync(async (req: any, res: any) => {
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
          { exhibitor_name: { $regex: search, $options: 'i' } },
          { first_name: { $regex: search, $options: 'i' } },
          { last_name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }
    } else if (search) {
      query = {
        $or: [
          { exhibitor_name: { $regex: search, $options: 'i' } },
          { first_name: { $regex: search, $options: 'i' } },
          { last_name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }
    }

    if (status) {
      query.status = status
    }

    query.events = { $ne: new ObjectId(eventId) }

    const options = {
      page: page,
      limit: limit,
      lean: true,
      sort: { createdAt: created_at },
      // select:
      //   '_id id events first_name last_name avatar email phone phone_country_code delegate_URL delegate_linkedin createdAt ',
    }

    const exhibitors = await (ExhibitorsModel as any).paginate(query, options)

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.GET_SUCCESS,
      data: exhibitors,
    })
  })

  /**
   * Get sponsors assigned to event
   */
  static getSponsors = catchAsync(async (req: any, res: any) => {
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
          { sponsor_name: { $regex: search, $options: 'i' } },
          { representative_firstname: { $regex: search, $options: 'i' } },
          { representative_lastname: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }
    } else if (search) {
      query = {
        $or: [
          { sponsor_name: { $regex: search, $options: 'i' } },
          { representative_firstname: { $regex: search, $options: 'i' } },
          { representative_lastname: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
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

    const sponsors = await (SponsorsModel as any).paginate(query, options)

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.GET_SUCCESS,
      data: sponsors,
    })
  })

  /**
   * Get sponsors to add to event
   */
  static getSponsorsToAdd = catchAsync(async (req: any, res: any) => {
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
          { sponsor_name: { $regex: search, $options: 'i' } },
          { representative_firstname: { $regex: search, $options: 'i' } },
          { representative_lastname: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }
    } else if (search) {
      query = {
        $or: [
          { sponsor_name: { $regex: search, $options: 'i' } },
          { representative_firstname: { $regex: search, $options: 'i' } },
          { representative_lastname: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }
    }

    if (status) {
      query.status = status
    }

    query.events = { $ne: new ObjectId(eventId) }

    const options = {
      page: page,
      limit: limit,
      lean: true,
      sort: { createdAt: created_at },
    }

    const sponsors = await (SponsorsModel as any).paginate(query, options)

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.GET_SUCCESS,
      data: sponsors,
    })
  })

  /**
   * Get speakers assigned to event
   */
  static getSpeakers = catchAsync(async (req: any, res: any) => {
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
      query.status = status
    }

    query.events = new ObjectId(eventId)

    const options = {
      page: page,
      limit: limit,
      lean: true,
      sort: { createdAt: created_at },
    }

    const sponsors = await (SpeakersModel as any).paginate(query, options)

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.GET_SUCCESS,
      data: sponsors,
    })
  })

  /**
   * Get speakers to add to event
   */
  static getSpeakersToAdd = catchAsync(async (req: any, res: any) => {
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
      query.status = status
    }

    query.events = { $ne: new ObjectId(eventId) }

    const options = {
      page: page,
      limit: limit,
      lean: true,
      sort: { createdAt: created_at },
    }

    const sponsors = await (SpeakersModel as any).paginate(query, options)

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.GET_SUCCESS,
      data: sponsors,
    })
  })

  /**
   * Get media partners assigned to event
   */
  static getMediaPartners = catchAsync(async (req: any, res: any) => {
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
      query.status = status
    }

    query.events = new ObjectId(eventId)

    const options = {
      page: page,
      limit: limit,
      lean: true,
      sort: { createdAt: created_at },
    }

    const sponsors = await (MediaPartnersModel as any).paginate(query, options)

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.GET_SUCCESS,
      data: sponsors,
    })
  })

  /**
   * Get media partners to add to event
   */
  static getMediaPartnersToAdd = catchAsync(async (req: any, res: any) => {
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
      query.status = status
    }

    query.events = { $ne: new ObjectId(eventId) }

    const options = {
      page: page,
      limit: limit,
      lean: true,
      sort: { createdAt: created_at },
    }

    const sponsors = await (MediaPartnersModel as any).paginate(query, options)

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.GET_SUCCESS,
      data: sponsors,
    })
  })

  /**
   * send invite to delegate
   */
  static sendInviteToDelegate = catchAsync(async (req: any, res: any) => {
    /**
     * TODO
     *
     * We need to think about the logic for the event invites
     * for now we just mock thi api to send the response back to user
     */
    const eventId = req?.params?.event_id

    const event = await EventsModel.findById(eventId)

    let userIds = req.body.user_ids

    if (!event) {
      return sendResponse({
        res,
        success: false,
        message: 'Event not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    const sendInvite = async (params: { delegateId: string }) => {
      const delegateId = params.delegateId

      const delegate = await DelegatesModel.findByIdAndUpdate(
        delegateId,
        {},
        { new: true }
      )

      if (!delegate) {
        throw new APIError({
          message: `Delegate with id ${delegateId} not found!`,
          code: ResponseCodes.NOT_FOUND,
          status: HttpStatusCode.BadRequest,
        })
      }

      await EventInvitesModel.deleteMany({
        user_id: delegateId,
        event_id: eventId,
      })

      const passwordRes = await PasswordHelpers.generatePasswordForEventPage()

      const newInvite = await EventInvitesModel.create({
        event_id: eventId,
        user_id: delegateId,
        invitation_password: passwordRes.encrypted,
        invitation_username: delegate.email,
        user_type: CommonEnums.users.delegate,
      })

      if (!newInvite) {
        throw new APIError({
          message: `Invitation is not created for user with id ${delegateId}!`,
          code: ResponseCodes.FAILED,
          status: HttpStatusCode.BadRequest,
        })
      }

      await EmailService.sendEventInviteToUser({
        email: delegate.email,
        event: event.toJSON(),
        user: delegate.toObject(),
        password: passwordRes.password,
      })

      let updatedEventInvites: any[] = []

      delegate.event_invites.forEach((_id) => {
        if (_id?.toString()) updatedEventInvites.push(_id.toString())
      })

      if (!updatedEventInvites.includes(eventId?.trim())) {
        updatedEventInvites.push(eventId?.trim())
      }

      delegate.event_invites = updatedEventInvites as any

      await delegate.save()
    }

    let sendInvitePromises: any = []

    userIds.forEach((delegateId: string) => {
      sendInvitePromises.push(() => sendInvite({ delegateId }))
    })

    await Promise.all(sendInvitePromises.map((_promise: any) => _promise()))

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.SUCCESS,
    })
  })

  /**
   * send invite to exhibitor
   */
  static sendInviteToExhibitor = catchAsync(async (req: any, res: any) => {
    /**
     * TODO
     *
     * We need to think about the logic for the event invites
     * for now we just mock thi api to send the response back to user
     */
    const eventId = req?.params?.event_id

    const event = await EventsModel.findById(eventId)

    let userIds = req.body.user_ids

    if (!event) {
      return sendResponse({
        res,
        success: false,
        message: 'Event not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    const sendInvite = async (params: { userId: string }) => {
      const userId = params.userId

      const user = await ExhibitorsModel.findByIdAndUpdate(
        userId,
        {},
        { new: true }
      )

      if (!user) {
        throw new APIError({
          message: `User with id ${userId} not found!`,
          code: ResponseCodes.NOT_FOUND,
          status: HttpStatusCode.BadRequest,
        })
      }

      await EventInvitesModel.deleteMany({
        user_id: userId,
        event_id: eventId,
      })

      const passwordRes = await PasswordHelpers.generatePasswordForEventPage()

      const newInvite = await EventInvitesModel.create({
        event_id: eventId,
        user_id: userId,
        invitation_password: passwordRes.encrypted,
        invitation_username: user.email,
        user_type: CommonEnums.users.exhibitor,
      })

      if (!newInvite) {
        throw new APIError({
          message: `Invitation is not created for user with id ${userId}!`,
          code: ResponseCodes.FAILED,
          status: HttpStatusCode.BadRequest,
        })
      }

      await EmailService.sendEventInviteToUser({
        email: user.email,
        event: event.toJSON(),
        user: user.toObject(),
        password: passwordRes.password,
      })

      let updatedEventInvites: any[] = []

      user.event_invites.forEach((_id) => {
        if (_id?.toString()) updatedEventInvites.push(_id.toString())
      })

      if (!updatedEventInvites.includes(eventId?.trim())) {
        updatedEventInvites.push(eventId?.trim())
      }

      user.event_invites = updatedEventInvites as any

      await user.save()
    }

    let sendInvitePromises: any = []

    userIds.forEach((userId: string) => {
      sendInvitePromises.push(() => sendInvite({ userId }))
    })

    await Promise.all(sendInvitePromises.map((_promise: any) => _promise()))

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.SUCCESS,
    })
  })

  /**
   * send invite to Speaker
   */
  static sendInviteToSpeaker = catchAsync(async (req: any, res: any) => {
    let userIds = req.body.user_ids
    const eventId = req?.params?.event_id

    const event = await EventsModel.findById(eventId)

    if (!event) {
      return sendResponse({
        res,
        success: false,
        message: 'Event not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    const sendInvite = async (params: { userId: string }) => {
      const userId = params.userId

      const user = await SpeakersModel.findByIdAndUpdate(
        userId,
        {},
        { new: true }
      )

      if (!user) {
        throw new APIError({
          message: `User with id ${userId} not found!`,
          code: ResponseCodes.NOT_FOUND,
          status: HttpStatusCode.BadRequest,
        })
      }

      await EventInvitesModel.deleteMany({
        user_id: userId,
        event_id: eventId,
      })

      const passwordRes = await PasswordHelpers.generatePasswordForEventPage()

      const newInvite = await EventInvitesModel.create({
        event_id: eventId,
        user_id: userId,
        invitation_password: passwordRes.encrypted,
        invitation_username: user.email,
        user_type: CommonEnums.users.speaker,
      })

      if (!newInvite) {
        throw new APIError({
          message: `Invitation is not created for user with id ${userId}!`,
          code: ResponseCodes.FAILED,
          status: HttpStatusCode.BadRequest,
        })
      }

      await EmailService.sendEventInviteToUser({
        email: user.email,
        event: event.toJSON(),
        user: user.toObject(),
        password: passwordRes.password,
      })

      let updatedEventInvites: any[] = []

      user.event_invites.forEach((_id) => {
        if (_id?.toString()) updatedEventInvites.push(_id.toString())
      })

      if (!updatedEventInvites.includes(eventId?.trim())) {
        updatedEventInvites.push(eventId?.trim())
      }

      user.event_invites = updatedEventInvites as any

      await user.save()
    }

    let sendInvitePromises: any = []

    userIds.forEach((userId: string) => {
      sendInvitePromises.push(() => sendInvite({ userId }))
    })

    await Promise.all(sendInvitePromises.map((_promise: any) => _promise()))

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.SUCCESS,
    })
  })

  /**
   * send invite to media partner
   */
  static sendInviteToMediaPartner = catchAsync(async (req: any, res: any) => {
    let userIds = req.body.user_ids
    const eventId = req?.params?.event_id

    const event = await EventsModel.findById(eventId)

    if (!event) {
      return sendResponse({
        res,
        success: false,
        message: 'Event not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    const sendInvite = async (params: { userId: string }) => {
      const userId = params.userId

      const user = await MediaPartnersModel.findByIdAndUpdate(
        userId,
        {},
        { new: true }
      )

      if (!user) {
        throw new APIError({
          message: `User with id ${userId} not found!`,
          code: ResponseCodes.NOT_FOUND,
          status: HttpStatusCode.BadRequest,
        })
      }

      await EventInvitesModel.deleteMany({
        user_id: userId,
        event_id: eventId,
      })

      const passwordRes = await PasswordHelpers.generatePasswordForEventPage()

      const newInvite = await EventInvitesModel.create({
        event_id: eventId,
        user_id: userId,
        invitation_password: passwordRes.encrypted,
        invitation_username: user.email,
        user_type: CommonEnums.users.media_partner,
      })

      if (!newInvite) {
        throw new APIError({
          message: `Invitation is not created for user with id ${userId}!`,
          code: ResponseCodes.FAILED,
          status: HttpStatusCode.BadRequest,
        })
      }

      await EmailService.sendEventInviteToUser({
        email: user.email,
        event: event.toJSON(),
        user: user.toObject(),
        password: passwordRes.password,
      })

      let updatedEventInvites: any[] = []

      user.event_invites.forEach((_id) => {
        if (_id?.toString()) updatedEventInvites.push(_id.toString())
      })

      if (!updatedEventInvites.includes(eventId?.trim())) {
        updatedEventInvites.push(eventId?.trim())
      }

      user.event_invites = updatedEventInvites as any

      await user.save()
    }

    let sendInvitePromises: any = []

    userIds.forEach((userId: string) => {
      sendInvitePromises.push(() => sendInvite({ userId }))
    })

    await Promise.all(sendInvitePromises.map((_promise: any) => _promise()))

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.SUCCESS,
    })
  })

  /**
   * send invite to sponsor
   */
  static sendInviteToSponsor = catchAsync(async (req: any, res: any) => {
    let userIds = req.body.user_ids
    const eventId = req?.params?.event_id

    const event = await EventsModel.findById(eventId)

    if (!event) {
      return sendResponse({
        res,
        success: false,
        message: 'Event not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    const sendInvite = async (params: { userId: string }) => {
      const userId = params.userId

      const user = await SponsorsModel.findByIdAndUpdate(
        userId,
        {},
        { new: true }
      )

      if (!user) {
        throw new APIError({
          message: `User with id ${userId} not found!`,
          code: ResponseCodes.NOT_FOUND,
          status: HttpStatusCode.BadRequest,
        })
      }

      await EventInvitesModel.deleteMany({
        user_id: userId,
        event_id: eventId,
      })

      const passwordRes = await PasswordHelpers.generatePasswordForEventPage()

      const newInvite = await EventInvitesModel.create({
        event_id: eventId,
        user_id: userId,
        invitation_password: passwordRes.encrypted,
        invitation_username: user.email,
        user_type: CommonEnums.users.sponsor,
      })

      if (!newInvite) {
        throw new APIError({
          message: `Invitation is not created for user with id ${userId}!`,
          code: ResponseCodes.FAILED,
          status: HttpStatusCode.BadRequest,
        })
      }

      await EmailService.sendEventInviteToUser({
        email: user.email,
        event: event.toJSON(),
        user: user.toObject(),
        password: passwordRes.password,
      })

      let updatedEventInvites: any[] = []

      user.event_invites.forEach((_id) => {
        if (_id?.toString()) updatedEventInvites.push(_id.toString())
      })

      if (!updatedEventInvites.includes(eventId?.trim())) {
        updatedEventInvites.push(eventId?.trim())
      }

      user.event_invites = updatedEventInvites as any

      await user.save()
    }

    let sendInvitePromises: any = []

    userIds.forEach((userId: string) => {
      sendInvitePromises.push(() => sendInvite({ userId }))
    })

    await Promise.all(sendInvitePromises.map((_promise: any) => _promise()))

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.SUCCESS,
    })
  })

  /**
   * get invitation status for users
   *
   *
   * invitation is sent or not!
   */
  static getEventInvitationStatus = catchAsync(async (req: any, res: any) => {
    const eventId = req?.params?.event_id

    const userId = req?.body?.user_id
    let userType = req?.body?.user_type

    if (userType == 'media_partner') {
      userType = CommonEnums.users.media_partner
    }

    const invitationStatus =
      await EventInvitationServices.checkEventInvitationForUser({
        event_id: eventId,
        user_id: userId,
        user_type: userType,
      })

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.SUCCESS,
      data: {
        invitation: invitationStatus.success,
        invitation_data: invitationStatus?.invitation_data,
      },
    })
  })

  /**
   * Add delegates to event
   */
  static addDelegatesToEvent = catchAsync(async (req: any, res: any) => {
    const eventId = req?.params?.event_id

    const { delegate_ids } = req.body

    if (!delegate_ids.length) {
      return sendResponse({
        res,
        success: false,
        message: 'Please select delegates first!',
        response_code: ResponseCodes.FAILED,
      })
    }

    const event = await EventsModel.findByIdAndUpdate(
      eventId,
      {},
      { new: true }
    )

    if (!event) {
      return sendResponse({
        res,
        success: false,
        message: 'Event not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    let delegates = event.delegates.map((_id) => _id.toString())

    delegate_ids.forEach((_delegateId: string) => {
      if (!delegates.includes(_delegateId)) {
        delegates.push(_delegateId)
      }
    })

    event.delegates = delegates as any

    await event.save()

    await EventServices.addEventToDelegates({
      delegate_ids,
      event_id: event._id.toString(),
    })

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.UPDATE_SUCCESS,
    })
  })

  /**
   * Add exhibitors to event
   */
  static addExhibitorsToEvent = catchAsync(async (req: any, res: any) => {
    const eventId = req?.params?.event_id

    const { exhibitor_ids } = req.body

    if (!exhibitor_ids.length) {
      return sendResponse({
        res,
        success: false,
        message: 'Please select exhibitors first!',
        response_code: ResponseCodes.FAILED,
      })
    }

    const event = await EventsModel.findByIdAndUpdate(
      eventId,
      {},
      { new: true }
    )

    if (!event) {
      return sendResponse({
        res,
        success: false,
        message: 'Event not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    let exhibitors = event.exhibitors.map((_id) => _id.toString())

    exhibitor_ids.forEach((_delegateId: string) => {
      if (!exhibitors.includes(_delegateId)) {
        exhibitors.push(_delegateId)
      }
    })

    event.exhibitors = exhibitors as any

    await event.save()

    await EventServices.addEventToExhibitors({
      exhibitor_ids,
      event_id: event._id.toString(),
    })

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.UPDATE_SUCCESS,
    })
  })

  /**
   * Add sponsors to event
   */
  static addSponsorsToEvent = catchAsync(async (req: any, res: any) => {
    const eventId = req?.params?.event_id

    const { sponsor_ids } = req.body

    if (!sponsor_ids.length) {
      return sendResponse({
        res,
        success: false,
        message: 'Please select sponsors first!',
        response_code: ResponseCodes.FAILED,
      })
    }

    const event = await EventsModel.findByIdAndUpdate(
      eventId,
      {},
      { new: true }
    )

    if (!event) {
      return sendResponse({
        res,
        success: false,
        message: 'Event not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    let sponsors = event.sponsors.map((_id) => _id.toString())

    sponsor_ids.forEach((_delegateId: string) => {
      if (!sponsors.includes(_delegateId)) {
        sponsors.push(_delegateId)
      }
    })

    event.sponsors = sponsors as any

    await event.save()

    await EventServices.addEventToSponsors({
      sponsor_ids,
      event_id: event._id.toString(),
    })

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.UPDATE_SUCCESS,
    })
  })

  /**
   * Add speakers to event
   */
  static addSpeakersToEvent = catchAsync(async (req: any, res: any) => {
    const eventId = req?.params?.event_id

    const { speaker_ids } = req.body

    if (!speaker_ids.length) {
      return sendResponse({
        res,
        success: false,
        message: 'Please select speakers first!',
        response_code: ResponseCodes.FAILED,
      })
    }

    const event = await EventsModel.findByIdAndUpdate(
      eventId,
      {},
      { new: true }
    )

    if (!event) {
      return sendResponse({
        res,
        success: false,
        message: 'Event not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    let speakers = event.speakers.map((_id) => _id.toString())

    speaker_ids.forEach((_delegateId: string) => {
      if (!speakers.includes(_delegateId)) {
        speakers.push(_delegateId)
      }
    })

    event.speakers = speakers as any

    await event.save()

    await EventServices.addEventToSpeakers({
      speaker_ids,
      event_id: event._id.toString(),
    })

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.UPDATE_SUCCESS,
    })
  })

  /**
   * Add media partners to event
   */
  static addMediaPartnersToEvent = catchAsync(async (req: any, res: any) => {
    const eventId = req?.params?.event_id

    const { media_partner_ids } = req.body

    if (!media_partner_ids.length) {
      return sendResponse({
        res,
        success: false,
        message: 'Please select media partners first!',
        response_code: ResponseCodes.FAILED,
      })
    }

    const event = await EventsModel.findByIdAndUpdate(
      eventId,
      {},
      { new: true }
    )

    if (!event) {
      return sendResponse({
        res,
        success: false,
        message: 'Event not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    let media_partners = event.media_partners.map((_id) => _id.toString())

    media_partner_ids.forEach((_delegateId: string) => {
      if (!media_partners.includes(_delegateId)) {
        media_partners.push(_delegateId)
      }
    })

    event.media_partners = media_partners as any

    await event.save()

    await EventServices.addEventToMediaPartners({
      media_partner_ids,
      event_id: event._id.toString(),
    })

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.UPDATE_SUCCESS,
    })
  })

  /**
   * Remove delegates from event
   */
  static removeDelegatesFromEvent = catchAsync(async (req: any, res: any) => {
    const eventId = req?.params?.event_id

    const { delegate_ids } = req.body

    if (!delegate_ids.length) {
      return sendResponse({
        res,
        success: false,
        message: 'Please select delegates to remove!',
        response_code: ResponseCodes.FAILED,
      })
    }

    const event = await EventsModel.findByIdAndUpdate(
      eventId,
      {},
      { new: true }
    )

    if (!event) {
      return sendResponse({
        res,
        success: false,
        message: 'Event not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    let delegates = event.delegates.map((_id) => _id.toString())

    let updatedDelegates: any[] = []

    delegates.forEach((_delegateId: string) => {
      if (!delegate_ids.includes(_delegateId)) {
        updatedDelegates.push(_delegateId)
      }
    })

    event.delegates = updatedDelegates as any

    await Promise.all([
      EventInvitationServices.deleteInvitesForUser({
        event_id: eventId,
        users: delegate_ids.map((user: string) => {
          return {
            user_id: user,
            user_type: CommonEnums.users.delegate,
          }
        }),
      }),
      EventServices.removeEventFromDelegates({
        delegate_ids,
        event_id: event._id.toString(),
      }),
      event.save(),
    ])

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.UPDATE_SUCCESS,
    })
  })

  /**
   * Remove exhibitors from event
   */
  static removeExhibitorFromEvent = catchAsync(async (req: any, res: any) => {
    const eventId = req?.params?.event_id

    const { exhibitor_ids } = req.body

    if (!exhibitor_ids.length) {
      return sendResponse({
        res,
        success: false,
        message: 'Please select exhibitors to remove!',
        response_code: ResponseCodes.FAILED,
      })
    }

    const event = await EventsModel.findByIdAndUpdate(
      eventId,
      {},
      { new: true }
    )

    if (!event) {
      return sendResponse({
        res,
        success: false,
        message: 'Event not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    let exhibitors = event.exhibitors.map((_id) => _id.toString())

    let updatedList: any[] = []

    exhibitors.forEach((_id: string) => {
      if (!exhibitor_ids.includes(_id)) {
        updatedList.push(_id)
      }
    })

    event.exhibitors = updatedList as any

    await Promise.all([
      EventInvitationServices.deleteInvitesForUser({
        event_id: eventId,
        users: exhibitor_ids.map((user: string) => {
          return {
            user_id: user,
            user_type: CommonEnums.users.exhibitor,
          }
        }),
      }),
      EventServices.removeEventFromExhibitors({
        exhibitor_ids,
        event_id: event._id.toString(),
      }),
      event.save(),
    ])

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.UPDATE_SUCCESS,
    })
  })

  /**
   * Remove sponsors from event
   */
  static removeSponsorsFromEvent = catchAsync(async (req: any, res: any) => {
    const eventId = req?.params?.event_id

    const { sponsor_ids } = req.body

    if (!sponsor_ids.length) {
      return sendResponse({
        res,
        success: false,
        message: 'Please select sponsors to remove!',
        response_code: ResponseCodes.FAILED,
      })
    }

    const event = await EventsModel.findByIdAndUpdate(
      eventId,
      {},
      { new: true }
    )

    if (!event) {
      return sendResponse({
        res,
        success: false,
        message: 'Event not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    let sponsors = event.sponsors.map((_id) => _id.toString())

    let updatedList: any[] = []

    sponsors.forEach((_id: string) => {
      if (!sponsor_ids.includes(_id)) {
        updatedList.push(_id)
      }
    })

    event.sponsors = updatedList as any

    await Promise.all([
      EventInvitationServices.deleteInvitesForUser({
        event_id: eventId,
        users: sponsor_ids.map((user: string) => {
          return {
            user_id: user,
            user_type: CommonEnums.users.sponsor,
          }
        }),
      }),
      EventServices.removeEventFromSponsors({
        sponsor_ids,
        event_id: event._id.toString(),
      }),
      event.save(),
    ])

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.UPDATE_SUCCESS,
    })
  })

  /**
   * Remove speakers from event
   */
  static removeSpeakersFromEvent = catchAsync(async (req: any, res: any) => {
    const eventId = req?.params?.event_id

    const { speakers_ids } = req.body

    if (!speakers_ids.length) {
      return sendResponse({
        res,
        success: false,
        message: 'Please select speakers to remove!',
        response_code: ResponseCodes.FAILED,
      })
    }

    const event = await EventsModel.findByIdAndUpdate(
      eventId,
      {},
      { new: true }
    )

    if (!event) {
      return sendResponse({
        res,
        success: false,
        message: 'Event not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    let speakers = event.speakers.map((_id) => _id.toString())

    let updatedList: any[] = []

    speakers.forEach((_id: string) => {
      if (!speakers_ids.includes(_id)) {
        updatedList.push(_id)
      }
    })

    event.speakers = updatedList as any

    await Promise.all([
      EventInvitationServices.deleteInvitesForUser({
        event_id: eventId,
        users: speakers_ids.map((user: string) => {
          return {
            user_id: user,
            user_type: CommonEnums.users.speaker,
          }
        }),
      }),
      EventServices.removeEventFromSpeakers({
        speaker_ids: speakers_ids,
        event_id: event._id.toString(),
      }),
      event.save(),
    ])

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.UPDATE_SUCCESS,
    })
  })

  /**
   * Remove media partner from event
   */
  static removeMediaPartnersFromEvent = catchAsync(
    async (req: any, res: any) => {
      const eventId = req?.params?.event_id

      const { media_partner_ids } = req.body

      if (!media_partner_ids.length) {
        return sendResponse({
          res,
          success: false,
          message: 'Please select media partners to remove!',
          response_code: ResponseCodes.FAILED,
        })
      }

      const event = await EventsModel.findByIdAndUpdate(
        eventId,
        {},
        { new: true }
      )

      if (!event) {
        return sendResponse({
          res,
          success: false,
          message: 'Event not found!',
          response_code: ResponseCodes.NOT_FOUND,
        })
      }

      let media_partners = event.media_partners.map((_id) => _id.toString())

      let updatedList: any[] = []

      media_partners.forEach((_id: string) => {
        if (!media_partner_ids.includes(_id)) {
          updatedList.push(_id)
        }
      })

      event.media_partners = updatedList as any

      await Promise.all([
        EventInvitationServices.deleteInvitesForUser({
          event_id: eventId,
          users: media_partner_ids.map((user: string) => {
            return {
              user_id: user,
              user_type: CommonEnums.users.media_partner,
            }
          }),
        }),
        EventServices.removeEventFromMediaPartners({
          media_partners_ids: media_partner_ids,
          event_id: event._id.toString(),
        }),
        event.save(),
      ])

      return sendResponse({
        res,
        success: true,
        response_code: ResponseCodes.UPDATE_SUCCESS,
      })
    }
  )

  static binEvent = catchAsync(async (req: any, res: any) => {
    const eventId = req?.params?.event_id

    const updatedEvent = await EventsModel.findByIdAndUpdate(
      eventId,
      {
        status: CommonEnums.BINNED,
      },
      { new: true }
    )

    if (!updatedEvent) {
      return sendResponse({
        res,
        success: false,
        message: 'Event not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.DELETE_SUCCESS,
    })
  })

  static deleteEvent = catchAsync(async (req: any, res: any) => {
    const eventId = req?.params?.event_id

    const deleteResponse = await EventsModel.findByIdAndDelete(eventId)

    if (!deleteResponse) {
      return sendResponse({
        res,
        success: false,
        message: 'Event not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.DELETE_SUCCESS,
    })
  })

  static deleteFeaturedImage = catchAsync(async (req: any, res: any) => {
    const eventId = req?.params?.event_id

    const event = await EventsModel.findByIdAndUpdate(
      eventId,
      {},
      {
        new: true,
      }
    )

    if (!event) {
      return sendResponse({
        res,
        success: false,
        message: 'Event not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    if (event?.featured_image) {
      await UploadsHelpers.deleteUpload({
        image_url: event.featured_image,
      })

      event.featured_image = ''

      await event.save()
    }

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.DELETE_SUCCESS,
    })
  })

  static deleteEventLogo = catchAsync(async (req: any, res: any) => {
    const eventId = req?.params?.event_id

    const event = await EventsModel.findByIdAndUpdate(
      eventId,
      {},
      {
        new: true,
      }
    )

    if (!event) {
      return sendResponse({
        res,
        success: false,
        message: 'Event not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    if (event?.event_logo) {
      await UploadsHelpers.deleteUpload({
        image_url: event.event_logo,
      })

      event.event_logo = ''

      await event.save()
    }

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.DELETE_SUCCESS,
    })
  })

  static logInToEvent = catchAsync(async (req: any, res: any) => {
    const { email, password, event_id } = req.body

    const eventInvite = await EventInvitesModel.findOneAndUpdate(
      {
        invitation_username: email,
        event_id: event_id,
      },
      {},
      {
        new: true,
      }
    )
      .populate({
        path: 'event_id',
        model: EventsModel,
        select:
          '_id name description start_date end_date venue_city venue_country venue_zip venue_address_line_1 featured_image createdAt status',
      })
      .select('+password')

    if (!eventInvite) {
      return sendResponse({
        res,
        success: false,
        message: 'Credentials you entered is invalid!',
        response_code: ResponseCodes.INVALID_CREDENTIALS,
      })
    }

    if ((eventInvite?.event_id as any)?.status !== CommonEnums.status.ACTIVE) {
      return sendResponse({
        res,
        success: false,
        message: `Event is not active, you can't login!`,
        response_code: ResponseCodes.FAILED,
      })
    }

    const comparePassword = PasswordHelpers.checkPasswords({
      input_password: password,
      password_from_db: eventInvite.invitation_password,
    })

    if (!comparePassword) {
      return sendResponse({
        res,
        success: false,
        message: 'Credentials you entered is invalid!',
        response_code: ResponseCodes.INVALID_CREDENTIALS,
      })
    }

    let user: any = null
    const userType = eventInvite.user_type

    if (userType === CommonEnums.users.delegate) {
      user = await DelegatesModel.findById(eventInvite.user_id)
    }

    if (userType === CommonEnums.users.exhibitor) {
      user = await ExhibitorsModel.findById(eventInvite.user_id)
    }

    if (userType === CommonEnums.users.speaker) {
      user = await SpeakersModel.findById(eventInvite.user_id)
    }

    if (userType === CommonEnums.users.sponsor) {
      user = await SponsorsModel.findById(eventInvite.user_id)
    }

    if (userType === CommonEnums.users.media_partner) {
      user = await MediaPartnersModel.findById(eventInvite.user_id)
    }

    const jwtRes = await JwtHelpers.createAuthTokensForUser({
      payload: { ...user?.toJSON() },
      remember: false,
    })

    eventInvite.last_login = moment().toISOString() as any

    await eventInvite.save()

    const invitationData = eventInvite.toJSON()

    if (invitationData) delete (invitationData as any).invitation_password

    if (!jwtRes.success) {
      return sendResponse({
        res,
        success: false,
        message: 'Authentication failed, access tokens are not generated!',
        response_code: ResponseCodes.ACCESS_TOKEN_CREATION_FAILED,
      })
    }

    return sendResponse({
      res,
      success: true,
      message: 'Login successfully',
      response_code: ResponseCodes.LOGIN_SUCCESS,
      data: {
        invitation_data: invitationData,
        user,
        event: eventInvite?.event_id,
        access_token: jwtRes.access_token,
        refresh_token: jwtRes.refresh_token,
      },
    })
  })

  static uploadVenueMap = catchAsync(async (req: any, res: any) => {
    const eventId = req?.params?.event_id

    const event = await EventsModel.findById(eventId)

    if (!event) {
      throw new APIError({
        message: 'Event not found!',
        code: ResponseCodes.NOT_FOUND,
        status: HttpStatusCode.BadRequest,
      })
    }

    if (req?.file) {
      const uploadRes = await UploadsHelpers.uploadFile({
        file: req.file,
      })

      if (uploadRes) {
        event.venue_map_url = uploadRes.file_url
        event.venue_map_id = uploadRes._id

        await event.save()
      }
    } else {
      throw new APIError({
        message: 'Please select file to upload',
        code: ResponseCodes.NOT_FOUND,
        status: HttpStatusCode.BadRequest,
      })
    }

    return sendResponse({
      res,
      message: 'Venue map uploaded successfully',
      success: true,
      response_code: ResponseCodes.UPLOAD_SUCCESS,
    })
  })

  static getVenueMap = catchAsync(async (req: any, res: any) => {
    const eventId = req?.params?.event_id

    const event = await EventsModel.findById(eventId).populate({
      path: 'venue_map_id',
      model: UploadsModel,
    })

    if (!event) {
      throw new APIError({
        message: 'Event not found!',
        code: ResponseCodes.NOT_FOUND,
        status: HttpStatusCode.BadRequest,
      })
    }

    return sendResponse({
      res,
      message: 'Venue map uploaded successfully',
      success: true,
      response_code: ResponseCodes.GET_SUCCESS,
      data: event?.toJSON(),
    })
  })

  static deleteVenueMap = catchAsync(async (req: any, res: any) => {
    const eventId = req?.params?.event_id

    const event = await EventsModel.findByIdAndUpdate(eventId, {
      venue_map_url: '',
      venue_map_id: null,
    })

    if (!event) {
      throw new APIError({
        message: 'Event not found!',
        code: ResponseCodes.NOT_FOUND,
        status: HttpStatusCode.BadRequest,
      })
    }

    return sendResponse({
      res,
      message: 'Venue map deleted successfully',
      success: true,
      response_code: ResponseCodes.DELETE_SUCCESS,
    })
  })

  static generateMeetingScheduleFile = catchAsync(
    async (req: any, res: any) => {
      const eventId = req?.params?.event_id

      const meetingScheduleRes =
        await MeetingServices.generateMeetingsExcelFile({
          event_id: eventId,
        })

      return sendResponse({
        res,
        message: 'Schedules file created successfully!',
        success: true,
        data: meetingScheduleRes,
        response_code: ResponseCodes.GET_SUCCESS,
      })
    }
  )
}
