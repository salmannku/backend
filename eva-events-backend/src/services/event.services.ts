import { ObjectId } from 'mongodb'
import { CommonEnums } from '../enums/common.enums'
import EventsModel, { IEventsModelSchema } from '../models/events.model'
import { EventInvitationServices } from './event-invitation.service'
import DelegatesModel from '../models/delegates.model'
import ExhibitorsModel from '../models/exhibitors.model'
import SponsorsModel from '../models/sponsors.model'
import SpeakersModel from '../models/speakers.model'
import MediaPartnersModel from '../models/media-partners.model'
import { UrlHelpers } from '../helpers/common'

export class EventServices {
  /**
   * Add sponsors to events
   */
  static addSponsor = async ({
    sponsor_id,
    event_ids = [],
  }: {
    sponsor_id: string
    event_ids: string[]
  }) => {
    if (!sponsor_id) {
      return true
    }

    const addUserToEvent = async (event_id: any) => {
      const event = await EventsModel.findByIdAndUpdate(
        event_id,
        {},
        { new: true }
      )

      if (!event) {
        return true
      }

      let sponsors = event.sponsors.map((_id) => _id.toString())

      if (!sponsors.includes(sponsor_id)) {
        sponsors.push(sponsor_id)
      }

      event.sponsors = sponsors as any

      await event.save()
    }

    const promises: any[] = []

    event_ids.forEach((_event) => {
      promises.push(addUserToEvent(_event))
    })

    await Promise.all(promises)

    return true
  }

  /**
   * Add delegate to events
   */
  static addDelegate = async ({
    delegate_id,
    event_ids = [],
  }: {
    delegate_id: string
    event_ids: string[]
  }) => {
    if (!delegate_id) {
      return true
    }

    const addUserToEvent = async (event_id: any) => {
      const event = await EventsModel.findByIdAndUpdate(
        event_id,
        {},
        { new: true }
      )

      if (!event) {
        return true
      }

      let delegates = event.delegates.map((_id) => _id.toString())

      if (!delegates.includes(delegate_id)) {
        delegates.push(delegate_id)
      }

      event.delegates = delegates as any

      await event.save()
    }

    const promises: any[] = []

    event_ids.forEach((_event) => {
      promises.push(addUserToEvent(_event))
    })

    await Promise.all(promises)
  }

  /**
   * Add speakers to events
   */
  static addSpeaker = async ({
    speaker_id,
    event_ids = [],
  }: {
    speaker_id: string
    event_ids: string[]
  }) => {
    if (!speaker_id) {
      return true
    }

    const addUserToEvent = async (event_id: any) => {
      const event = await EventsModel.findByIdAndUpdate(
        event_id,
        {},
        { new: true }
      )

      if (!event) {
        return true
      }

      let speakers = event.speakers.map((_id) => _id.toString())

      if (!speakers.includes(speaker_id)) {
        speakers.push(speaker_id)
      }

      event.speakers = speakers as any

      await event.save()
    }

    const promises: any[] = []

    event_ids.forEach((_event) => {
      promises.push(addUserToEvent(_event))
    })

    await Promise.all(promises)
  }

  /**
   * Add exhibitor to events
   */
  static addExhibitor = async ({
    exhibitor_id,
    event_ids = [],
  }: {
    exhibitor_id: string
    event_ids: string[]
  }) => {
    if (!exhibitor_id) {
      return true
    }

    const addUserToEvent = async (event_id: any) => {
      const event = await EventsModel.findByIdAndUpdate(
        event_id,
        {},
        { new: true }
      )

      if (!event) {
        return true
      }

      let exhibitors = event.exhibitors.map((_id) => _id.toString())

      if (!exhibitors.includes(exhibitor_id)) {
        exhibitors.push(exhibitor_id)
      }

      event.exhibitors = exhibitors as any

      await event.save()
    }

    const promises: any[] = []

    event_ids.forEach((_event) => {
      promises.push(addUserToEvent(_event))
    })

    await Promise.all(promises)
  }

  /**
   * Add media partner to events
   */
  static addMediaPartner = async ({
    media_partner_id,
    event_ids = [],
  }: {
    media_partner_id: string
    event_ids: string[]
  }) => {
    if (!media_partner_id) {
      return true
    }

    const addUserToEvent = async (event_id: any) => {
      const event = await EventsModel.findByIdAndUpdate(
        event_id,
        {},
        { new: true }
      )

      if (!event) {
        return true
      }

      let media_partners = event.media_partners.map((_id) => _id.toString())

      if (!media_partners.includes(media_partner_id)) {
        media_partners.push(media_partner_id)
      }

      event.media_partners = media_partners as any

      await event.save()
    }

    const promises: any[] = []

    event_ids.forEach((_event) => {
      promises.push(addUserToEvent(_event))
    })

    await Promise.all(promises)
  }

