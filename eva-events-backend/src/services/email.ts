import { EmailTemplateUtils } from '../email/templates'
import { CommonEnums } from '../enums/common.enums'
import { UrlHelpers } from '../helpers/common'
import { EmailJobsHelpers } from '../helpers/jobs.helpers'
import EventsModel, { IEventsModelSchema } from '../models/events.model'
import dotenv from 'dotenv'
import moment from 'moment'
import { IUser, UserServices } from './users.services'
import { IMeetingRequestsModelSchema } from '../models/meeting-requests.model'
import { cloneDeep } from 'lodash'
import { CommonUtils } from '../utils/common.utils'
import { APIError } from '../middlewares/errorHandler.middleware'
import { HttpStatusCode } from 'axios'
import ResponseCodes from '../utils/responseCodes'
import { EventServices } from './event.services'
import CompaniesModel from '../models/companies.model'
import { EnvVariables } from '../enums/env.variables.enums'
import EventLocationsModel from '../models/event-locations.model'
import { EmailTemplateServices } from './email-template.services'

let nodemailer = require('nodemailer')

dotenv.config({ path: `.env.${process.env.NODE_ENV}` })

export class EmailService {
  static transporter = nodemailer.createTransport({
    host: 'smtpout.secureserver.net',
    secure: true,
    secureConnection: false, // TLS requires secureConnection to be false
    tls: {
      ciphers: 'SSLv3',
    },
    requireTLS: true,
    port: 465,
    debug: true,
    auth: {
      user: 'no-reply@mylo.global',
      pass: 'meganalphamegan9',
    },
  })
  // static transporter = nodemailer.createTransport({
  //   service: "gmail",
  //   auth: {
  //     user: "test@hikomore.com",
  //     pass: "gxauprbdvwldqjkf",
  //   },
  // });

  static sendAdminRegistrationEmail = async ({
    first_name,
    last_name,
    password,
    email,
  }: {
    first_name: string
    last_name: string
    password: string
    email: string
  }) => {
    let userName = 'User'

    if (first_name) userName = first_name
    if (last_name) {
      if (first_name) userName = `${first_name} ${last_name}`
      else userName = last_name
    }
    let mailContent = `</b>${EmailTemplateUtils.renderText({
      text: 'Welcome to eva events management system.',
    })} </br>${EmailTemplateUtils.renderText({
      text: `You are now registered as an admin on the system by one of our admins. Please find your login credentials below and follow the link to login to the admin dashboard.`,
    })}</br>${EmailTemplateUtils.renderText({
      text: `<p style="font-size:15px; margin: 0px;margin-bottom: 5px;">
      Your Login credentials 
      <p style="font-size:15px; margin: 0px;">Email: ${email} </br></p>
      <p style="font-size:15px; margin: 0px;">Password: ${password}</br></p>
      </p>
      `,
    })}${EmailTemplateUtils.renderLinkButton({
      buttonText: 'Login to Dashboard',
      link: UrlHelpers.getAdminWebUrl() as string,
    })}</br>${EmailTemplateUtils.renderText({
      text: 'Best Regards,',
    })}${EmailTemplateUtils.renderText({
      text: 'Team, Eva Events.',
    })}`

    const res = await EmailJobsHelpers.createNewJob({
      greeting: `Hello <strong>${userName}</strong>`,
      mail_content: mailContent,
      subject: 'Welcome to Eva Events - Registration confirmation',
      to: email,
    })

    return res
  }

  static sendExhibitorRegistrationEmail = async ({
    first_name,
    last_name,
    email,
    password,
  }: {
    first_name: string
    last_name: string
    email: string
    password: string
  }) => {
    return

    let userName = 'User'

    if (first_name) userName = first_name
    if (last_name) {
      if (first_name) userName = `${first_name} ${last_name}`
      else userName = last_name
    }

    let mailContent = `</b>${EmailTemplateUtils.renderText({
      text: 'Welcome to eva events management system.',
    })} </br>${EmailTemplateUtils.renderText({
      text: 'You are now registered with us as exhibitor. We will keep notifying you when you are invited for new events and activities',
    })}${EmailTemplateUtils.renderText({
      text: 'We are sending you the login credentials with this mail for the events pages, please find the credentials below and login to events pages.',
    })}</br>${EmailTemplateUtils.renderText({
      text: `<p style="margin: 0px;margin-bottom: 5px;">
      Your Login credentials 
      <p style="margin: 0px;">Email: ${email} </br></p>
      <p style="margin: 0px;">Password: ${password}</br></p>
      </p>
      `,
    })}${EmailTemplateUtils.renderLinkButton({
      buttonText: 'Login Now',
      link: UrlHelpers.getWebUrl() as string,
    })}</br>${EmailTemplateUtils.renderText({
      text: 'Best Regards,',
    })}${EmailTemplateUtils.renderText({
      text: 'Team, Eva Events.',
    })}`

    const res = await EmailJobsHelpers.createNewJob({
      greeting: `Hello <strong>${userName}</strong>`,
      mail_content: mailContent,
      subject: 'Welcome to Eva Events',
      to: email,
    })

    return res
  }

  static sendSponsorRegistrationEmail = async ({
    name,
    password,
    email,
  }: {
    name: string
    password: string
    email: string
  }) => {
    return

    let userName = 'Sponsor'

    if (name) userName = name
    let mailContent = `</b>${EmailTemplateUtils.renderText({
      text: 'Welcome to eva events.',
    })} </br>${EmailTemplateUtils.renderText({
      text: 'You are now registered with us as sponsor. We will keep notifying you when you are invited for new events and activities.',
    })}${EmailTemplateUtils.renderText({
      text: 'We are sending you the login credentials with this mail for the events pages, please find the credentials below and login to events pages.',
    })}</br>${EmailTemplateUtils.renderText({
      text: `<p style="margin: 0px;margin-bottom: 5px;">
      Your Login credentials 
      <p style="margin: 0px;">Email: ${email} </br></p>
      <p style="margin: 0px;">Password: ${password}</br></p>
      </p>
      `,
    })}${EmailTemplateUtils.renderLinkButton({
      buttonText: 'Login Now',
      link: UrlHelpers.getWebUrl() as string,
    })}</br>${EmailTemplateUtils.renderText({
      text: 'Best Regards,',
    })}${EmailTemplateUtils.renderText({
      text: 'Team, Eva Events.',
    })}`

    const res = await EmailJobsHelpers.createNewJob({
      greeting: `Hello <strong>${userName}</strong>`,
      mail_content: mailContent,
      subject: 'Welcome to Eva Events - Sponsor confirmation',
      to: email,
    })

    return res
  }

  static sendDelegateRegistrationEmail = async ({
    first_name,
    last_name,
    email,
    password,
  }: {
    first_name: string
    last_name: string
    email: string
    password: string
  }) => {
    return

    let userName = 'User'

    if (first_name) userName = first_name
    if (last_name) {
      if (first_name) userName = `${first_name} ${last_name}`
      else userName = last_name
    }

    let mailContent = `</b>${EmailTemplateUtils.renderText({
      text: 'Welcome to eva events management system.',
    })} </br>${EmailTemplateUtils.renderText({
      text: 'You are now registered with us as delegate. We will keep notifying you when you are invited for new events and activities',
    })}${EmailTemplateUtils.renderText({
      text: 'We are sending you the login credentials with this mail for the events pages, please find the credentials below and login to events pages.',
    })}</br>${EmailTemplateUtils.renderText({
      text: `<p style="margin: 0px;margin-bottom: 5px;">
      Your Login credentials 
      <p style="margin: 0px;">Email: ${email} </br></p>
      <p style="margin: 0px;">Password: ${password}</br></p>
      </p>
      `,
    })}${EmailTemplateUtils.renderLinkButton({
      buttonText: 'Login Now',
      link: UrlHelpers.getWebUrl() as string,
    })}</br>${EmailTemplateUtils.renderText({
      text: 'Best Regards,',
    })}${EmailTemplateUtils.renderText({
      text: 'Team, Eva Events.',
    })}`

    const res = await EmailJobsHelpers.createNewJob({
      greeting: `Hello <strong>${userName}</strong>`,
      mail_content: mailContent,
      subject: 'Welcome to Eva Events',
      to: email,
    })

    return res
  }

