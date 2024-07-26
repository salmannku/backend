import { ObjectId } from 'mongodb'
import EventsModel from '../models/events.model'
import HotelsModel from '../models/hotels.model'

export class HotelServices {
  static addEventToHotel = async ({
    hotel_id,
    event_id,
  }: {
    hotel_id: string
    event_id: string
  }) => {
    try {
      if (!hotel_id || !event_id) return true

      const hotel = await HotelsModel.findByIdAndUpdate(
        hotel_id,
        {},
        {
          new: true,
        }
      )

      if (!hotel) {
        return true
      }

      let events = hotel?.events.map((_id) => _id.toString())

      if (!events?.includes(event_id)) {
        events.push(event_id)
      }

      hotel.events = events as any

      await hotel.save()

      return true
    } catch (err) {
      return false
    }
  }

  /**
   * Remove hotel from events
   */
  static deleteHotelFromEvents = async ({ hotel_id }: { hotel_id: string }) => {
    if (!hotel_id) return true

    const events = await EventsModel.find({
      hotels: new ObjectId(hotel_id),
    }).lean()

    const removeHotelFromEvents = async ({
      event_id,
    }: {
      event_id: string
    }) => {
      const event = await EventsModel.findByIdAndUpdate(
        event_id,
        {},
        { new: true }
      )

      if (!event) {
        return true
      }

      let hotels = event.hotels.map((_id) => _id.toString())

      let updatedHotels: any[] = []

      hotels.forEach((_id: string) => {
        if (_id === hotel_id) {
          return
        }
        updatedHotels.push(_id)
      })

      event.hotels = updatedHotels as any

      await event.save()
    }

    let _promises: any[] = []

    events.forEach((event: any) => {
      _promises.push(
        removeHotelFromEvents({
          event_id: event._id,
        })
      )
    })

    await Promise.all(_promises)

    return true
  }

  static deleteEventFromHotel = async ({
    hotel_id,
    event_id,
  }: {
    hotel_id: string
    event_id: string
  }) => {
    try {
      if (!hotel_id || !hotel_id) return true

      const hotel = await HotelsModel.findByIdAndUpdate(
        hotel_id,
        {},
        {
          new: true,
        }
      )

      if (!hotel) {
        return true
      }

      let events = hotel?.events.map((_id) => _id.toString())

      let updatedEvents: any[] = []

      events.forEach((_id: string) => {
        if (_id === event_id) {
          return
        }
        updatedEvents.push(_id)
      })

      hotel.events = updatedEvents as any

      await hotel.save()

      return true
    } catch (err) {
      return false
    }
  }

  /**
   * Remove events from hotel
   */
  static deleteEventsFromHotel = async ({
    hotel_id,
    event_ids,
  }: {
    hotel_id: string
    event_ids: string[]
  }) => {
    try {
      if (!hotel_id || !event_ids?.length) return true

      const hotel = await HotelsModel.findByIdAndUpdate(
        hotel_id,
        {},
        {
          new: true,
        }
      )

      if (!hotel) {
        return true
      }

      let events = hotel?.events.map((_id) => _id.toString())

      let updatedEvents: any[] = []

      event_ids.forEach((_id: string) => {
        if (events.includes(_id)) {
          return
        }

        updatedEvents.push(_id)
      })

      hotel.events = updatedEvents as any

      await hotel.save()

      return true
    } catch (err) {
      return false
    }
  }
}
