import { isValidObjectId } from 'mongoose'
import { sendResponse } from '../../helpers/common'
import { catchAsync } from '../../utils/catchAsync'
import ResponseCodes from '../../utils/responseCodes'
import { ObjectId } from 'mongodb'
import HotelsModel from '../../models/hotels.model'
import { EventServices } from '../../services/event.services'
import { HotelServices } from '../../services/hotel.services'
import { UploadsHelpers } from '../../helpers/uploads.helpers'
import UploadsModel from '../../models/uploads.model'
import EventsModel from '../../models/events.model'

export class HotelController {
  static create = catchAsync(async (req: any, res: any) => {
    const {
      hotel_name,
      description,
      hotel_email,
      phone,
      phone_country_code,
      city,
      country,
      zip,
      address_line_1,
      address_line_2,
      hotel_url,
      events = [],
      hotel_images = [],
    } = req.body

    const alreadyExist = await HotelsModel.findOne({
      hotel_name,
    })

    if (alreadyExist) {
      return sendResponse({
        res,
        success: false,
        message: 'Hotel with name already exist!',
        response_code: ResponseCodes.ALREADY_EXIST,
      })
    }

    const newHotel = await HotelsModel.create({
      hotel_name,
      description,
      hotel_email,
      phone,
      phone_country_code,
      city,
      country,
      zip,
      address_line_1,
      address_line_2,
      hotel_url,
      events,
      hotel_images,
    })

    if (!newHotel) {
      return sendResponse({
        res,
        success: false,
        message: 'Hotel is not created, try again!',
        response_code: ResponseCodes.CREATE_FAILED,
      })
    }

    const addHotelToEventsRes = await EventServices.addHotelToEvents({
      event_ids: events,
      hotel_id: newHotel._id.toString(),
    })

    if (!addHotelToEventsRes) {
      await HotelsModel.findByIdAndDelete(newHotel._id)

      return sendResponse({
        res,
        success: false,
        message: 'Hotel is not assigned to events, please try again!',
        response_code: ResponseCodes.FAILED,
      })
    }

    return sendResponse({
      res,
      success: true,
      message: 'Hotel created successfully',
      response_code: ResponseCodes.CREATE_SUCCESS,
    })
  })