  static sendSpeakerRegistrationEmail = async ({
    first_name,
    last_name,
    email,
    password,
  }: {
    first_name: string
    last_name: string
    email: string
    password: string
  }) => {
    return

    let userName = 'User'

    if (first_name) userName = first_name
    if (last_name) {
      if (first_name) userName = `${first_name} ${last_name}`
      else userName = last_name
    }

    let mailContent = `</b>${EmailTemplateUtils.renderText({
      text: 'Welcome to eva events management system.',
    })} </br>${EmailTemplateUtils.renderText({
      text: 'You are now registered with us as speaker. We will keep notifying you when you are invited for new events and activities',
    })}${EmailTemplateUtils.renderText({
      text: 'We are sending you the login credentials with this mail for the events pages, please find the credentials below and login to events pages.',
    })}</br>${EmailTemplateUtils.renderText({
      text: `<p style="margin: 0px;margin-bottom: 5px;">
      Your Login credentials 
      <p style="margin: 0px;">Email: ${email} </br></p>
      <p style="margin: 0px;">Password: ${password}</br></p>
      </p>
      `,
    })}${EmailTemplateUtils.renderLinkButton({
      buttonText: 'Login Now',
      link: UrlHelpers.getWebUrl() as string,
    })}</br>${EmailTemplateUtils.renderText({
      text: 'Best Regards,',
    })}${EmailTemplateUtils.renderText({
      text: 'Team, Eva Events.',
    })}`

    const res = await EmailJobsHelpers.createNewJob({
      greeting: `Hello <strong>${userName}</strong>`,
      mail_content: mailContent,
      subject: 'Welcome to Eva Events',
      to: email,
    })

    return res
  }

  static sendMediaPartnerRegistrationEmail = async ({
    first_name,
    last_name,
    email,
    password,
  }: {
    first_name: string
    last_name: string
    email: string
    password: string
  }) => {
    return

    let userName = 'User'

    if (first_name) userName = first_name
    if (last_name) {
      if (first_name) userName = `${first_name} ${last_name}`
      else userName = last_name
    }

    let mailContent = `</b>${EmailTemplateUtils.renderText({
      text: 'Welcome to eva events management system.',
    })} </br>${EmailTemplateUtils.renderText({
      text: 'You are now registered with us as media partner. We will keep notifying you when you are invited for new events and activities',
    })}${EmailTemplateUtils.renderText({
      text: 'We are sending you the login credentials with this mail for the events pages, please find the credentials below and login to events pages.',
    })}</br>${EmailTemplateUtils.renderText({
      text: `<p style="margin: 0px;margin-bottom: 5px;">
      Your Login credentials 
      <p style="margin: 0px;">Email: ${email} </br></p>
      <p style="margin: 0px;">Password: ${password}</br></p>
      </p>
      `,
    })}${EmailTemplateUtils.renderLinkButton({
      buttonText: 'Login Now',
      link: UrlHelpers.getWebUrl() as string,
    })}</br>${EmailTemplateUtils.renderText({
      text: 'Best Regards,',
    })}${EmailTemplateUtils.renderText({
      text: 'Team, Eva Events.',
    })}`

    const res = await EmailJobsHelpers.createNewJob({
      greeting: `Hello <strong>${userName}</strong>`,
      mail_content: mailContent,
      subject: 'Welcome to Eva Events',
      to: email,
    })

    return res
  }

  static sendEventInviteToDelegate = async ({
    first_name,
    last_name,
    email,
    password,
    event,
  }: {
    first_name: string
    last_name: string
    email: string
    password: string
    event: IEventsModelSchema
  }) => {
    let userName = 'User'

    if (first_name) userName = first_name
    if (last_name) {
      if (first_name) userName = `${first_name} ${last_name}`
      else userName = last_name
    }

    const eventDate = moment(new Date(event.event_date)).format('LLL')

    const eventAddress = `${event.venue_city}, ${event.venue_country}`

    let mailContent = `</b>${EmailTemplateUtils.renderText({
      text: 'Welcome to eva events management system.',
    })} </br>${EmailTemplateUtils.renderText({
      text: `You are invited to ${event.name}, ${eventDate}, taking place at the ${eventAddress}.`,
    })}${EmailTemplateUtils.renderText({
      text: 'The anticipation is now over! The launch of the personal page is here.',
    })}${EmailTemplateUtils.renderText({
      text: 'Via your personal page, you can request and accept one-to-one meetings with other delegates, view the most recent delegate list and reserve your place at the networking events, conference sessions and product demonstrations.',
    })}${EmailTemplateUtils.renderText({
      text: 'Once a meeting request has been accepted, we take care of all the scheduling for you as your personal account mangers by allocating a time and location for the meeting.',
    })}${EmailTemplateUtils.renderText({
      text: 'We will send out a preliminary schedule two weeks prior to the start of the conference and a final schedule will be sent to you just before the event.',
    })}</br>${EmailTemplateUtils.renderText({
      text: 'Your personal page is:',
    })}${EmailTemplateUtils.renderText({
      text: `<p style="margin: 0px;margin-bottom: 5px;">
      <p><a>PERSONAL_PAGE_LINK_HERE</a></p> 
      <p style="margin: 0px;">Username: ${email} </br></p>
      <p style="margin: 0px;">Password: ${password}</br></p>
      </p>
      `,
    })}</br>${EmailTemplateUtils.renderText({
      text: 'Best Regards,',
    })}${EmailTemplateUtils.renderText({
      text: 'Team, Eva Events.',
    })}`

    const res = await EmailJobsHelpers.createNewJob({
      greeting: `Dear <strong>${userName}</strong>`,
      mail_content: mailContent,
      subject: `Now released! Your Personal page for the ${event.name}, ${eventDate}, ${eventAddress}`,
      to: email,
    })

    return res
  }

  static sendEventInviteToExhibitor = async ({
    first_name,
    last_name,
    email,
    password,
    event,
  }: {
    first_name: string
    last_name: string
    email: string
    password: string
    event: IEventsModelSchema
  }) => {
    let userName = 'User'

    if (first_name) userName = first_name
    if (last_name) {
      if (first_name) userName = `${first_name} ${last_name}`
      else userName = last_name
    }

    const eventDate = moment(new Date(event.event_date)).format('LLL')

    const eventAddress = `${event.venue_city}, ${event.venue_country}`

    let mailContent = `</b>${EmailTemplateUtils.renderText({
      text: 'Welcome to eva events management system.',
    })} </br>${EmailTemplateUtils.renderText({
      text: `You are invited to ${event.name}, ${eventDate}, taking place at the ${eventAddress}.`,
    })}${EmailTemplateUtils.renderText({
      text: 'The anticipation is now over! The launch of the personal page is here.',
    })}${EmailTemplateUtils.renderText({
      text: 'Via your personal page, you can request and accept one-to-one meetings with other exhibitors, view the most recent exhibitor list and reserve your place at the networking events, conference sessions and product demonstrations.',
    })}${EmailTemplateUtils.renderText({
      text: 'Once a meeting request has been accepted, we take care of all the scheduling for you as your personal account mangers by allocating a time and location for the meeting.',
    })}${EmailTemplateUtils.renderText({
      text: 'We will send out a preliminary schedule two weeks prior to the start of the conference and a final schedule will be sent to you just before the event.',
    })}</br>${EmailTemplateUtils.renderText({
      text: 'Your personal page is:',
    })}${EmailTemplateUtils.renderText({
      text: `<p style="margin: 0px;margin-bottom: 5px;">
      <p><a>PERSONAL_PAGE_LINK_HERE</a></p> 
      <p style="margin: 0px;">Username: ${email} </br></p>
      <p style="margin: 0px;">Password: ${password}</br></p>
      </p>
      `,
    })}</br>${EmailTemplateUtils.renderText({
      text: 'Best Regards,',
    })}${EmailTemplateUtils.renderText({
      text: 'Team, Eva Events.',
    })}`

    const res = await EmailJobsHelpers.createNewJob({
      greeting: `Dear <strong>${userName}</strong>`,
      mail_content: mailContent,
      subject: `Now released! Your Personal page for the ${event.name}, ${eventDate}, ${eventAddress}`,
      to: email,
    })

    return res
  }