  /**
   * Remove exhibitor from event
   */
  static removeExhibitor = async ({
    exhibitor_id,
  }: {
    exhibitor_id: string
  }) => {
    const events = await EventsModel.find({
      exhibitors: new ObjectId(exhibitor_id),
    }).lean()

    const removeDelegateFromEvents = async ({
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

      let exhibitors = event.exhibitors.map((_id) => _id.toString())

      let updatedUsers: any[] = []

      exhibitors.forEach((_id: string) => {
        if (_id === exhibitor_id) {
          return
        }
        updatedUsers.push(_id)
      })

      event.exhibitors = updatedUsers as any
      // Delete event invite records for delegates
      await EventInvitationServices.deleteInvitesForUser({
        event_id: event_id,
        users: [
          {
            user_id: exhibitor_id,
            user_type: CommonEnums.users.exhibitor,
          },
        ],
      })

      await event.save()
    }

    let _promises: any[] = []

    events.forEach((event: any) => {
      _promises.push(
        removeDelegateFromEvents({
          event_id: event._id,
        })
      )
    })

    await Promise.all(_promises)

    return true
  }

  /**
   * Remove exhibitor from events
   */
  static removeExhibitorFromEvents = async ({
    exhibitor_id,
    event_ids,
  }: {
    exhibitor_id: string
    event_ids: string[]
  }) => {
    if (!event_ids?.length) return true

    const removeUserFromEvents = async ({ event_id }: { event_id: string }) => {
      const event = await EventsModel.findByIdAndUpdate(
        event_id,
        {},
        { new: true }
      )

      if (!event) {
        return true
      }

      let exhibitors = event.exhibitors.map((_id) => _id.toString())

      let updatedUsers: any[] = []

      exhibitors.forEach((_id: string) => {
        if (_id === exhibitor_id) {
          return
        }
        updatedUsers.push(_id)
      })

      event.exhibitors = updatedUsers as any
      // Delete event invite records for delegates
      await EventInvitationServices.deleteInvitesForUser({
        event_id: event_id,
        users: [
          {
            user_id: exhibitor_id,
            user_type: CommonEnums.users.exhibitor,
          },
        ],
      })

      await event.save()
    }

    let _promises: any[] = []

    event_ids.forEach((_id: any) => {
      _promises.push(
        removeUserFromEvents({
          event_id: _id,
        })
      )
    })

    await Promise.all(_promises)

    return true
  }

  /**
   * Remove delegate from event
   */
  static removeDelegate = async ({ delegate_id }: { delegate_id: string }) => {
    const events = await EventsModel.find({
      delegates: new ObjectId(delegate_id),
    }).lean()

    const removeUserFromEvents = async ({ event_id }: { event_id: string }) => {
      const event = await EventsModel.findByIdAndUpdate(
        event_id,
        {},
        { new: true }
      )

      if (!event) {
        return true
      }

      let delegates = event.delegates.map((_id) => _id.toString())

      let updatedUsers: any[] = []

      delegates.forEach((_id: string) => {
        if (_id === delegate_id) {
          return
        }
        updatedUsers.push(_id)
      })

      event.delegates = updatedUsers as any

      // Delete event invite records
      await EventInvitationServices.deleteInvitesForUser({
        event_id: event_id,
        users: [
          {
            user_id: delegate_id,
            user_type: CommonEnums.users.delegate,
          },
        ],
      })

      await event.save()
    }

    let _promises: any[] = []

    events.forEach((event: any) => {
      _promises.push(
        removeUserFromEvents({
          event_id: event._id,
        })
      )
    })

    await Promise.all(_promises)

    return true
  }

  /**
   * Remove delegate from events
   */
  static removeDelegateFromEvents = async ({
    delegate_id,
    event_ids,
  }: {
    delegate_id: string
    event_ids: string[]
  }) => {
    if (!event_ids?.length) return true

    const removeUserFromEvents = async ({ event_id }: { event_id: string }) => {
      const event = await EventsModel.findByIdAndUpdate(
        event_id,
        {},
        { new: true }
      )

      if (!event) {
        return true
      }

      let delegates = event.delegates.map((_id) => _id.toString())

      let updatedUsers: any[] = []

      delegates.forEach((_id: string) => {
        if (_id === delegate_id) {
          return
        }
        updatedUsers.push(_id)
      })

      event.delegates = updatedUsers as any

      // Delete event invite records
      await EventInvitationServices.deleteInvitesForUser({
        event_id: event_id,
        users: [
          {
            user_id: delegate_id,
            user_type: CommonEnums.users.delegate,
          },
        ],
      })

      await event.save()
    }

    let _promises: any[] = []

    event_ids.forEach((_id: any) => {
      _promises.push(
        removeUserFromEvents({
          event_id: _id,
        })
      )
    })

    await Promise.all(_promises)

    return true
  }

  /**
   * Remove sponsor from event
   */
  static removeSponsor = async ({ sponsor_id }: { sponsor_id: string }) => {
    const events = await EventsModel.find({
      sponsors: new ObjectId(sponsor_id),
    }).lean()

    const removeUserFromEvents = async ({ event_id }: { event_id: string }) => {
      const event = await EventsModel.findByIdAndUpdate(
        event_id,
        {},
        { new: true }
      )

      if (!event) {
        return true
      }

      let sponsors = event.sponsors.map((_id) => _id.toString())

      let updatedUsers: any[] = []

      sponsors.forEach((_id: string) => {
        if (_id === sponsor_id) {
          return
        }
        updatedUsers.push(_id)
      })

      event.sponsors = updatedUsers as any

      // Delete event invite records
      await EventInvitationServices.deleteInvitesForUser({
        event_id: event_id,
        users: [
          {
            user_id: sponsor_id,
            user_type: CommonEnums.users.sponsor,
          },
        ],
      })

      await event.save()
    }

    let _promises: any[] = []

    events.forEach((event: any) => {
      _promises.push(
        removeUserFromEvents({
          event_id: event._id,
        })
      )
    })

    await Promise.all(_promises)

    return true
  }

  /**
   * Remove sponsor from events
   */
  static removeSponsorFromEvents = async ({
    sponsor_id,
    event_ids,
  }: {
    sponsor_id: string
    event_ids: string[]
  }) => {
    if (!event_ids?.length) return true

    const removeUserFromEvents = async ({ event_id }: { event_id: string }) => {
      const event = await EventsModel.findByIdAndUpdate(
        event_id,
        {},
        { new: true }
      )

      if (!event) {
        return true
      }

      let sponsors = event.sponsors.map((_id) => _id.toString())

      let updatedUsers: any[] = []

      sponsors.forEach((_id: string) => {
        if (_id === sponsor_id) {
          return
        }
        updatedUsers.push(_id)
      })

      event.sponsors = updatedUsers as any

      // Delete event invite records
      await EventInvitationServices.deleteInvitesForUser({
        event_id: event_id,
        users: [
          {
            user_id: sponsor_id,
            user_type: CommonEnums.users.sponsor,
          },
        ],
      })

      await event.save()
    }

    let _promises: any[] = []

    event_ids.forEach((_id: any) => {
      _promises.push(
        removeUserFromEvents({
          event_id: _id,
        })
      )
    })

    await Promise.all(_promises)

    return true
  }

  /**
   * Remove speaker from event
   */
  static removeSpeaker = async ({ speaker_id }: { speaker_id: string }) => {
    const events = await EventsModel.find({
      speakers: new ObjectId(speaker_id),
    }).lean()

    const removeUserFromEvents = async ({ event_id }: { event_id: string }) => {
      const event = await EventsModel.findByIdAndUpdate(
        event_id,
        {},
        { new: true }
      )

      if (!event) {
        return true
      }

      let speakers = event.speakers.map((_id) => _id.toString())

      let updatedUsers: any[] = []

      speakers.forEach((_id: string) => {
        if (_id === speaker_id) {
          return
        }
        updatedUsers.push(_id)
      })

      event.speakers = updatedUsers as any

      // Delete event invite records
      await EventInvitationServices.deleteInvitesForUser({
        event_id: event_id,
        users: [
          {
            user_id: speaker_id,
            user_type: CommonEnums.users.speaker,
          },
        ],
      })

      await event.save()
    }

    let _promises: any[] = []

    events.forEach((event: any) => {
      _promises.push(
        removeUserFromEvents({
          event_id: event._id,
        })
      )
    })

    await Promise.all(_promises)

    return true
  }

  /**
   * Remove speaker from events
   */
  static removeSpeakerFromEvents = async ({
    speaker_id,
    event_ids,
  }: {
    speaker_id: string
    event_ids: string[]
  }) => {
    if (!event_ids?.length) return true

    const removeUserFromEvents = async ({ event_id }: { event_id: string }) => {
      const event = await EventsModel.findByIdAndUpdate(
        event_id,
        {},
        { new: true }
      )

      if (!event) {
        return true
      }

      let speakers = event.speakers.map((_id) => _id.toString())

      let updatedUsers: any[] = []

      speakers.forEach((_id: string) => {
        if (_id === speaker_id) {
          return
        }
        updatedUsers.push(_id)
      })

      event.speakers = updatedUsers as any

      // Delete event invite records
      await EventInvitationServices.deleteInvitesForUser({
        event_id: event_id,
        users: [
          {
            user_id: speaker_id,
            user_type: CommonEnums.users.speaker,
          },
        ],
      })

      await event.save()
    }

    let _promises: any[] = []

    event_ids.forEach((_id: any) => {
      _promises.push(
        removeUserFromEvents({
          event_id: _id,
        })
      )
    })

    await Promise.all(_promises)

    return true
  }

  /**
   * Remove media partner from event
   */
  static removeMediaPartner = async ({
    media_partner_id,
  }: {
    media_partner_id: string
  }) => {
    const events = await EventsModel.find({
      media_partners: new ObjectId(media_partner_id),
    }).lean()

    const removeUserFromEvents = async ({ event_id }: { event_id: string }) => {
      const event = await EventsModel.findByIdAndUpdate(
        event_id,
        {},
        { new: true }
      )

      if (!event) {
        return true
      }

      let media_partners = event.media_partners.map((_id) => _id.toString())

      let updatedUsers: any[] = []

      media_partners.forEach((_id: string) => {
        if (_id === media_partner_id) {
          return
        }
        updatedUsers.push(_id)
      })

      event.media_partners = updatedUsers as any

      // Delete event invite records
      await EventInvitationServices.deleteInvitesForUser({
        event_id: event_id,
        users: [
          {
            user_id: media_partner_id,
            user_type: CommonEnums.users.media_partner,
          },
        ],
      })

      await event.save()
    }

    let _promises: any[] = []

    events.forEach((event: any) => {
      _promises.push(
        removeUserFromEvents({
          event_id: event._id,
        })
      )
    })

    await Promise.all(_promises)

    return true
  }

  /**
   * Remove media partner from events
   */
  static removeMediaPartnerFromEvents = async ({
    media_partner_id,
    event_ids,
  }: {
    media_partner_id: string
    event_ids: string[]
  }) => {
    if (!event_ids?.length) return true

    const removeUserFromEvents = async ({ event_id }: { event_id: string }) => {
      const event = await EventsModel.findByIdAndUpdate(
        event_id,
        {},
        { new: true }
      )

      if (!event) {
        return true
      }

      let media_partners = event.media_partners.map((_id) => _id.toString())

      let updatedUsers: any[] = []

      media_partners.forEach((_id: string) => {
        if (_id === media_partner_id) {
          return
        }
        updatedUsers.push(_id)
      })

      event.media_partners = updatedUsers as any

      // Delete event invite records
      await EventInvitationServices.deleteInvitesForUser({
        event_id: event_id,
        users: [
          {
            user_id: media_partner_id,
            user_type: CommonEnums.users.media_partner,
          },
        ],
      })

      await event.save()
    }

    let _promises: any[] = []

    event_ids.forEach((_id: any) => {
      _promises.push(
        removeUserFromEvents({
          event_id: _id,
        })
      )
    })

    await Promise.all(_promises)

    return true
  }

  /**
   * Add event to delegates
   */
  static addEventToDelegates = async ({
    event_id,
    delegate_ids,
  }: {
    event_id: string
    delegate_ids: string[]
  }) => {
    if (!delegate_ids?.length) return

    const addEvent = async (user_id: any) => {
      const delegate = await DelegatesModel.findById(user_id);
      
      if(!delegate){
        throw new Error('Delegate not found');
      }
      


      if (!delegate) {
        return true
      }

      let events = delegate?.events.map((_id) => _id.toString())

      if (!events.includes(event_id)) {
        events.push(event_id)
      }

      delegate.events = events as any

      await delegate.save()
    }

    const promises: any[] = []

    delegate_ids.forEach((_id) => {
      promises.push(addEvent(_id))
    })

    await Promise.all(promises)

    return true
  }

  /**
   * Add event to exhibitors
   */
  static addEventToExhibitors = async ({
    event_id,
    exhibitor_ids,
  }: {
    event_id: string
    exhibitor_ids: string[]
  }) => {
    if (!exhibitor_ids?.length) return

    const addEvent = async (user_id: any) => {
      const delegate = await DelegatesModel.findById(user_id);
      
      if(!delegate){
        throw new Error('Delegate not found');
      }
      const user = await ExhibitorsModel.findOne(
        {email:delegate.email}
 
       )
     

      if (!user) {
        const currentDelegate = await DelegatesModel.findById(user_id).populate('company');
    
        if (!currentDelegate) {
            throw new Error('Delegate not found');
        }
       
      
        const exhibitorData = {
          exhibitor_name:currentDelegate.first_name,
            first_name: currentDelegate.first_name,
            last_name: currentDelegate.last_name,
            email: currentDelegate.email,
            phone: currentDelegate.phone,
            telephone:currentDelegate.telephone,
            description:currentDelegate.company?.description, 
            phone_country_code: currentDelegate.phone_country_code,
            city: currentDelegate.city,
            country: currentDelegate.country,
            zip: currentDelegate?.zip,
            address_line_1: currentDelegate?.address_line_1,
            address_line_2: currentDelegate?.address_line_2,
            password: currentDelegate?.password,
            is_phone_verified: currentDelegate.is_phone_verified,
            is_email_verified: currentDelegate?.is_email_verified,
            job_title: currentDelegate?.job_title,
            company: currentDelegate.company, 
            company_name: currentDelegate.company_name, 
            category: currentDelegate.category,
            category_name: currentDelegate.category_name,
            status: currentDelegate.status,
            user_type: 'exhibitor', 
            pa_name: currentDelegate.pa_name,
            pa_email: currentDelegate.pa_email,
            last_login: currentDelegate.last_login,
            is_online: currentDelegate.is_online,
            events:[...currentDelegate?.events, new ObjectId(event_id)],
            exhibitor_logo:currentDelegate.company?.company_logo,
            exhibitor_URL:currentDelegate.delegate_URL,
            event_invites:currentDelegate.event_invites
           
          
        };
    
        const newExhibitor = new ExhibitorsModel(exhibitorData);
        await newExhibitor.save();
        
        return true
      
    
    }
    

      let events = user?.events.map((_id) => _id.toString())

      if (!events.includes(event_id)) {
        events.push(event_id)
      }

      user.events = events as any

      await user.save()
    }

    const promises: any[] = []

    exhibitor_ids.forEach((_id) => {
      promises.push(addEvent(_id))
    })

    await Promise.all(promises)

    return true
  }

  /**
   * Add event to sponsors
   */
  static addEventToSponsors = async ({
    event_id,
    sponsor_ids,
  }: {
    event_id: string
    sponsor_ids: string[]
  }) => {
    if (!sponsor_ids?.length) return

    const addEvent = async (user_id: any) => {
      const delegate = await DelegatesModel.findById(user_id);
      if(!delegate){
        throw new Error('Delegate not found');
      }
   
      
      const user = await SponsorsModel.findOne(
        {email:delegate.email}
 
       )
      
       
        
    


      if (!user) {
        const currentDelegate = await DelegatesModel.findById(user_id).populate('company');
    
        if (!currentDelegate) {
            throw new Error('Delegate not found');
        }
        const sponsorsData = {
            sponsor_name: currentDelegate.first_name, 
            sponsor_logo:currentDelegate.avatar, 
            sponsor_description:currentDelegate.company?.description, 
            sponsor_URL:currentDelegate.delegate_URL, 
            representative_firstname:currentDelegate.first_name,
            representative_lastname:currentDelegate.last_name,
            sponsor_graphic:currentDelegate.avatar,
            email: currentDelegate.email,
            phone: currentDelegate.phone,
            phone_country_code: currentDelegate.phone_country_code,
            city: currentDelegate.city,
            country: currentDelegate.country,
            zip: currentDelegate.zip,
            address_line_1: currentDelegate.address_line_1,
            address_line_2: currentDelegate.address_line_2,
            password: currentDelegate.password,
            is_phone_verified: currentDelegate.is_phone_verified,
            is_email_verified: currentDelegate.is_email_verified,
            job_title: currentDelegate.job_title,
            company: currentDelegate.company, 
            company_name: currentDelegate.company_name, 
            category: currentDelegate.category,
            category_name: currentDelegate.category_name,
            status: currentDelegate.status,
            user_type: 'sponsor', 
            pa_name: currentDelegate.pa_name,
            pa_email: currentDelegate.pa_email,
            last_login: currentDelegate.last_login,
            is_online: currentDelegate.is_online,
            events:[...currentDelegate?.events, new ObjectId(event_id)],
            schedules:currentDelegate.schedules,
            event_invites:currentDelegate.event_invites,
        };
        const newSponser = new SponsorsModel(sponsorsData);
        await newSponser.save();
        return true
        
    }

      let events = user?.events.map((_id) => _id.toString())

      if (!events.includes(event_id)) {
        events.push(event_id)
      }

      user.events = events as any

      await user.save()
    }

    const promises: any[] = []
  
    sponsor_ids.forEach((_id) => {
      promises.push(addEvent(_id))
    })

    await Promise.all(promises)

    return true
  }

  /**
   * Add event to speakers
   */
  static addEventToSpeakers = async ({
    event_id,
    speaker_ids,
  }: {
    event_id: string
    speaker_ids: string[]
  }) => {
    if (!speaker_ids?.length) return
  
    const addEvent = async (user_id: any) => {
      const delegate = await DelegatesModel.findById(user_id);
      if(!delegate){
        throw new Error('Delegate not found');
      }
      const user = await SpeakersModel.findOne(
        {email:delegate.email}
 
       )

    
     
    
      if (!user) {
        const currentDelegate = await DelegatesModel.findById(user_id).populate('company');
    
        if (!currentDelegate) {
            throw new Error('Delegate not found');
        }
  
        const speakerData = {
            first_name: currentDelegate.first_name,
            last_name: currentDelegate.last_name,
            bio:currentDelegate.bio,
            avatar:currentDelegate.avatar,
            email: currentDelegate.email,
            phone: currentDelegate.phone,
            phone_country_code: currentDelegate.phone_country_code,
            city: currentDelegate.city,
            country: currentDelegate.country,
            zip: currentDelegate.zip,
            address_line_1: currentDelegate.address_line_1,
            address_line_2: currentDelegate.address_line_2,
            password: currentDelegate.password ,
            is_phone_verified: currentDelegate.is_phone_verified,
            is_email_verified: currentDelegate.is_email_verified,
            job_title: currentDelegate.job_title,
            company: currentDelegate.company, 
            company_name: currentDelegate.company_name, 
            category: currentDelegate.category,
            category_name: currentDelegate.category_name,
            status: currentDelegate.status,
            user_type: 'speaker', 
            pa_name: currentDelegate.pa_name,
            pa_email: currentDelegate.pa_email,
            last_login: currentDelegate.last_login,
            is_online: currentDelegate.is_online,
            speaker_URL:currentDelegate.delegate_URL,
            delegate_linkedin:currentDelegate.delegate_linkedin,
            events:[...currentDelegate?.events, new ObjectId(event_id)],
            schedules:currentDelegate.schedules,
            event_invites:currentDelegate.event_invites,
            telephone:currentDelegate.telephone
        };

        const newSpeaker = new SpeakersModel(speakerData);
        await newSpeaker.save();
        return true
        
    }
    

      let events = user?.events.map((_id) => _id.toString())

      if (!events.includes(event_id)) {
        events.push(event_id)
      }

      user.events = events as any

      await user.save()
    }

    const promises: any[] = []
    speaker_ids.forEach((_id) => {
      promises.push(addEvent(_id))
    })

    await Promise.all(promises)

    return true
  }

  /**
   * Add event to media partners
   */
  static addEventToMediaPartners = async ({
    event_id,
    media_partner_ids,
  }: {
    event_id: string
    media_partner_ids: string[]
  }) => {
    if (!media_partner_ids?.length) return

    const addEvent = async (user_id: any) => {
      const delegate = await DelegatesModel.findById(user_id);
      if(!delegate){
        throw new Error('Delegate not found');
      }
      const user = await MediaPartnersModel.findOne(
        {email:delegate.email}
 
       )

      if (!user) {
        const currentDelegate = await DelegatesModel.findById(user_id).populate('company');
    
        if (!currentDelegate) {
            throw new Error('Delegate not found');
        }
    
      
        const mediaPartnersData = {
            first_name: currentDelegate.first_name,
            last_name: currentDelegate.last_name,
            description:currentDelegate.company?.description,
            logo:currentDelegate.avatar,  //
            mediapartner_URL:currentDelegate.delegate_URL,
            email: currentDelegate.email,
            phone: currentDelegate.phone,
            phone_country_code: currentDelegate.phone_country_code,
            city: currentDelegate.city,
            country: currentDelegate.country,
            zip: currentDelegate.zip,
            address_line_1: currentDelegate.address_line_1,
            address_line_2: currentDelegate.address_line_2,
            password: currentDelegate.password,
            is_phone_verified: currentDelegate.is_phone_verified,
            is_email_verified: currentDelegate.is_email_verified,
            job_title: currentDelegate.job_title,
            company: currentDelegate.company, 
            company_name: currentDelegate.company_name, 
            category: currentDelegate.category,
            category_name: currentDelegate.category_name,
            status: currentDelegate.status,
            user_type: 'media_partners', 
            pa_name: currentDelegate.pa_name,
            pa_email: currentDelegate.pa_email,
            last_login: currentDelegate.last_login,
            is_online: currentDelegate.is_online,
            speaker_URL:currentDelegate.delegate_URL,
            delegate_linkedin:currentDelegate.delegate_linkedin,
            events:[...currentDelegate?.events, new ObjectId(event_id)],
            schedules:currentDelegate.schedules,
            event_invites:currentDelegate.event_invites,
            telephone:currentDelegate.telephone
         
        };
  
        const newMediaPartner = new MediaPartnersModel(mediaPartnersData);
        await newMediaPartner.save();
        return true
        
    }

      let events = user?.events.map((_id) => _id.toString())

      if (!events.includes(event_id)) {
        events.push(event_id)
      }

      user.events = events as any

      await user.save()
    }

    const promises: any[] = []

    media_partner_ids.forEach((_id) => {
      promises.push(addEvent(_id))
    })

    await Promise.all(promises)

    return true
  }

  /**
   * Remove event from delegates
   */
  static removeEventFromDelegates = async ({
    event_id,
    delegate_ids,
  }: {
    event_id: string
    delegate_ids: string[]
  }) => {
    if (!delegate_ids?.length) return

    const removeEventFromUser = async (user_id: any) => {
      const user = await DelegatesModel.findByIdAndUpdate(
        user_id,
        {},
        { new: true }
      )

      if (!user) {
        return true
      }

      let events = user?.events.map((_id) => _id.toString())

      let updatedEvents: any[] = []

      events.forEach((_id: string) => {
        if (_id === event_id) {
          return
        }
        updatedEvents.push(_id)
      })

      user.events = updatedEvents as any

      await user.save()
    }

    let _promises: any[] = []

    delegate_ids.forEach((_id: any) => {
      _promises.push(removeEventFromUser(_id))
    })

    await Promise.all(_promises)
  }

  /**
   * Remove event from exhibitors
   */
  static removeEventFromExhibitors = async ({
    event_id,
    exhibitor_ids,
  }: {
    event_id: string
    exhibitor_ids: string[]
  }) => {
    if (!exhibitor_ids?.length) return

    const removeEventFromUser = async (user_id: any) => {
      const user = await ExhibitorsModel.findByIdAndUpdate(
        user_id,
        {},
        { new: true }
      )

      if (!user) {
        return true
      }

      let events = user?.events.map((_id) => _id.toString())

      let updatedEvents: any[] = []

      events.forEach((_id: string) => {
        if (_id === event_id) {
          return
        }
        updatedEvents.push(_id)
      })

      user.events = updatedEvents as any

      await user.save()
    }

    let _promises: any[] = []

    exhibitor_ids.forEach((_id: any) => {
      _promises.push(removeEventFromUser(_id))
    })

    await Promise.all(_promises)
  }

  /**
   * Remove event from sponsors
   */
  static removeEventFromSponsors = async ({
    event_id,
    sponsor_ids,
  }: {
    event_id: string
    sponsor_ids: string[]
  }) => {
    if (!sponsor_ids?.length) return

    const removeEventFromUser = async (user_id: any) => {
      const user = await SponsorsModel.findByIdAndUpdate(
        user_id,
        {},
        { new: true }
      )

      if (!user) {
        return true
      }

      let events = user?.events.map((_id) => _id.toString())

      let updatedEvents: any[] = []

      events.forEach((_id: string) => {
        if (_id === event_id) {
          return
        }
        updatedEvents.push(_id)
      })

      user.events = updatedEvents as any

      await user.save()
    }

    let _promises: any[] = []

    sponsor_ids.forEach((_id: any) => {
      _promises.push(removeEventFromUser(_id))
    })

    await Promise.all(_promises)
  }

  /**
   * Remove event from speakers
   */
  static removeEventFromSpeakers = async ({
    event_id,
    speaker_ids,
  }: {
    event_id: string
    speaker_ids: string[]
  }) => {
    if (!speaker_ids?.length) return

    const removeEventFromUser = async (user_id: any) => {
      const user = await SpeakersModel.findByIdAndUpdate(
        user_id,
        {},
        { new: true }
      )

      if (!user) {
        return true
      }

      let events = user?.events.map((_id) => _id.toString())

      let updatedEvents: any[] = []

      events.forEach((_id: string) => {
        if (_id === event_id) {
          return
        }
        updatedEvents.push(_id)
      })

      user.events = updatedEvents as any

      await user.save()
    }

    let _promises: any[] = []

    speaker_ids.forEach((_id: any) => {
      _promises.push(removeEventFromUser(_id))
    })

    await Promise.all(_promises)
  }

  /**
   * Remove event from media partners
   */
  static removeEventFromMediaPartners = async ({
    event_id,
    media_partners_ids,
  }: {
    event_id: string
    media_partners_ids: string[]
  }) => {
    if (!media_partners_ids?.length) return

    const removeEventFromUser = async (user_id: any) => {
      const user = await MediaPartnersModel.findByIdAndUpdate(
        user_id,
        {},
        { new: true }
      )

      if (!user) {
        return true
      }

      let events = user?.events.map((_id) => _id.toString())

      let updatedEvents: any[] = []

      events.forEach((_id: string) => {
        if (_id === event_id) {
          return
        }
        updatedEvents.push(_id)
      })

      user.events = updatedEvents as any

      await user.save()
    }

    let _promises: any[] = []

    media_partners_ids.forEach((_id: any) => {
      _promises.push(removeEventFromUser(_id))
    })

    await Promise.all(_promises)
  }

  /**
   * Add hotel to events
   */
  static addHotelToEvents = async ({
    hotel_id,
    event_ids = [],
  }: {
    hotel_id: string
    event_ids: string[]
  }) => {
    if (!hotel_id) {
      return true
    }

    const addHotelToEvent = async (event_id: any) => {
      const event = await EventsModel.findByIdAndUpdate(
        event_id,
        {},
        { new: true }
      )

      if (!event) {
        return true
      }

      let hotels = event.hotels.map((_id) => _id.toString())

      if (!hotels.includes(hotel_id)) {
        hotels.push(hotel_id)
      }

      event.hotels = hotels as any

      await event.save()
    }

    const _promises: any[] = []

    event_ids.forEach((_event) => {
      _promises.push(addHotelToEvent(_event))
    })

    await Promise.all(_promises)

    return true
  }

  /**
   * Add hotels to event
   */
  static addHotelsToEvent = async ({
    hotel_ids,
    event_id,
  }: {
    hotel_ids: string[]
    event_id: string
  }) => {
    if (!hotel_ids.length || !event_id) {
      return true
    }
    const event = await EventsModel.findByIdAndUpdate(
      event_id,
      {},
      { new: true }
    )

    if (!event) {
      return true
    }

    let hotels = event.hotels.map((_id) => _id.toString())

    hotel_ids.forEach((hotel_id) => {
      if (!hotels.includes(hotel_id)) {
        hotels.push(hotel_id)
      }
    })

    event.hotels = hotels as any

    await event.save()

    return true
  }

  /**
   * Remove hotel from event
   */
  static removeHotelFromEvent = async ({
    hotel_id,
    event_id,
  }: {
    hotel_id: string
    event_id: string
  }) => {
    try {
      if (!event_id) return true

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

      return true
    } catch (err) {
      return false
    }
  }

  static getEventLogo = (params: { event: IEventsModelSchema }) => {
    let logoUrl = ''

    if (params?.event?.event_logo) {
      logoUrl = UrlHelpers.getImageUrl({
        image_url: params?.event?.event_logo,
      })
    } else {
      logoUrl = UrlHelpers.getLogoUrl()
    }

    return logoUrl
  }
}