  static getAllHotels = catchAsync(async (req: any, res: any) => {
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
          { hotel_name: { $regex: search, $options: 'i' } },
          { hotel_email: { $regex: search, $options: 'i' } },
        ],
      }
    } else if (search) {
      query = {
        $or: [
          { hotel_name: { $regex: search, $options: 'i' } },
          { hotel_email: { $regex: search, $options: 'i' } },
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
      populate: {
        path: 'hotel_images',
        model: UploadsModel,
        select: '_id file_url',
      },
    }

    const hotels = await (HotelsModel as any).paginate(query, options)

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.GET_SUCCESS,
      data: hotels,
    })
  })

  static getHotelEvents = catchAsync(async (req: any, res: any) => {
    const hotelId = req?.params?.hotel_id

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
      sort: { createdAt: created_at },
    }

    query.hotels = new ObjectId(hotelId)

    const events = await (EventsModel as any).paginate(query, options)

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.GET_SUCCESS,
      data: events,
    })
  })

  static getHotelsForEvent = catchAsync(async (req: any, res: any) => {
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
          { hotel_name: { $regex: search, $options: 'i' } },
          { hotel_email: { $regex: search, $options: 'i' } },
        ],
      }
    } else if (search) {
      query = {
        $or: [
          { hotel_name: { $regex: search, $options: 'i' } },
          { hotel_email: { $regex: search, $options: 'i' } },
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
      populate: {
        path: 'hotel_images',
        model: UploadsModel,
        select: '_id file_url',
      },
    }

    const hotels = await (HotelsModel as any).paginate(query, options)

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.GET_SUCCESS,
      data: hotels,
    })
  })

  static webGetHotelsForEvent = catchAsync(async (req: any, res: any) => {
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
          { hotel_name: { $regex: search, $options: 'i' } },
          { hotel_email: { $regex: search, $options: 'i' } },
        ],
      }
    } else if (search) {
      query = {
        $or: [
          { hotel_name: { $regex: search, $options: 'i' } },
          { hotel_email: { $regex: search, $options: 'i' } },
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
      populate: {
        path: 'hotel_images',
        model: UploadsModel,
        select: '_id file_url',
      },
    }

    const hotels = await (HotelsModel as any).paginate(query, options)

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.GET_SUCCESS,
      data: hotels,
    })
  })

  static getHotelsToAdd = catchAsync(async (req: any, res: any) => {
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
          { hotel_name: { $regex: search, $options: 'i' } },
          { hotel_email: { $regex: search, $options: 'i' } },
        ],
      }
    } else if (search) {
      query = {
        $or: [
          { hotel_name: { $regex: search, $options: 'i' } },
          { hotel_email: { $regex: search, $options: 'i' } },
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
      populate: {
        path: 'hotel_images',
        model: UploadsModel,
        select: '_id file_url',
      },
    }

    const hotels = await (HotelsModel as any).paginate(query, options)

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.GET_SUCCESS,
      data: hotels,
    })
  })

  static update = catchAsync(async (req: any, res: any) => {
    const hotelId = req?.params?.hotel_id

    const {
      hotel_name,
      description,
      hotel_email,
      phone,
      phone_country_code,
      city,
      country,
      zip,
      address_line_1,
      address_line_2,
      hotel_url,
      events = [],
      hotel_images = [],
    } = req.body

    const hotelRecord = await HotelsModel.findByIdAndUpdate(
      hotelId,
      {},
      {
        new: true,
      }
    ).populate({
      path: 'hotel_images',
      model: UploadsModel,
      select: '_id file_url',
    })

    if (!hotelRecord) {
      return sendResponse({
        res,
        success: false,
        message: 'Hotel not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    if (hotel_name) hotelRecord.hotel_name = hotel_name

    // if field is not required then user can send the empty value if user
    // is trying to clear the field value
    if (description || description === '') hotelRecord.description = description

    if (hotel_email || hotel_email === '') hotelRecord.hotel_email = hotel_email
    if (phone || phone === '') hotelRecord.phone = phone
    if (phone_country_code || phone_country_code === '')
      hotelRecord.phone_country_code = phone_country_code
    if (city || city === '') hotelRecord.city = city
    if (country) hotelRecord.country = country
    if (zip || zip === '') hotelRecord.zip = zip
    if (address_line_1 || address_line_1 === '')
      hotelRecord.address_line_1 = address_line_1
    if (address_line_2 || address_line_2 === '')
      hotelRecord.address_line_2 = address_line_2
    if (hotel_url || hotel_url === '') hotelRecord.hotel_url = hotel_url

    let updatedEvents = hotelRecord?.events.map((_id) => _id.toString())
    let updatedHotelImages = hotelRecord?.hotel_images.map((rec) =>
      rec?._id.toString()
    )

    let deletableEvents: any[] = []
    let deletableHotelImages: any[] = []

    updatedEvents.forEach((id: string) => {
      if (!events.includes(id)) {
        deletableEvents.push(id)
        updatedEvents = updatedEvents.filter((_id) => _id !== id)
      }
    })

    updatedHotelImages.forEach((id: string) => {
      if (!hotel_images.includes(id)) {
        deletableHotelImages.push(id)
        updatedHotelImages = updatedHotelImages.filter((_id) => _id !== id)
      }
    })

    let updatedDeletableImages: string[] = []

    hotelRecord.hotel_images.forEach((image: any) => {
      if (deletableHotelImages.includes(image._id.toString())) {
        updatedDeletableImages.push(image?.file_url)
      }
    })

    if (events) hotelRecord.events = events
    if (hotel_images) hotelRecord.hotel_images = hotel_images

    let _promises: any[] = []

    if (deletableEvents?.length) {
      deletableEvents.forEach((event_id: string) => {
        _promises.push(
          EventServices.removeHotelFromEvent({
            event_id: event_id?.trim(),
            hotel_id: hotelRecord?._id.toString(),
          })
        )
      })
    }

    if (updatedDeletableImages?.length) {
      updatedDeletableImages.forEach((image) => {
        _promises.push(
          UploadsHelpers.deleteUpload({
            image_url: image,
          })
        )
      })
    }

    if (events?.length) {
      events.forEach((event_id: string) => {
        _promises.push(
          EventServices.addHotelToEvents({
            event_ids: [event_id?.trim()],
            hotel_id: hotelRecord?._id.toString(),
          })
        )
      })
    }

    await Promise.all(_promises)

    await hotelRecord.save()

    return sendResponse({
      res,
      success: true,
      message: 'Hotel updated successfully',
      response_code: ResponseCodes.UPDATE_SUCCESS,
      data: null,
    })
  })

  static addHotelsToEvent = catchAsync(async (req: any, res: any) => {
    const { hotel_ids, event_id } = req.body

    let _promises: any[] = []

    hotel_ids.forEach((hotel_id: string) => {
      _promises.push(
        HotelServices.addEventToHotel({
          event_id: event_id?.trim(),
          hotel_id: hotel_id?.trim(),
        })
      )
    })

    _promises.push(
      EventServices.addHotelsToEvent({
        hotel_ids: hotel_ids.map((_id: any) => _id?.trim()),
        event_id: event_id?.trim(),
      })
    )

    if (_promises?.length) await Promise.all(_promises)

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.SUCCESS,
    })
  })

  static getHotelDetailsById = catchAsync(async (req: any, res: any) => {
    const hotelId = req?.params?.hotel_id

    const hotel = await HotelsModel.findById(hotelId)
      .populate({
        path: 'hotel_images',
        model: UploadsModel,
        select: '_id file_url file_name',
      })
      .populate({
        path: 'events',
        model: EventsModel,
        select: '_id name',
      })
      .lean()

    if (!hotel) {
      return sendResponse({
        res,
        success: false,
        message: 'Hotel not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    return sendResponse({
      res,
      data: hotel,
      success: true,
      response_code: ResponseCodes.GET_SUCCESS,
    })
  })

  static removeHotelFromEvents = catchAsync(async (req: any, res: any) => {
    const { hotel_id, event_ids } = req.body

    const hotel = await HotelsModel.findById(hotel_id)

    if (!hotel) {
      return sendResponse({
        res,
        success: false,
        message: 'Hotel not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    let _promises: any[] = []

    if (event_ids?.length) {
      event_ids.forEach((event_id: string) => {
        _promises.push(
          EventServices.removeHotelFromEvent({
            event_id: event_id?.trim(),
            hotel_id: hotel_id?.trim(),
          })
        )
      })

      _promises.push(
        HotelServices.deleteEventsFromHotel({
          event_ids: event_ids.map((_id: any) => _id?.trim()),
          hotel_id: hotel_id?.trim(),
        })
      )
    }

    if (_promises?.length) await Promise.all(_promises)

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.SUCCESS,
    })
  })

  static deletePermanent = catchAsync(async (req: any, res: any) => {
    const hotelId = req?.params?.hotel_id

    const deleteResponse = await HotelsModel.findByIdAndDelete(hotelId)

    if (!deleteResponse) {
      return sendResponse({
        res,
        success: false,
        message: 'Hotel not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    await HotelServices.deleteHotelFromEvents({
      hotel_id: deleteResponse?._id.toString(),
    })

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.DELETE_SUCCESS,
    })
  })
}