  static sendEventInviteToSpeaker = async ({
    first_name,
    last_name,
    email,
    password,
    event,
  }: {
    first_name: string
    last_name: string
    email: string
    password: string
    event: IEventsModelSchema
  }) => {
    let userName = 'User'

    if (first_name) userName = first_name
    if (last_name) {
      if (first_name) userName = `${first_name} ${last_name}`
      else userName = last_name
    }

    const eventDate = moment(new Date(event.event_date)).format('LLL')

    const eventAddress = `${event.venue_city}, ${event.venue_country}`

    let mailContent = `</b>${EmailTemplateUtils.renderText({
      text: 'Welcome to eva events management system.',
    })} </br>${EmailTemplateUtils.renderText({
      text: `You are invited to ${event.name}, ${eventDate}, taking place at the ${eventAddress}.`,
    })}${EmailTemplateUtils.renderText({
      text: 'The anticipation is now over! The launch of the personal page is here.',
    })}${EmailTemplateUtils.renderText({
      text: 'Via your personal page, you can request and accept one-to-one meetings with other speakers, view the most recent speakers list and reserve your place at the networking events, conference sessions and product demonstrations.',
    })}${EmailTemplateUtils.renderText({
      text: 'Once a meeting request has been accepted, we take care of all the scheduling for you as your personal account mangers by allocating a time and location for the meeting.',
    })}${EmailTemplateUtils.renderText({
      text: 'We will send out a preliminary schedule two weeks prior to the start of the conference and a final schedule will be sent to you just before the event.',
    })}</br>${EmailTemplateUtils.renderText({
      text: 'Your personal page is:',
    })}${EmailTemplateUtils.renderText({
      text: `<p style="margin: 0px;margin-bottom: 5px;">
      <p><a>PERSONAL_PAGE_LINK_HERE</a></p> 
      <p style="margin: 0px;">Username: ${email} </br></p>
      <p style="margin: 0px;">Password: ${password}</br></p>
      </p>
      `,
    })}</br>${EmailTemplateUtils.renderText({
      text: 'Best Regards,',
    })}${EmailTemplateUtils.renderText({
      text: 'Team, Eva Events.',
    })}`

    const res = await EmailJobsHelpers.createNewJob({
      greeting: `Dear <strong>${userName}</strong>`,
      mail_content: mailContent,
      subject: `Now released! Your Personal page for the ${event.name}, ${eventDate}, ${eventAddress}`,
      to: email,
    })

    return res
  }

  static sendEventInviteToMediaPartner = async ({
    first_name,
    last_name,
    email,
    password,
    event,
  }: {
    first_name: string
    last_name: string
    email: string
    password: string
    event: IEventsModelSchema
  }) => {
    let userName = 'User'

    if (first_name) userName = first_name
    if (last_name) {
      if (first_name) userName = `${first_name} ${last_name}`
      else userName = last_name
    }

    const eventDate = moment(new Date(event.event_date)).format('LLL')

    const eventAddress = `${event.venue_city}, ${event.venue_country}`

    let mailContent = `</b>${EmailTemplateUtils.renderText({
      text: 'Welcome to eva events management system.',
    })} </br>${EmailTemplateUtils.renderText({
      text: `You are invited to ${event.name}, ${eventDate}, taking place at the ${eventAddress}.`,
    })}${EmailTemplateUtils.renderText({
      text: 'The anticipation is now over! The launch of the personal page is here.',
    })}${EmailTemplateUtils.renderText({
      text: 'Via your personal page, you can request and accept one-to-one meetings with other media partner, view the most recent media media partners list and reserve your place at the networking events, conference sessions and product demonstrations.',
    })}${EmailTemplateUtils.renderText({
      text: 'Once a meeting request has been accepted, we take care of all the scheduling for you as your personal account mangers by allocating a time and location for the meeting.',
    })}${EmailTemplateUtils.renderText({
      text: 'We will send out a preliminary schedule two weeks prior to the start of the conference and a final schedule will be sent to you just before the event.',
    })}</br>${EmailTemplateUtils.renderText({
      text: 'Your personal page is:',
    })}${EmailTemplateUtils.renderText({
      text: `<p style="margin: 0px;margin-bottom: 5px;">
      <p><a>PERSONAL_PAGE_LINK_HERE</a></p> 
      <p style="margin: 0px;">Username: ${email} </br></p>
      <p style="margin: 0px;">Password: ${password}</br></p>
      </p>
      `,
    })}</br>${EmailTemplateUtils.renderText({
      text: 'Best Regards,',
    })}${EmailTemplateUtils.renderText({
      text: 'Team, Eva Events.',
    })}`

    const res = await EmailJobsHelpers.createNewJob({
      greeting: `Dear <strong>${userName}</strong>`,
      mail_content: mailContent,
      subject: `Now released! Your Personal page for the ${event.name}, ${eventDate}, ${eventAddress}`,
      to: email,
    })

    return res
  }

  static sendEventInviteToSponsor = async ({
    name,
    email,
    password,
    event,
  }: {
    name: string
    email: string
    password: string
    event: IEventsModelSchema
  }) => {
    let userName = 'Sponsor'

    if (name) userName = name

    const eventDate = moment(new Date(event.event_date)).format('LLL')

    const eventAddress = `${event.venue_city}, ${event.venue_country}`

    let mailContent = `</b>${EmailTemplateUtils.renderText({
      text: 'Welcome to eva events management system.',
    })} </br>${EmailTemplateUtils.renderText({
      text: `You are invited to ${event.name}, ${eventDate}, taking place at the ${eventAddress}.`,
    })}${EmailTemplateUtils.renderText({
      text: 'The anticipation is now over! The launch of the personal page is here.',
    })}${EmailTemplateUtils.renderText({
      text: 'Via your personal page, you can request and accept one-to-one meetings with other sponsors, view the most recent sponsor list and reserve your place at the networking events, conference sessions and product demonstrations.',
    })}${EmailTemplateUtils.renderText({
      text: 'Once a meeting request has been accepted, we take care of all the scheduling for you as your personal account mangers by allocating a time and location for the meeting.',
    })}${EmailTemplateUtils.renderText({
      text: 'We will send out a preliminary schedule two weeks prior to the start of the conference and a final schedule will be sent to you just before the event.',
    })}</br>${EmailTemplateUtils.renderText({
      text: 'Your personal page is:',
    })}${EmailTemplateUtils.renderText({
      text: `<p style="margin: 0px;margin-bottom: 5px;">
      <p><a>PERSONAL_PAGE_LINK_HERE</a></p> 
      <p style="margin: 0px;">Username: ${email} </br></p>
      <p style="margin: 0px;">Password: ${password}</br></p>
      </p>
      `,
    })}</br>${EmailTemplateUtils.renderText({
      text: 'Best Regards,',
    })}${EmailTemplateUtils.renderText({
      text: 'Team, Eva Events.',
    })}`

    const res = await EmailJobsHelpers.createNewJob({
      greeting: `Dear <strong>${userName}</strong>`,
      mail_content: mailContent,
      subject: `Now released! Your Personal page for the ${event.name}, ${eventDate}, ${eventAddress}`,
      to: email,
    })

    return res
  }

  static sendMeetingRequestEmail = async ({
    requestor_user,
    event_id,
    requested_user_id,
    meeting_details,
  }: {
    requestor_user: IUser
    event_id: string
    requested_user_id: string
    meeting_details: IMeetingRequestsModelSchema
  }) => {
    const [eventDetails, recipientUser] = await Promise.all([
      EventsModel.findById(event_id),
      UserServices.getUserById({
        user_id: requested_user_id,
      }),
    ])

    if (!recipientUser) {
      throw new APIError({
        message: 'Meeting request failed. User not found.',
        status: HttpStatusCode.InternalServerError,
        code: ResponseCodes.USER_NOT_FOUND,
      })
    }

    if (!eventDetails) {
      throw new APIError({
        message: 'Meeting request failed. Event details not found.',
        status: HttpStatusCode.InternalServerError,
        code: ResponseCodes.USER_NOT_FOUND,
      })
    }

    let username = ''
    let companyName = requestor_user?.company?.company_name ?? ''
    const userType = requestor_user?.user_type

    // http://localhost:3000/event/65c358a0521dc5a4c4bb3e59/1-1-meetings/request-accept-meetings?requested=others

    const dashboardLoginLink = `${UrlHelpers.getWebUrl()}/event/${event_id}/1-1-meetings/request-accept-meetings?requested=others`

    // TODO: Need to work on the company part as well

    if (userType === CommonEnums.users.sponsor) {
      username = requestor_user.sponsor_name
    } else {
      if (requestor_user?.first_name) username = requestor_user.first_name

      if (requestor_user?.last_name)
        if (requestor_user?.first_name)
          username = username + ' ' + requestor_user.last_name
        else username = requestor_user.last_name
    }

    if (!username) username = 'User'

    const meetingDate = moment(new Date(meeting_details.meeting_date))
      .utc()
      .format('dddd Do MMMM YYYY')
    let startTime = moment(new Date(meeting_details.meeting_start_time))
      .utc()
      .format('HH:mm')
    let endTime = moment(new Date(meeting_details.meeting_end_time))
      .utc()
      .format('HH:mm')

    let timeDiff = ''
    //console.log("meeting_details");
    // console.log(meeting_details);

    if (eventDetails?.time_zone && eventDetails?.time_zone_value) {
      startTime = moment(new Date(meeting_details.meeting_start_time)).tz(eventDetails?.time_zone_value).format(
        'hh:mm A'
      )
      endTime = moment(new Date(meeting_details.meeting_end_time)).tz(eventDetails?.time_zone_value).format(
        'hh:mm A'
      )
    }

    let hourDiff = moment(new Date(meeting_details.meeting_end_time)).diff(
      moment(new Date(meeting_details.meeting_start_time)),
      'hour'
    )
    let minDiff = moment(new Date(meeting_details.meeting_end_time)).diff(
      moment(new Date(meeting_details.meeting_start_time)),
      'minute'
    )

    timeDiff = `${hourDiff} hr`

    if (hourDiff === 0) {
      timeDiff = `${minDiff} min`
    } else {
      const restMin = minDiff - hourDiff * 60

      if (restMin > 0) {
        timeDiff = `${hourDiff} hr ${restMin} min`
      }
    }

    const meetingTimeString = `${startTime} - ${endTime} (${timeDiff}) (${
      eventDetails?.time_zone ?? ''
    })`
    //console.log("meetingTimeString" , meetingTimeString );

    const eventLogo = EventServices.getEventLogo({
      event: eventDetails,
    })

    const featuredImage = UrlHelpers.getImageUrl({
      image_url: eventDetails?.featured_image,
    })
    var meetingLocation = ''
    if (meeting_details?.meeting_location) {
      var meetingLocationInfo = await EventLocationsModel.findById(
        meeting_details?.meeting_location
      )
      if (meetingLocationInfo?.location_name) {
        meetingLocation = meetingLocationInfo?.location_name
      }
    }
    const res = await EmailJobsHelpers.createNewJob({
      subject: `Eva Events - You received new Meeting Request!`,
      to: recipientUser?.email,
      type: CommonEnums.emailTypes.meetingRequest,
      metadata: {
        meeting_event_title: eventDetails?.name ?? '',
        meeting_location: meetingLocation ?? '-',
        event_poster_url: featuredImage ?? '',
        meeting_requestor_user_name: username,
        meeting_requestor_company_name: companyName,
        meeting_date: meetingDate,
        meeting_time: meetingTimeString,
        meeting_notes: meeting_details?.meeting_notes ?? '',
        accept_meeting_link: `${UrlHelpers.getWebUrl()}/accept-meeting/${
          meeting_details._id
        }?event_id=${event_id}&requested_to=${recipientUser?._id?.toString()}`,
        decline_meeting_link: `${UrlHelpers.getWebUrl()}/decline-meeting/${
          meeting_details._id
        }?event_id=${event_id}&requested_to=${recipientUser?._id?.toString()}`,
        reschedule_meeting_link: `${UrlHelpers.getWebUrl()}/reschedule-meeting/${
          meeting_details._id
        }?event_id=${event_id}`,
        event_login_link: dashboardLoginLink,
        event_logo: eventLogo,
      },
    })

    return res
  }

  static sendMeetingRequestAcceptedEmail = async ({
    event_id,
    meeting_details,
    meeting_users,
    email,
  }: {
    event_id: string
    meeting_details: IMeetingRequestsModelSchema
    meeting_users: any[]
    email: string
  }) => {
    const [eventDetails] = await Promise.all([EventsModel.findById(event_id)])

    if (!eventDetails) return false

    let username = ''
    let companyName = ''

    if (!username) username = 'User'

    const attendees: any[] = []
    const meetingLocation =
      cloneDeep(meeting_details)?.meeting_location?.location_name ?? ''

    // http://localhost:3000/event/65c358a0521dc5a4c4bb3e59/1-1-meetings/view-schedule
    const dashboardLoginLink = `${UrlHelpers.getWebUrl()}/event/${event_id}/1-1-meetings/view-schedule`

    meeting_users.forEach((user: any) => {
      if (!user) return
      let userName = ''
      let userCompany = user?.company?.company_name ?? ''

      if (user?.first_name) userName = user?.first_name
      if (user.last_name) {
        if (user.first_name) userName = `${user.first_name} ${user.last_name}`
        else userName = user.last_name
      }

      attendees.push(`${userName} of ${userCompany}`)
    })

    const meetingDate = moment(new Date(meeting_details.meeting_date))
      .utc()
      .format('dddd Do MMMM YYYY')
    let startTime = moment(new Date(meeting_details.meeting_start_time))
      .utc()
      .format('HH:mm')
    let endTime = moment(new Date(meeting_details.meeting_end_time))
      .utc()
      .format('HH:mm')

	if( eventDetails?.time_zone && eventDetails?.time_zone_value ){
      startTime = moment( new Date(meeting_details.meeting_start_time) ).tz(eventDetails?.time_zone_value).format('hh:mm A');
      endTime = moment( new Date(meeting_details.meeting_end_time) ).tz(eventDetails?.time_zone_value).format('hh:mm A');
    }

    let timeDiff = ''

    let hourDiff = moment(new Date(meeting_details.meeting_end_time)).diff(
      moment(new Date(meeting_details.meeting_start_time)),
      'hour'
    )
    let minDiff = moment(new Date(meeting_details.meeting_end_time)).diff(
      moment(new Date(meeting_details.meeting_start_time)),
      'minute'
    )

    timeDiff = `${hourDiff} hr`

    if (hourDiff === 0) {
      timeDiff = `${minDiff} min`
    } else {
      const restMin = minDiff - hourDiff * 60

      if (restMin > 0) {
        timeDiff = `${hourDiff} hr ${restMin} min`
      }
    }
    //const meetingTimeString = `${startTime} - ${endTime} (${timeDiff})`
    const meetingTimeString = `${startTime} - ${endTime} (${timeDiff}) (${eventDetails?.time_zone ?? ''})`

    const eventLogo = EventServices.getEventLogo({
      event: eventDetails,
    })

    const featuredImage = UrlHelpers.getImageUrl({
      image_url: eventDetails?.featured_image,
    })

    const res = await EmailJobsHelpers.createNewJob({
      subject: `Eva Events - Your meeting is confirmed!`,
      to: email?.trim(),
      type: CommonEnums.emailTypes.meetingRequestConfirmed,
      metadata: {
        meeting_attendees: attendees,
        meeting_location: meetingLocation ?? '-',
        meeting_event_title: eventDetails?.name ?? '',
        event_poster_url: featuredImage ?? '',
        meeting_date: meetingDate,
        meeting_time: meetingTimeString,
        meeting_notes: meeting_details?.meeting_notes ?? '',
        accept_meeting_link: `${UrlHelpers.getWebUrl()}/accept-meeting/${
          meeting_details._id
        }`,
        decline_meeting_link: `${UrlHelpers.getWebUrl()}/decline-meeting/${
          meeting_details._id
        }`,
        reschedule_meeting_link: `${UrlHelpers.getWebUrl()}/reschedule-meeting/${
          meeting_details._id
        }`,
        event_login_link: dashboardLoginLink,
        event_logo: eventLogo,
      },
    })

    return res
  }

  static sendMeetingCancellationEmail = async ({
    event_id,
    meeting_details,
    meeting_users,
    email,
  }: {
    event_id: string
    meeting_details: IMeetingRequestsModelSchema
    meeting_users: any[]
    email: string
  }) => {
    const [eventDetails] = await Promise.all([EventsModel.findById(event_id)])

    if (!eventDetails) return false

    let username = ''
    let companyName = ''

    if (!username) username = 'User'

    const attendees: any[] = []
    const meetingLocation =
      cloneDeep(meeting_details)?.meeting_location?.location_name ?? ''

    const dashboardLoginLink = `${UrlHelpers.getWebUrl()}/event/${event_id}/1-1-meetings/request-accept-meetings?requested=others`

    meeting_users.forEach((user: any) => {
      let userName = ''
      let userCompany = user?.company?.company_name ?? ''

      if (user.first_name) userName = user.first_name
      if (user.last_name) {
        if (user.first_name) userName = `${user.first_name} ${user.last_name}`
        else userName = user.last_name
      }

      attendees.push(`${userName} of ${userCompany}`)
    })

    const meetingDate = moment(new Date(meeting_details.meeting_date))
      .utc()
      .format('dddd Do MMMM YYYY')
    let startTime = moment(new Date(meeting_details.meeting_start_time))
      .utc()
      .format('HH:mm')
    let endTime = moment(new Date(meeting_details.meeting_end_time))
      .utc()
      .format('HH:mm')
	
	if( eventDetails?.time_zone && eventDetails?.time_zone_value ){
      startTime = moment( new Date(meeting_details.meeting_start_time) ).tz(eventDetails?.time_zone_value).format('hh:mm A');
      endTime = moment( new Date(meeting_details.meeting_end_time) ).tz(eventDetails?.time_zone_value).format('hh:mm A');
    }

    let timeDiff = ''

    let hourDiff = moment(new Date(meeting_details.meeting_end_time)).diff(
      moment(new Date(meeting_details.meeting_start_time)),
      'hour'
    )
    let minDiff = moment(new Date(meeting_details.meeting_end_time)).diff(
      moment(new Date(meeting_details.meeting_start_time)),
      'minute'
    )

    timeDiff = `${hourDiff} hr`

    if (hourDiff === 0) {
      timeDiff = `${minDiff} min`
    } else {
      const restMin = minDiff - hourDiff * 60

      if (restMin > 0) {
        timeDiff = `${hourDiff} hr ${restMin} min`
      }
    }

    //const meetingTimeString = `${startTime} - ${endTime} (${timeDiff})`
    const meetingTimeString = `${startTime} - ${endTime} (${timeDiff}) (${eventDetails?.time_zone ?? ''})`

    const eventLogo = EventServices.getEventLogo({
      event: eventDetails,
    })

    const featuredImage = UrlHelpers.getImageUrl({
      image_url: eventDetails?.featured_image,
    })

    const res = await EmailJobsHelpers.createNewJob({
      subject: `Eva Events - Your meeting is cancelled!`,
      to: email?.trim(),
      type: CommonEnums.emailTypes.meetingCancellation,
      metadata: {
        meeting_attendees: attendees,
        meeting_location: meetingLocation ?? '-',
        meeting_event_title: eventDetails?.name ?? '',
        event_poster_url: featuredImage ?? '',
        meeting_date: meetingDate,
        meeting_time: meetingTimeString,
        meeting_notes: meeting_details?.meeting_notes ?? '',
        accept_meeting_link: `${UrlHelpers.getWebUrl()}/accept-meeting/${
          meeting_details?._id
        }`,
        decline_meeting_link: `${UrlHelpers.getWebUrl()}/decline-meeting/${
          meeting_details?._id
        }`,
        reschedule_meeting_link: `${UrlHelpers.getWebUrl()}/reschedule-meeting/${
          meeting_details?._id
        }`,
        event_logo: eventLogo,
        event_login_link: dashboardLoginLink,
      },
    })

    return res
  }

  static sendMeetingRescheduledByRequestorEmail = async ({
    event_id,
    meeting_details,
    old_meeting_details,
    meeting_users,
    email,
    requested_to_user,
  }: {
    event_id: string
    meeting_details: IMeetingRequestsModelSchema
    old_meeting_details: IMeetingRequestsModelSchema
    meeting_users: any[]
    email: string
    requested_to_user: IUser
  }) => {
    const eventDetails = await EventsModel.findById(event_id)

    if (!eventDetails) return false

    let username = ''
    let companyName = ''

    if (!username) username = 'User'

    const attendees: any[] = []
    const meetingLocation =
      cloneDeep(meeting_details)?.meeting_location?.location_name ?? ''
    // http://localhost:3000/event/65c358a0521dc5a4c4bb3e59/1-1-meetings/request-accept-meetings?requested=others
	
    const dashboardLoginLink = `${UrlHelpers.getWebUrl()}/event/${event_id}/1-1-meetings/request-accept-meetings?requested=others`

    meeting_users.forEach((user: any) => {
      let userName = ''
      let userCompany = user?.company?.company_name ?? ''

      if (user.first_name) userName = user.first_name
      if (user.last_name) {
        if (user.first_name) userName = `${user.first_name} ${user.last_name}`
        else userName = user.last_name
      }

      attendees.push(`${userName} of ${userCompany}`)
    })

    const meetingDate = moment(new Date(meeting_details.meeting_date))
      .utc()
      .format('dddd Do MMMM YYYY')

    const oldDate = moment(new Date(old_meeting_details.meeting_date))
      .utc()
      .format('dddd Do MMMM YYYY')

    let startTime = moment(new Date(meeting_details.meeting_start_time))
      .utc()
      .format('HH:mm')

    let oldStartTime = moment(
      new Date(old_meeting_details.meeting_start_time)
    )
      .utc()
      .format('HH:mm')

    let endTime = moment(new Date(meeting_details.meeting_end_time))
      .utc()
      .format('HH:mm')

    let oldEndTime = moment(new Date(old_meeting_details.meeting_end_time))
      .utc()
      .format('HH:mm')
      
    if( eventDetails?.time_zone && eventDetails?.time_zone_value ){
      startTime = moment( new Date(meeting_details.meeting_start_time) ).tz(eventDetails?.time_zone_value).format('hh:mm A');
      endTime = moment( new Date(meeting_details.meeting_end_time) ).tz(eventDetails?.time_zone_value).format('hh:mm A');
      oldStartTime = moment( new Date(old_meeting_details.meeting_start_time) ).tz(eventDetails?.time_zone_value).format('hh:mm A');
      oldEndTime = moment( new Date(old_meeting_details.meeting_end_time) ).tz(eventDetails?.time_zone_value).format('hh:mm A');
    }

    let timeDiff = ''
    let oldTimeDiff = ''

    let hourDiff = moment(new Date(meeting_details.meeting_end_time)).diff(
      moment(new Date(meeting_details.meeting_start_time)),
      'hour'
    )
    let oldHourDiff = moment(
      new Date(old_meeting_details.meeting_end_time)
    ).diff(moment(new Date(old_meeting_details.meeting_start_time)), 'hour')

    let minDiff = moment(new Date(meeting_details.meeting_end_time)).diff(
      moment(new Date(meeting_details.meeting_start_time)),
      'minute'
    )

    let oldMinDiff = moment(
      new Date(old_meeting_details.meeting_end_time)
    ).diff(moment(new Date(old_meeting_details.meeting_start_time)), 'minute')

    timeDiff = `${hourDiff} hr`
    oldTimeDiff = `${oldHourDiff} hr`

    if (hourDiff === 0) {
      timeDiff = `${minDiff} min`
    } else {
      const restMin = minDiff - hourDiff * 60

      if (restMin > 0) {
        timeDiff = `${hourDiff} hr ${restMin} min`
      }
    }

    if (oldHourDiff === 0) {
      oldTimeDiff = `${oldMinDiff} min`
    } else {
      const newRestMin = oldMinDiff - oldHourDiff * 60

      if (newRestMin > 0) {
        oldTimeDiff = `${oldHourDiff} hr ${newRestMin} min`
      }
    }

    //const meetingTimeString = `${startTime} - ${endTime} (${timeDiff})`
    const meetingTimeString = `${startTime} - ${endTime} (${timeDiff}) (${eventDetails?.time_zone ?? ''})`
    //const oldMeetingTimeString = `${oldStartTime} - ${oldEndTime} (${oldTimeDiff})`
    const oldMeetingTimeString = `${oldStartTime} - ${oldEndTime} (${oldTimeDiff}) (${eventDetails?.time_zone ?? ''})`

    const eventLogo = EventServices.getEventLogo({
      event: eventDetails,
    })

    const featuredImage = UrlHelpers.getImageUrl({
      image_url: eventDetails?.featured_image,
    })

    const res = await EmailJobsHelpers.createNewJob({
      subject: `Eva Events - Meeting is rescheduled by ${username}!`,
      to: email?.trim(),
      type: CommonEnums.emailTypes.meetingRescheduledByRequestor,
      metadata: {
        meeting_attendees: attendees,
        meeting_location: meetingLocation ?? '-',
        meeting_event_title: eventDetails?.name ?? '',
        event_poster_url: featuredImage ?? '',
        meeting_date: meetingDate,
        old_meeting_date: oldDate,
        meeting_time: meetingTimeString,
        old_meeting_time: oldMeetingTimeString,
        meeting_notes: meeting_details?.meeting_notes ?? '',
        accept_meeting_link: `${UrlHelpers.getWebUrl()}/accept-meeting/${
          meeting_details?._id
        }?event_id=${event_id}&requested_to=${requested_to_user?._id?.toString()}`,
        decline_meeting_link: `${UrlHelpers.getWebUrl()}/decline-meeting/${
          meeting_details?._id
        }?event_id=${event_id}&requested_to=${requested_to_user?._id?.toString()}`,
        reschedule_meeting_link: `${UrlHelpers.getWebUrl()}/reschedule-meeting/${
          meeting_details?._id
        }?event_id=${event_id}`,
        event_login_link: dashboardLoginLink,
        event_logo: eventLogo,
      },
    })

    return res
  }

  /**
   * Send email to requestor user when someone declined the meeting request
   */

  static sendMeetingIsDeclinedByUserEmail = async ({
    event_id,
    meeting_details,
    meeting_users,
    email,
    declined_by,
  }: {
    event_id: string
    meeting_details: IMeetingRequestsModelSchema
    declined_by: IUser
    meeting_users: any[]
    email: string
  }) => {
    const [eventDetails] = await Promise.all([EventsModel.findById(event_id)])

    if (!eventDetails) return false

    let username = ''
    let companyName = ''

    let declinedByUsername = ''

    if (declined_by?.first_name) declinedByUsername = declined_by?.first_name
    if (declined_by?.last_name) {
      if (declined_by?.first_name)
        declinedByUsername = `${declined_by?.first_name} ${declined_by?.last_name}`
      else declinedByUsername = declined_by?.last_name
    }

    if (!username) username = 'User'

    const attendees: any[] = []
    const meetingLocation =
      cloneDeep(meeting_details)?.meeting_location?.location_name ?? ''

    const dashboardLoginLink = `${UrlHelpers.getWebUrl()}/event/${event_id}/1-1-meetings/request-accept-meetings?requested=others`

    meeting_users.forEach((user: any) => {
      let userName = ''
      let userCompany = user?.company?.company_name ?? ''

      if (user.first_name) userName = user.first_name
      if (user.last_name) {
        if (user.first_name) userName = `${user.first_name} ${user.last_name}`
        else userName = user.last_name
      }

      attendees.push(`${userName} of ${userCompany}`)
    })

    const meetingDate = moment(new Date(meeting_details.meeting_date))
      .utc()
      .format('dddd Do MMMM YYYY')
    let startTime = moment(new Date(meeting_details.meeting_start_time))
      .utc()
      .format('HH:mm')
    let endTime = moment(new Date(meeting_details.meeting_end_time))
      .utc()
      .format('HH:mm')
      
      if( eventDetails?.time_zone && eventDetails?.time_zone_value ){
	      startTime = moment( new Date(meeting_details.meeting_start_time) ).tz(eventDetails?.time_zone_value).format('hh:mm A');
	      endTime = moment( new Date(meeting_details.meeting_end_time) ).tz(eventDetails?.time_zone_value).format('hh:mm A');
	    }

    let timeDiff = ''

    let hourDiff = moment(new Date(meeting_details.meeting_end_time)).diff(
      moment(new Date(meeting_details.meeting_start_time)),
      'hour'
    )
    let minDiff = moment(new Date(meeting_details.meeting_end_time)).diff(
      moment(new Date(meeting_details.meeting_start_time)),
      'minute'
    )

    timeDiff = `${hourDiff} hr`

    if (hourDiff === 0) {
      timeDiff = `${minDiff} min`
    } else {
      const restMin = minDiff - hourDiff * 60

      if (restMin > 0) {
        timeDiff = `${hourDiff} hr ${restMin} min`
      }
    }

    //const meetingTimeString = `${startTime} - ${endTime} (${timeDiff})`
    const meetingTimeString = `${startTime} - ${endTime} (${timeDiff}) (${eventDetails?.time_zone ?? ''})`

    const eventLogo = EventServices.getEventLogo({
      event: eventDetails,
    })

    const featuredImage = UrlHelpers.getImageUrl({
      image_url: eventDetails?.featured_image,
    })

    const res = await EmailJobsHelpers.createNewJob({
      subject: `Eva Events - Your Meeting Request Is Declined by ${declinedByUsername}!`,
      to: email?.trim(),
      type: CommonEnums.emailTypes.meeting_is_declined_by_user,
      metadata: {
        meeting_attendees: attendees,
        meeting_location: meetingLocation ?? '-',
        meeting_event_title: eventDetails?.name ?? '',
        event_poster_url: featuredImage ?? '',
        meeting_date: meetingDate,
        meeting_time: meetingTimeString,
        meeting_notes: meeting_details?.meeting_notes ?? '',
        username: declinedByUsername,
        accept_meeting_link: `${UrlHelpers.getWebUrl()}/accept-meeting/${
          meeting_details._id
        }?event_id=${event_id}`,
        decline_meeting_link: `${UrlHelpers.getWebUrl()}/decline-meeting/${
          meeting_details._id
        }?event_id=${event_id}`,
        reschedule_meeting_link: `${UrlHelpers.getWebUrl()}/reschedule-meeting/${
          meeting_details._id
        }?event_id=${event_id}`,
        event_logo: eventLogo,
        event_login_link: dashboardLoginLink,
      },
    })

    return res
  }

  /**
   * Send confirmation email to use that they are declined to the meeting successfully
   */

  static sendMeetingIsDeclinedConfirmationEmail = async ({
    event_id,
    meeting_details,
    meeting_users,
    email,
    declined_by,
  }: {
    event_id: string
    meeting_details: IMeetingRequestsModelSchema
    declined_by: IUser
    meeting_users: any[]
    email: string
  }) => {
    const [eventDetails] = await Promise.all([EventsModel.findById(event_id)])

    if (!eventDetails) return false

    let username = ''
    let companyName = ''

    let declinedByUsername = ''

    if (declined_by.first_name) declinedByUsername = declined_by.first_name
    if (declined_by.last_name) {
      if (declined_by.first_name)
        declinedByUsername = `${declined_by.first_name} ${declined_by.last_name}`
      else declinedByUsername = declined_by.last_name
    }

    if (!username) username = 'User'

    const attendees: any[] = []
    const meetingLocation =
      cloneDeep(meeting_details)?.meeting_location?.location_name ?? ''

    const dashboardLoginLink = `${UrlHelpers.getWebUrl()}/event/${event_id}/1-1-meetings/request-accept-meetings?requested=others`

    meeting_users.forEach((user: any) => {
      let userName = ''
      let userCompany = user?.company?.company_name ?? ''

      if (user.first_name) userName = user.first_name
      if (user.last_name) {
        if (user.first_name) userName = `${user.first_name} ${user.last_name}`
        else userName = user.last_name
      }

      attendees.push(`${userName} of ${userCompany}`)
    })

    const meetingDate = moment(new Date(meeting_details.meeting_date))
      .utc()
      .format('dddd Do MMMM YYYY')
    let startTime = moment(new Date(meeting_details.meeting_start_time))
      .utc()
      .format('HH:mm')
    let endTime = moment(new Date(meeting_details.meeting_end_time))
      .utc()
      .format('HH:mm')
	
	if( eventDetails?.time_zone && eventDetails?.time_zone_value ){
      startTime = moment( new Date(meeting_details.meeting_start_time) ).tz(eventDetails?.time_zone_value).format('hh:mm A');
      endTime = moment( new Date(meeting_details.meeting_end_time) ).tz(eventDetails?.time_zone_value).format('hh:mm A');
    }

    let timeDiff = ''

    let hourDiff = moment(new Date(meeting_details.meeting_end_time)).diff(
      moment(new Date(meeting_details.meeting_start_time)),
      'hour'
    )
    let minDiff = moment(new Date(meeting_details.meeting_end_time)).diff(
      moment(new Date(meeting_details.meeting_start_time)),
      'minute'
    )

    timeDiff = `${hourDiff} hr`

    if (hourDiff === 0) {
      timeDiff = `${minDiff} min`
    } else {
      const restMin = minDiff - hourDiff * 60

      if (restMin > 0) {
        timeDiff = `${hourDiff} hr ${restMin} min`
      }
    }

    //const meetingTimeString = `${startTime} - ${endTime} (${timeDiff})`
    const meetingTimeString = `${startTime} - ${endTime} (${timeDiff}) (${eventDetails?.time_zone ?? ''})`

    const eventLogo = EventServices.getEventLogo({
      event: eventDetails,
    })

    const featuredImage = UrlHelpers.getImageUrl({
      image_url: eventDetails?.featured_image,
    })

    const res = await EmailJobsHelpers.createNewJob({
      subject: `Eva Events - Your Meeting Request Is Declined by ${declinedByUsername}!`,
      to: email?.trim(),
      type: CommonEnums.emailTypes.meeting_is_declined_confirmation_to_user,
      metadata: {
        meeting_attendees: attendees,
        meeting_location: meetingLocation ?? '-',
        meeting_event_title: eventDetails?.name ?? '',
        event_poster_url: featuredImage ?? '',
        meeting_date: meetingDate,
        meeting_time: meetingTimeString,
        meeting_notes: meeting_details?.meeting_notes ?? '',
        username: declinedByUsername,
        accept_meeting_link: `${UrlHelpers.getWebUrl()}/accept-meeting/${
          meeting_details._id
        }?event_id=${event_id}`,
        decline_meeting_link: `${UrlHelpers.getWebUrl()}/decline-meeting/${
          meeting_details._id
        }?event_id=${event_id}`,
        reschedule_meeting_link: `${UrlHelpers.getWebUrl()}/reschedule-meeting/${
          meeting_details._id
        }?event_id=${event_id}`,
        event_logo: eventLogo,
        event_login_link: dashboardLoginLink
      },
    })

    return res
  }

  static sendEventInviteToUser = async ({
    user,
    email,
    event,
    password,
  }: {
    user: IUser
    email: string
    password: string
    event: IEventsModelSchema
  }) => {
    const eventTitle = event?.name
    const featuredImage = cloneDeep(event)?.featured_image

    let loginToEventLink = `${UrlHelpers.getWebUrl()}/event/${event?._id}/login`

    const eventDate = CommonUtils.formatEventDates({
      endDate: event?.end_date?.toISOString(),
      startDate: event?.start_date?.toISOString(),
    })

    let username = ''

    if (user.user_type === CommonEnums.users.sponsor) {
      username = user.sponsor_name
    } else {
      if (user.first_name) username = user.first_name
      if (user.last_name) {
        if (user.first_name) username = `${user.first_name} ${user.last_name}`
        else username = user.last_name
      }
    }

    const eventLogo = EventServices.getEventLogo({
      event: event,
    })

    const _featuredImage = UrlHelpers.getImageUrl({
      image_url: featuredImage,
    })

    const eventInviteStaticBodyContent =
      await EmailTemplateServices.getEventInviteTemplateContent({
        event_id: event?._id?.toString(),
        template_type: CommonEnums.emailTypes.event_invite_to_user,
        user_type: user.user_type,
      })

    const res = await EmailJobsHelpers.createNewJob({
      subject: `Eva Events - You're invited to ${eventTitle} held on ${eventDate}`,
      to: email?.trim(),
      type: CommonEnums.emailTypes.event_invite_to_user,
      metadata: {
        event_date: eventDate,
        event_login_link: loginToEventLink,
        event_title: eventTitle,
        username: username,
        event_poster_url: _featuredImage ?? '',
        login_password: password?.trim(),
        login_email: email?.trim(),
        event_logo: eventLogo,
        static_body_content: eventInviteStaticBodyContent.trim(),
      },
    })

    return res
  }

  static sendMeetingDeclinedReportToAdmin = async ({
    event_id,
    meeting_details,
    meeting_users,
    declined_by,
  }: {
    event_id: string
    meeting_details: IMeetingRequestsModelSchema
    declined_by: IUser
    meeting_users: any[]
  }) => {
    const [eventDetails] = await Promise.all([EventsModel.findById(event_id)])

    if (!eventDetails) return false

    let username = ''
    let companyName = ''

    let declinedByUsername = ''
    let declinedByUserCompanyName = declined_by?.company?.company_name ?? ''

    let requestorUser = ''
    let requestorUserCompanyName = ''

    if (declined_by?.first_name) declinedByUsername = declined_by?.first_name
    if (declined_by?.last_name) {
      if (declined_by?.first_name)
        declinedByUsername = `${declined_by?.first_name} ${declined_by?.last_name}`
      else declinedByUsername = declined_by?.last_name
    }

    // const getCompanyDetailPromises: any = []

    const userRes = await UserServices.getUserRecordById({
      user_id: meeting_details?.requestor,
    })

    if (userRes) {
      requestorUserCompanyName = userRes?.company?.company_name
      requestorUser = userRes?.username ?? userRes.first_name
    }

    const getCompanyDetailsForRequestorByUser = async (params: {
      company_id: string
      requestor_user_id: string
    }) => {
      const userRes = await UserServices.getUserRecordById({
        user_id: params.requestor_user_id,
      })
      if (userRes) {
        requestorUserCompanyName = userRes?.company?.company_name
        requestorUser = userRes.username
      }
    }

    // await Promise.all([])

    if (!username) username = 'User'

    const attendees: any[] = []
    const meetingLocation =
      cloneDeep(meeting_details)?.meeting_location?.location_name ?? ''

    meeting_users.forEach((user: any) => {
      let userName = ''
      let userCompany = user?.company?.company_name ?? ''

      if (user.first_name) userName = user.first_name
      if (user.last_name) {
        if (user.first_name) userName = `${user.first_name} ${user.last_name}`
        else userName = user.last_name
      }

      attendees.push(`${userName} of ${userCompany}`)
    })

    const meetingDate = moment(new Date(meeting_details.meeting_date))
      .utc()
      .format('dddd Do MMMM YYYY')
    let startTime = moment(new Date(meeting_details.meeting_start_time))
      .utc()
      .format('HH:mm')
    let endTime = moment(new Date(meeting_details.meeting_end_time))
      .utc()
      .format('HH:mm')
      
	if( eventDetails?.time_zone && eventDetails?.time_zone_value ){
      startTime = moment( new Date(meeting_details.meeting_start_time) ).tz(eventDetails?.time_zone_value).format('hh:mm A');
      endTime = moment( new Date(meeting_details.meeting_end_time) ).tz(eventDetails?.time_zone_value).format('hh:mm A');
    }

    let timeDiff = ''

    let hourDiff = moment(new Date(meeting_details.meeting_end_time)).diff(
      moment(new Date(meeting_details.meeting_start_time)),
      'hour'
    )
    let minDiff = moment(new Date(meeting_details.meeting_end_time)).diff(
      moment(new Date(meeting_details.meeting_start_time)),
      'minute'
    )

    timeDiff = `${hourDiff} hr`

    if (hourDiff === 0) {
      timeDiff = `${minDiff} min`
    } else {
      const restMin = minDiff - hourDiff * 60

      if (restMin > 0) {
        timeDiff = `${hourDiff} hr ${restMin} min`
      }
    }

    //const meetingTimeString = `${startTime} - ${endTime} (${timeDiff})`
    const meetingTimeString = `${startTime} - ${endTime} (${timeDiff}) (${eventDetails?.time_zone ?? ''})`

    const eventLogo = EventServices.getEventLogo({
      event: eventDetails,
    })

    const featuredImage = UrlHelpers.getImageUrl({
      image_url: eventDetails?.featured_image,
    })

    const res = await EmailJobsHelpers.createNewJob({
      subject: `Eva Events -  ${declinedByUsername} of ${declinedByUserCompanyName} has declined with ${requestorUser} of ${requestorUserCompanyName}`,
      to: EnvVariables.meetingManagements.adminEmailToSendEmailReports ?? '',
      type: CommonEnums.emailTypes.meeting_cancelation_report_to_admin,
      metadata: {
        meeting_attendees: attendees,
        meeting_location: meetingLocation ?? '-',
        meeting_event_title: eventDetails?.name ?? '',
        event_poster_url: featuredImage ?? '',
        meeting_date: meetingDate,
        meeting_time: meetingTimeString,
        meeting_notes: meeting_details?.meeting_notes ?? '',
        username: declinedByUsername,
        accept_meeting_link: `${UrlHelpers.getWebUrl()}/accept-meeting/${
          meeting_details._id
        }?event_id=${event_id}`,
        decline_meeting_link: `${UrlHelpers.getWebUrl()}/decline-meeting/${
          meeting_details._id
        }?event_id=${event_id}`,
        reschedule_meeting_link: `${UrlHelpers.getWebUrl()}/reschedule-meeting/${
          meeting_details._id
        }?event_id=${event_id}`,
        event_logo: eventLogo,
        user_who_cancelled_the_meeting: declinedByUsername,
        user_company_name_who_cancelled_the_meeting: declinedByUserCompanyName,
        user_with_whom_meeting_is: requestorUser,
        user_company_name_with_whom_meeting_is: requestorUserCompanyName,
      },
    })

    return res
  }

  static sendMeetingIsCancelledByRequestorEmailToAdmin = async ({
    event_id,
    meeting_details,
    meeting_users,
  }: {
    event_id: string
    meeting_details: IMeetingRequestsModelSchema
    meeting_users: any[]
  }) => {
    const [eventDetails] = await Promise.all([EventsModel.findById(event_id)])

    if (!eventDetails) return false

    let username = ''
    let companyName = ''

    let requestorUser = ''
    let requestorUserCompanyName = ''

    const userRes = await UserServices.getUserRecordById({
      user_id: meeting_details?.requestor,
    })

    if (userRes) {
      requestorUserCompanyName = userRes?.company?.company_name
      requestorUser = userRes?.username ?? userRes.first_name
    }

    if (!username) username = 'User'

    const attendees: any[] = []
    const meetingLocation =
      cloneDeep(meeting_details)?.meeting_location?.location_name ?? ''

    meeting_users.forEach((user: any) => {
      let userName = ''
      let userCompany = user?.company?.company_name ?? ''

      if (user.first_name) userName = user.first_name
      if (user.last_name) {
        if (user.first_name) userName = `${user.first_name} ${user.last_name}`
        else userName = user.last_name
      }

      attendees.push(`${userName} of ${userCompany}`)
    })

    const meetingDate = moment(new Date(meeting_details.meeting_date))
      .utc()
      .format('dddd Do MMMM YYYY')
    let startTime = moment(new Date(meeting_details.meeting_start_time))
      .utc()
      .format('HH:mm')
    let endTime = moment(new Date(meeting_details.meeting_end_time))
      .utc()
      .format('HH:mm')
      
    if( eventDetails?.time_zone && eventDetails?.time_zone_value ){
      startTime = moment( new Date(meeting_details.meeting_start_time) ).tz(eventDetails?.time_zone_value).format('hh:mm A');
      endTime = moment( new Date(meeting_details.meeting_end_time) ).tz(eventDetails?.time_zone_value).format('hh:mm A');
    }  

    let timeDiff = ''

    let hourDiff = moment(new Date(meeting_details.meeting_end_time)).diff(
      moment(new Date(meeting_details.meeting_start_time)),
      'hour'
    )
    let minDiff = moment(new Date(meeting_details.meeting_end_time)).diff(
      moment(new Date(meeting_details.meeting_start_time)),
      'minute'
    )

    timeDiff = `${hourDiff} hr`

    if (hourDiff === 0) {
      timeDiff = `${minDiff} min`
    } else {
      const restMin = minDiff - hourDiff * 60

      if (restMin > 0) {
        timeDiff = `${hourDiff} hr ${restMin} min`
      }
    }

    //const meetingTimeString = `${startTime} - ${endTime} (${timeDiff})`
    const meetingTimeString = `${startTime} - ${endTime} (${timeDiff}) (${eventDetails?.time_zone ?? ''})`
	//console.log("cancel meeting");
	//console.log("meetingTimeString" , meetingTimeString );
    const eventLogo = EventServices.getEventLogo({
      event: eventDetails,
    })

    const featuredImage = UrlHelpers.getImageUrl({
      image_url: eventDetails?.featured_image,
    })
	//console.log("meetingLocation123" , meetingLocation );
    const res = await EmailJobsHelpers.createNewJob({
      subject: `Eva Events - ${requestorUser} of ${requestorUserCompanyName} cancelled the meeting!`,
      to: EnvVariables.meetingManagements.adminEmailToSendEmailReports ?? '',
      type: CommonEnums.emailTypes
        .meeting_is_cancelled_by_requestor_user_report_email_to_admin,
      metadata: {
        meeting_attendees: attendees,
        meeting_location: meetingLocation ?? '-',
        meeting_event_title: eventDetails?.name ?? '',
        event_poster_url: featuredImage ?? '',
        meeting_date: meetingDate,
        meeting_time: meetingTimeString,
        meeting_notes: meeting_details?.meeting_notes ?? '',
        accept_meeting_link: `${UrlHelpers.getWebUrl()}/accept-meeting/${
          meeting_details?._id
        }`,
        decline_meeting_link: `${UrlHelpers.getWebUrl()}/decline-meeting/${
          meeting_details?._id
        }`,
        reschedule_meeting_link: `${UrlHelpers.getWebUrl()}/reschedule-meeting/${
          meeting_details?._id
        }`,
        event_logo: eventLogo,
        meeting_requestor_user_name: requestorUser ?? '',
        meeting_requestor_company_name: requestorUserCompanyName ?? '',
      },
    })

    return res
  }
}
