import { buildEmail } from '../email/templates'

const nodemailer = require('nodemailer')
import { EmailJobObject } from '../@types/jobs'
import EmailJobsModel from '../models/email-jobs.model'

import * as fs from 'fs'
import { CommonEnums } from '../enums/common.enums'
import { UrlHelpers } from './common'

import dotenv from 'dotenv'
dotenv.config({ path: `.env.${process.env.NODE_ENV}` })

export const meetingRequestEmailTemplate = fs.readFileSync(
  './src/email/templates/meeting-requested-email-template.html',
  'utf-8'
)

export const meetingRequestAcceptedEmailTemplate = fs.readFileSync(
  './src/email/templates/meeting-request-confirmed-email-template.html',
  'utf-8'
)

export const meetingCancellationEmailTemplate = fs.readFileSync(
  './src/email/templates/meeting-cancellation-email-template.html',
  'utf-8'
)

export const rescheduleMeetingEmailTemplate = fs.readFileSync(
  './src/email/templates/meeting-rescheduled-by-requestor-email-template.html',
  'utf-8'
)

export const meetingIsDeclinedByUserEmailTemplate = fs.readFileSync(
  './src/email/templates/meeting-request-declined-by-user-template.html',
  'utf-8'
)

export const meetingIsDeclinedConformationEmailTemplate = fs.readFileSync(
  './src/email/templates/meeting-request-declined-confirmation-email-template.html',
  'utf-8'
)

export const eventInviteToUserTemplate = fs.readFileSync(
  './src/email/templates/event-invite-email-template.html',
  'utf-8'
)

export const adminResetPasswordTemplate = fs.readFileSync(
  './src/email/templates/reset-password.template.html',
  'utf-8'
)

export const meetingDeclinedReportToAdminTemplate = fs.readFileSync(
  './src/email/templates/meeting-declined-email-to-admin.html',
  'utf-8'
)

export const meetingIsCancelledByRequestorEmailToAdmin = fs.readFileSync(
  './src/email/templates/meeting-cancelled-by-requestor-report-email-admin.html',
  'utf-8'
)

const fromEmailTitle = '"EVA Events" <info@evaevents.com>';

/**
 * Type interfaces
 */

interface ISendMail {
  subject: string
  text?: string
  greeting: string
  mail_content: string
  to: string
}

// const mailTransport = nodemailer.createTransport({
//   host: 'smtpout.secureserver.net',
//   secure: true,
//   secureConnection: false, // TLS requires secureConnection to be false
//   tls: {
//     ciphers: 'SSLv3',
//   },
//   requireTLS: true,
//   port: 465,
//   debug: true,
//   auth: {
//     user: 'no-reply@mylo.global',
//     pass: 'meganalphamegan9',
//   },
// })

/**
 * Send email using gmail
 */
// const mailTransport = nodemailer.createTransport({
//   service: 'gmail',
//   host: 'smtp.gmail.com',
//   port: 587,
//   secure: true,
//   auth: {
//     user: process.env.AUTH_USER,
//     pass: process.env.AUTH_PASS,
//   },
// })

const mailTransport = nodemailer.createTransport({
  // service: 'gmail',
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL_AUTH_USER,
    pass: process.env.EMAIL_AUTH_PASS,
  },
})

class EmailHelpers {
  static fetchEmailJobsFromDb = false
  static executingEmailJobs = false

  static startFetchEmailJobs = () => {
    this.fetchEmailJobsFromDb = true
  }

  static stopFetchingEmailJobs = () => {
    this.fetchEmailJobsFromDb = false
  }

  static startEmailJobExecution = () => {
    this.executingEmailJobs = true
  }

  static stopEmailJobExecution = () => {
    this.executingEmailJobs = false
  }

  static sendMail = async ({
    subject,
    text = '',
    greeting,
    mail_content,
    to,
  }: ISendMail) => {
    let mailOptions = {
      from: fromEmailTitle,
      to,
      subject,
      text,
      html: buildEmail({ greeting, content: mail_content }),
    }

    await mailTransport.sendMail(mailOptions)

    return true
  }

  static sendMeetingRequestEmail = async ({
    subject,
    text = '',
    meeting_event_title,
    event_poster_url,
    meeting_requestor_user_name,
    meeting_requestor_company_name,
    meeting_date,
    meeting_time,
    meeting_location,
    meeting_notes,
    accept_meeting_link,
    decline_meeting_link,
    reschedule_meeting_link,
    event_login_link,
    to,
    event_logo,
  }: {
    subject: string
    text?: string
    meeting_event_title: string
    event_poster_url: string
    meeting_requestor_user_name: string
    meeting_requestor_company_name: string
    meeting_date: string
    meeting_time: string
    meeting_location: string
    meeting_notes: string
    accept_meeting_link: string
    decline_meeting_link: string
    reschedule_meeting_link: string
    event_login_link: string
    to: string
    event_logo: string
  }) => {
    const evaEventDashboard = `${UrlHelpers.getWebUrl()}/1-1-meetings`

    const htmlContent = meetingRequestEmailTemplate
      .replace('{event_title}', meeting_event_title)
      .replace('{event_poster_url}', event_poster_url)
      .replace('{username}', meeting_requestor_user_name)
      .replace('{company_name}', meeting_requestor_company_name)
      .replace('{meeting_date}', meeting_date)
      .replace('{meeting_time}', meeting_time)
      .replace('{meeting_location}', meeting_location)
      .replace('{comments}', meeting_notes)
      .replace('{accept_meeting_link}', accept_meeting_link)
      .replace('{reschedule_meeting_link}', reschedule_meeting_link)
      .replace('{decline_meeting_link}', decline_meeting_link)
      .replace('{eva_user_dashboard_link}', event_login_link)
      .replace('{event_logo_url}', event_logo)

    let mailOptions = {
      from: fromEmailTitle,
      to,
      subject,
      text,
      html: htmlContent,
    }

    await mailTransport.sendMail(mailOptions)

    return true
  }

  static sendMeetingDeclinedEmailToAdmin = async (params: {
    subject: string
    text?: string
    meeting_event_title: string
    event_poster_url: string
    meeting_requestor_user_name: string
    meeting_requestor_company_name: string
    meeting_date: string
    meeting_time: string
    meeting_location: string
    meeting_notes: string
    accept_meeting_link: string
    decline_meeting_link: string
    reschedule_meeting_link: string
    event_login_link: string
    to: string
    event_logo: string
    user_who_cancelled_the_meeting: string
    user_company_name_who_cancelled_the_meeting: string
    user_with_whom_meeting_is: string
    user_company_name_with_whom_meeting_is: string
  }) => {
    const evaEventDashboard = `${UrlHelpers.getWebUrl()}/1-1-meetings`

    const htmlContent = (meetingDeclinedReportToAdminTemplate as any)
      .replace('{event_title}', params.meeting_event_title)
      .replace('{event_poster_url}', params.event_poster_url)
      .replace('{username}', params.meeting_requestor_user_name)
      .replace('{company_name}', params.meeting_requestor_company_name)
      .replace('{meeting_date}', params.meeting_date)
      .replace('{meeting_location}', params.meeting_location)
      .replace('{meeting_time}', params.meeting_time)
      .replace('{comments}', params.meeting_notes)
      .replace('{accept_meeting_link}', params.accept_meeting_link)
      .replace('{reschedule_meeting_link}', params.reschedule_meeting_link)
      .replace('{decline_meeting_link}', params.decline_meeting_link)
      .replace('{eva_user_dashboard_link}', params.event_login_link)
      .replace('{event_logo_url}', params.event_logo)
      .replaceAll(
        '{user_who_cancelled_the_meeting}',
        params.user_who_cancelled_the_meeting
      )
      .replaceAll(
        '{user_company_name_who_cancelled_the_meeting}',
        params.user_company_name_who_cancelled_the_meeting
      )
      .replaceAll(
        '{user_with_whom_meeting_is}',
        params.user_with_whom_meeting_is
      )
      .replaceAll(
        '{user_company_name_with_whom_meeting_is}',
        params.user_company_name_with_whom_meeting_is
      )

    let mailOptions = {
      from: fromEmailTitle,
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: htmlContent,
    }

    await mailTransport.sendMail(mailOptions)

    return true
  }

  static sendResetPasswordEmailToAdmin = async ({
    subject,
    text = '',
    to,
    event_login_link,
  }: {
    subject: string
    text?: string
    to: string
    event_login_link: string
  }) => {
    const htmlContent = (adminResetPasswordTemplate as any).replaceAll(
      '{reset_password_link}',
      event_login_link
    )

    let mailOptions = {
      from: fromEmailTitle,
      to,
      subject,
      text,
      html: htmlContent,
    }

    await mailTransport.sendMail(mailOptions)

    return true
  }

  static sendMeetingRequestConfirmedEmail = async ({
    subject,
    text = '',
    meeting_location = '',
    meeting_attendees = [],
    meeting_event_title,
    event_poster_url,
    meeting_date,
    meeting_time,
    dashboard_login_link,
    to,
    event_logo,
  }: {
    subject: string
    text?: string
    meeting_location: string
    meeting_attendees: string[]
    meeting_event_title: string
    event_poster_url: string
    meeting_date: string
    meeting_time: string
    dashboard_login_link: string
    to: string
    event_logo: string
  }) => {
    const evaEventDashboard = `${UrlHelpers.getWebUrl()}/1-1-meetings`

    let attendeesHtmlContent = ''

    meeting_attendees.forEach((attendee: string) => {
      attendeesHtmlContent =
        attendeesHtmlContent +
        `<p style="font-size: 14px; line-height: 0.5; color: #181818 ; margin-top:4px;">
      <span class="icon">&gt;</span>
      ${attendee}
    </p>`
    })

    const htmlContent = meetingRequestAcceptedEmailTemplate
      .replace('{event_title}', meeting_event_title)
      .replace('{event_poster_url}', event_poster_url)
      .replace('{attendees}', attendeesHtmlContent)
      .replace('{meeting_date}', meeting_date)
      .replace('{meeting_time}', meeting_time)
      .replace('{meeting_location}', meeting_location)
      .replace('{eva_user_dashboard_link}', dashboard_login_link)
      .replace('{event_logo_url}', event_logo)

    let mailOptions = {
      from: fromEmailTitle,
      to,
      subject,
      text,
      html: htmlContent,
    }

    await mailTransport.sendMail(mailOptions)

    return true
  }

  static sendMeetingCancellationEmail = async ({
    subject,
    text = '',
    meeting_location = '',
    meeting_attendees = [],
    meeting_event_title,
    event_poster_url,
    meeting_date,
    meeting_time,
    to,
    event_logo,
    event_login_link,
  }: {
    subject: string
    text?: string
    meeting_location: string
    meeting_attendees: string[]
    meeting_event_title: string
    event_poster_url: string
    meeting_date: string
    meeting_time: string
    to: string
    event_logo: string
    event_login_link: string
  }) => {
    const evaEventDashboard = `${UrlHelpers.getWebUrl()}/1-1-meetings`

    let attendeesHtmlContent = ''

    meeting_attendees.forEach((attendee: string) => {
      attendeesHtmlContent =
        attendeesHtmlContent +
        `<p style="font-size: 14px; line-height: 0.5; color: #181818 ; margin-top:4px;">
      <span class="icon">&gt;</span>
      ${attendee}
    </p>`
    })

    const htmlContent = meetingCancellationEmailTemplate
      .replace('{event_title}', meeting_event_title)
      .replace('{event_poster_url}', event_poster_url)
      .replace('{attendees}', attendeesHtmlContent)
      .replace('{meeting_date}', meeting_date)
      .replace('{meeting_time}', meeting_time)
      .replace('{meeting_location}', meeting_location)
      .replace('{eva_user_dashboard_link}', event_login_link)
      .replace('{event_logo_url}', event_logo)

    let mailOptions = {
      from: fromEmailTitle,
      to,
      subject,
      text,
      html: htmlContent,
    }

    await mailTransport.sendMail(mailOptions)

    return true
  }

  static sendMeetingIsCancelledByRequestorUserEmailToAdmin = async (params: {
    subject: string
    text?: string
    meeting_location: string
    meeting_attendees: string[]
    meeting_event_title: string
    event_poster_url: string
    meeting_date: string
    meeting_time: string
    to: string
    event_logo: string
    meeting_requestor_user_name: string
    meeting_requestor_company_name: string
  }) => {
    const evaEventDashboard = `${UrlHelpers.getWebUrl()}/1-1-meetings`

    let attendeesHtmlContent = ''

    params.meeting_attendees.forEach((attendee: string) => {
      attendeesHtmlContent =
        attendeesHtmlContent +
        `<p style="font-size: 14px; line-height: 0.5; color: #181818 ; margin-top:4px;">
      <span class="icon">&gt;</span>
      ${attendee}
    </p>`
    })

    const htmlContent = (meetingIsCancelledByRequestorEmailToAdmin as any)
      .replace('{event_title}', params.meeting_event_title)
      .replace('{event_poster_url}', params.event_poster_url)
      .replace('{attendees}', attendeesHtmlContent)
      .replace('{meeting_date}', params.meeting_date)
      .replace('{meeting_time}', params.meeting_time)
      .replace('{meeting_location}', params.meeting_location)
      .replace('{eva_user_dashboard_link}', evaEventDashboard)
      .replace('{event_logo_url}', params.event_logo)
      .replaceAll('{requestor_user}', params.meeting_requestor_user_name)
      .replaceAll(
        '{requestor_user_company_name}',
        params.meeting_requestor_company_name
      )

    let mailOptions = {
      from: fromEmailTitle,
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: htmlContent,
    }

    await mailTransport.sendMail(mailOptions)

    return true
  }

  static sendMeetingIsDeclinedByUserEmail = async ({
    subject,
    text = '',
    meeting_location = '',
    meeting_attendees = [],
    meeting_event_title,
    event_poster_url,
    meeting_date,
    meeting_time,
    username,
    to,
    event_logo,
    event_login_link,
  }: {
    subject: string
    text?: string
    meeting_location: string
    meeting_attendees: string[]
    meeting_event_title: string
    event_poster_url: string
    meeting_date: string
    meeting_time: string
    username: string
    to: string
    event_logo: string
    event_login_link: string
  }) => {
    const evaEventDashboard = `${UrlHelpers.getWebUrl()}/1-1-meetings`

    let attendeesHtmlContent = ''

    meeting_attendees.forEach((attendee: string) => {
      attendeesHtmlContent =
        attendeesHtmlContent +
        `<p style="font-size: 14px; line-height: 0.5; color: #181818 ; margin-top:4px;">
      <span class="icon">&gt;</span>
      ${attendee}
    </p>`
    })

    const htmlContent = (meetingIsDeclinedByUserEmailTemplate as any)
      .replace('{event_title}', meeting_event_title)
      .replace('{event_poster_url}', event_poster_url)
      .replace('{attendees}', attendeesHtmlContent)
      .replace('{meeting_date}', meeting_date)
      .replace('{meeting_time}', meeting_time)
      .replace('{meeting_location}', meeting_location)
      .replaceAll('{username}', username)
      .replace('{eva_user_dashboard_link}', event_login_link)
      .replace('{event_logo_url}', event_logo)

    let mailOptions = {
      from: fromEmailTitle,
      to,
      subject,
      text,
      html: htmlContent,
    }

    await mailTransport.sendMail(mailOptions)

    return true
  }

  static sendMeetingIsDeclinedConfirmationEmail = async ({
    subject,
    text = '',
    meeting_location = '',
    meeting_attendees = [],
    meeting_event_title,
    event_poster_url,
    meeting_date,
    meeting_time,
    to,
    event_logo,
    event_login_link,
  }: {
    subject: string
    text?: string
    meeting_location: string
    meeting_attendees: string[]
    meeting_event_title: string
    event_poster_url: string
    meeting_date: string
    meeting_time: string
    to: string
    event_logo: string
    event_login_link: string
  }) => {
    const evaEventDashboard = `${UrlHelpers.getWebUrl()}/1-1-meetings`

    let attendeesHtmlContent = ''

    meeting_attendees.forEach((attendee: string) => {
      attendeesHtmlContent =
        attendeesHtmlContent +
        `<p style="font-size: 14px; line-height: 0.5; color: #181818 ; margin-top:4px;">
      <span class="icon">&gt;</span>
      ${attendee}
    </p>`
    })

    const htmlContent = meetingIsDeclinedConformationEmailTemplate
      .replace('{event_title}', meeting_event_title)
      .replace('{event_poster_url}', event_poster_url)
      .replace('{attendees}', attendeesHtmlContent)
      .replace('{meeting_date}', meeting_date)
      .replace('{meeting_time}', meeting_time)
      .replace('{meeting_location}', meeting_location)
      .replace('{eva_user_dashboard_link}', event_login_link)
      .replace('{event_logo_url}', event_logo)

    let mailOptions = {
      from: fromEmailTitle,
      to,
      subject,
      text,
      html: htmlContent,
    }

    await mailTransport.sendMail(mailOptions)

    return true
  }

  static sendMeetingRescheduledEmail = async ({
    subject,
    text = '',
    meeting_location = '',
    meeting_attendees = [],
    meeting_event_title,
    event_poster_url,
    meeting_date,
    meeting_time,
    email_type,
    old_meeting_date,
    old_meeting_time,
    accept_meeting_link,
    decline_meeting_link,
    reschedule_meeting_link,
    dashboard_login_link,
    to,
    event_logo,
  }: {
    subject: string
    text?: string
    email_type: string
    meeting_location: string
    meeting_attendees: string[]
    meeting_event_title: string
    event_poster_url: string
    meeting_date: string
    meeting_time: string
    old_meeting_date: string
    old_meeting_time: string
    accept_meeting_link: string
    decline_meeting_link: string
    reschedule_meeting_link: string
    dashboard_login_link: string
    to: string
    event_logo: string
  }) => {
    const evaEventDashboard = `${UrlHelpers.getWebUrl()}/1-1-meetings`

    let attendeesHtmlContent = ''
    let emailTitle = ''
    let emailSubtitle = ''

    meeting_attendees.forEach((attendee: string) => {
      attendeesHtmlContent =
        attendeesHtmlContent +
        `<p style="font-size: 14px; line-height: 0.5; color: #181818 ; margin-top:4px;">
      <span class="icon">&gt;</span>
      ${attendee}
    </p>`
    })

    if (email_type === CommonEnums.emailTypes.meetingRescheduledByRequestor) {
      emailTitle = 'Meeting is rescheduled by requestor'
      emailSubtitle = 'The meeting is has been rescheduled by the requestor'
    }

    const htmlContent = rescheduleMeetingEmailTemplate
      .replace('{event_title}', meeting_event_title)
      .replace('{email_title}', emailTitle)
      .replace('{email_subtitle}', emailSubtitle)
      .replace('{event_poster_url}', event_poster_url)
      .replace('{attendees}', attendeesHtmlContent)
      .replace('{new_meeting_date}', meeting_date)
      .replace('{new_meeting_time}', meeting_time)
      .replace('{old_meeting_date}', old_meeting_date)
      .replace('{old_meeting_time}', old_meeting_time)
      .replace('{meeting_location}', meeting_location)
      .replace('{accept_meeting_link}', accept_meeting_link)
      .replace('{reschedule_meeting_link}', reschedule_meeting_link)
      .replace('{decline_meeting_link}', decline_meeting_link)
      .replace('{eva_user_dashboard_link}', dashboard_login_link)
      .replace('{event_logo_url}', event_logo)

    let mailOptions = {
      from: fromEmailTitle,
      to,
      subject,
      text,
      html: htmlContent,
    }

    await mailTransport.sendMail(mailOptions)

    return true
  }

  static sendEventInviteToUser = async ({
    subject,
    text = '',
    event_title = '',
    username = '',
    event_date,
    login_to_event_link,
    event_poster_url,
    to,
    login_email,
    login_password,
    event_logo,
    static_body_content,
  }: {
    subject: string
    text?: string
    event_title: string
    username: string
    event_poster_url: string
    event_date: string
    login_to_event_link: string
    to: string
    login_password: string
    login_email: string
    event_logo: string
    static_body_content: string
  }) => {
    const htmlContent = (eventInviteToUserTemplate as any)
      .replaceAll('{event_title}', event_title)
      .replace('{username}', username)
      .replace('{event_date}', event_date)
      .replace('{event_poster_url}', event_poster_url)
      .replace('{login_to_event_link}', login_to_event_link)
      .replace('{login_email}', login_email)
      .replace('{login_password}', login_password)
      .replace('{event_logo_url}', event_logo)
      .replace('{static_body_content}', static_body_content)

    let mailOptions = {
      from: fromEmailTitle,
      to,
      subject,
      text,
      html: htmlContent,
    }

    await mailTransport.sendMail(mailOptions)

    return true
  }

  static sendEmailTemplate = async ({
    subject,
    text = '',
    html_content,
    to,
  }: {
    subject: string
    text?: string
    html_content: string
    to: string
  }) => {
    let mailOptions = {
      from: fromEmailTitle ,
      to,
      subject,
      text,
      html: html_content,
    }

    await mailTransport.sendMail(mailOptions)

    return true
  }

  static readingEmailJobsFile = false
  static writingEmailJobsFile = false

  /**
   * Execute all the pending emails from email jobs file
   */
  static executeEmailJobs = async () => {
    try {
      if (!this.fetchEmailJobsFromDb) return

      if (this.executingEmailJobs) return

      this.startEmailJobExecution()

      const emailJobs = await EmailJobsModel.find({}).lean().exec()

      if (!emailJobs?.length) {
        this.stopFetchingEmailJobs()
        this.stopEmailJobExecution()
      }

      const emailJobPromises: any[] = []
      let deletableJobs: any[] = []
      let failedJobs = []

      Object.values(emailJobs).forEach((item) => {
        const jobItem = item as any as EmailJobObject

        const sendEmail = async () => {
          try {
            if (jobItem.type === CommonEnums.emailTypes.meetingRequest) {
              await this.sendMeetingRequestEmail({
                accept_meeting_link:
                  jobItem.metadata?.accept_meeting_link ?? '',
                decline_meeting_link:
                  jobItem.metadata?.decline_meeting_link ?? '',
                meeting_date: jobItem.metadata?.meeting_date ?? '',
                event_poster_url: jobItem.metadata?.event_poster_url ?? '',
                meeting_event_title:
                  jobItem.metadata?.meeting_event_title ?? '',
                meeting_notes: jobItem.metadata?.meeting_notes ?? '',
                meeting_requestor_company_name:
                  jobItem.metadata?.meeting_requestor_company_name ?? '',
                meeting_requestor_user_name:
                  jobItem.metadata?.meeting_requestor_user_name ?? '',
                reschedule_meeting_link:
                  jobItem.metadata?.reschedule_meeting_link ?? '',
                meeting_time: jobItem.metadata?.meeting_time ?? '',
                meeting_location: jobItem.metadata?.meeting_location ?? '',
                subject: jobItem.subject,
                text: jobItem.text,
                to: jobItem.to,
                event_login_link: jobItem.metadata.event_login_link ?? '',
                event_logo: jobItem.metadata?.event_logo ?? '',
              })
            } else if (
              jobItem.type ===
              CommonEnums.emailTypes.meeting_cancelation_report_to_admin
            ) {
              await this.sendMeetingDeclinedEmailToAdmin({
                accept_meeting_link:
                  jobItem.metadata?.accept_meeting_link ?? '',
                decline_meeting_link:
                  jobItem.metadata?.decline_meeting_link ?? '',
                meeting_date: jobItem.metadata?.meeting_date ?? '',
                event_poster_url: jobItem.metadata?.event_poster_url ?? '',
                meeting_event_title:
                  jobItem.metadata?.meeting_event_title ?? '',
                meeting_notes: jobItem.metadata?.meeting_notes ?? '',
                meeting_requestor_company_name:
                  jobItem.metadata?.meeting_requestor_company_name ?? '',
                meeting_requestor_user_name:
                  jobItem.metadata?.meeting_requestor_user_name ?? '',
                reschedule_meeting_link:
                  jobItem.metadata?.reschedule_meeting_link ?? '',
                meeting_time: jobItem.metadata?.meeting_time ?? '',
                meeting_location: jobItem.metadata?.meeting_location ?? '',
                subject: jobItem.subject,
                text: jobItem.text,
                to: jobItem.to,
                event_login_link: jobItem.metadata.event_login_link ?? '',
                event_logo: jobItem.metadata?.event_logo ?? '',
                user_who_cancelled_the_meeting:
                  jobItem.metadata.user_who_cancelled_the_meeting ?? '',
                user_company_name_who_cancelled_the_meeting:
                  jobItem.metadata
                    .user_company_name_who_cancelled_the_meeting ?? '',
                user_with_whom_meeting_is:
                  jobItem.metadata.user_with_whom_meeting_is ?? '',
                user_company_name_with_whom_meeting_is:
                  jobItem.metadata.user_company_name_with_whom_meeting_is ?? '',
              })
            } else if (
              jobItem.type === CommonEnums.emailTypes.meetingRequestConfirmed
            ) {
              await this.sendMeetingRequestConfirmedEmail({
                meeting_date: jobItem.metadata?.meeting_date ?? '',
                event_poster_url: jobItem.metadata?.event_poster_url ?? '',
                meeting_event_title:
                  jobItem.metadata?.meeting_event_title ?? '',
                meeting_time: jobItem.metadata?.meeting_time ?? '',
                subject: jobItem.subject,
                text: jobItem.text,
                to: jobItem.to,
                meeting_attendees: jobItem.metadata?.meeting_attendees ?? [],
                meeting_location: jobItem.metadata?.meeting_location ?? '',
                dashboard_login_link: jobItem?.metadata?.event_login_link ?? '',
                event_logo: jobItem.metadata?.event_logo ?? '',
              })
            } else if (
              jobItem.type === CommonEnums.emailTypes.meetingCancellation
            ) {
              await this.sendMeetingCancellationEmail({
                meeting_date: jobItem.metadata?.meeting_date ?? '',
                event_poster_url: jobItem.metadata?.event_poster_url ?? '',
                meeting_event_title:
                  jobItem.metadata?.meeting_event_title ?? '',
                meeting_time: jobItem.metadata?.meeting_time ?? '',
                subject: jobItem.subject,
                text: jobItem.text,
                to: jobItem.to,
                meeting_attendees: jobItem.metadata?.meeting_attendees ?? [],
                meeting_location: jobItem.metadata?.meeting_location ?? '',
                event_logo: jobItem.metadata?.event_logo ?? '',
                event_login_link: jobItem.metadata?.event_login_link ?? '',
              })
            } else if (
              jobItem.type ===
              CommonEnums.emailTypes
                .meeting_is_cancelled_by_requestor_user_report_email_to_admin
            ) {
              await this.sendMeetingIsCancelledByRequestorUserEmailToAdmin({
                meeting_date: jobItem.metadata?.meeting_date ?? '',
                event_poster_url: jobItem.metadata?.event_poster_url ?? '',
                meeting_event_title:
                  jobItem.metadata?.meeting_event_title ?? '',
                meeting_time: jobItem.metadata?.meeting_time ?? '',
                subject: jobItem.subject,
                text: jobItem.text,
                to: jobItem.to,
                meeting_attendees: jobItem.metadata?.meeting_attendees ?? [],
                meeting_location: jobItem.metadata?.meeting_location ?? '',
                event_logo: jobItem.metadata?.event_logo ?? '',
                meeting_requestor_user_name:
                  jobItem.metadata?.meeting_requestor_user_name ?? '',
                meeting_requestor_company_name:
                  jobItem.metadata?.meeting_requestor_company_name ?? '',
              })
            } else if (
              jobItem.type ===
              CommonEnums.emailTypes.meeting_is_declined_by_user
            ) {
              await this.sendMeetingIsDeclinedByUserEmail({
                meeting_date: jobItem.metadata?.meeting_date ?? '',
                event_poster_url: jobItem.metadata?.event_poster_url ?? '',
                meeting_event_title:
                  jobItem.metadata?.meeting_event_title ?? '',
                meeting_time: jobItem.metadata?.meeting_time ?? '',
                subject: jobItem.subject,
                text: jobItem.text,
                to: jobItem.to,
                meeting_attendees: jobItem.metadata?.meeting_attendees ?? [],
                meeting_location: jobItem.metadata?.meeting_location ?? '',
                username: jobItem.metadata?.username ?? '',
                event_logo: jobItem.metadata?.event_logo ?? '',
                event_login_link: jobItem.metadata?.event_login_link ?? '',
              })
            } else if (
              jobItem.type ===
              CommonEnums.emailTypes.meeting_is_declined_confirmation_to_user
            ) {
              await this.sendMeetingIsDeclinedConfirmationEmail({
                meeting_date: jobItem.metadata?.meeting_date ?? '',
                event_poster_url: jobItem.metadata?.event_poster_url ?? '',
                meeting_event_title:
                  jobItem.metadata?.meeting_event_title ?? '',
                meeting_time: jobItem.metadata?.meeting_time ?? '',
                subject: jobItem.subject,
                text: jobItem.text,
                to: jobItem.to,
                meeting_attendees: jobItem.metadata?.meeting_attendees ?? [],
                meeting_location: jobItem.metadata?.meeting_location ?? '',
                event_logo: jobItem.metadata?.event_logo ?? '',
                event_login_link: jobItem.metadata?.event_login_link ?? '',
              })
            } else if (
              jobItem.type ===
              CommonEnums.emailTypes.meetingRescheduledByRequestor
            ) {
              await this.sendMeetingRescheduledEmail({
                meeting_date: jobItem.metadata?.meeting_date ?? '',
                event_poster_url: jobItem.metadata?.event_poster_url ?? '',
                meeting_event_title:
                  jobItem.metadata?.meeting_event_title ?? '',
                meeting_time: jobItem.metadata?.meeting_time ?? '',
                subject: jobItem.subject,
                text: jobItem.text,
                to: jobItem.to,
                meeting_attendees: jobItem.metadata?.meeting_attendees ?? [],
                meeting_location: jobItem.metadata?.meeting_location ?? '',
                accept_meeting_link:
                  jobItem.metadata?.accept_meeting_link ?? '',
                decline_meeting_link:
                  jobItem.metadata?.decline_meeting_link ?? '',
                reschedule_meeting_link:
                  jobItem.metadata?.reschedule_meeting_link ?? '',
                email_type:
                  CommonEnums.emailTypes.meetingRescheduledByRequestor,
                old_meeting_date: jobItem.metadata?.old_meeting_date ?? '',
                old_meeting_time: jobItem.metadata?.old_meeting_time ?? '',
                dashboard_login_link: jobItem?.metadata?.event_login_link ?? '',
                event_logo: jobItem.metadata?.event_logo ?? '',
              })
            } else if (
              jobItem.type === CommonEnums.emailTypes.event_invite_to_user
            ) {
              await this.sendEventInviteToUser({
                subject: jobItem.subject,
                text: jobItem.text,
                to: jobItem.to,
                event_date: jobItem.metadata?.event_date ?? '',
                event_poster_url: jobItem.metadata?.event_poster_url ?? '',
                event_title: jobItem.metadata?.event_title ?? '',
                login_to_event_link: jobItem.metadata?.event_login_link ?? '',
                username: jobItem.metadata?.username ?? '',
                login_email: jobItem.metadata?.login_email ?? '',
                login_password: jobItem.metadata?.login_password ?? '',
                event_logo: jobItem.metadata?.event_logo ?? '',
                static_body_content:
                  jobItem.metadata?.static_body_content ?? '',
              })
            } else if (
              jobItem.type === CommonEnums.emailTypes.admin_reset_password
            ) {
              await this.sendResetPasswordEmailToAdmin({
                subject: jobItem.subject,
                text: jobItem.text,
                to: jobItem.to,
                event_login_link: jobItem.metadata?.event_login_link ?? '',
              })
            } else {
              await this.sendMail({
                greeting: jobItem.greeting,
                mail_content: jobItem.mail_content,
                subject: jobItem.subject,
                to: jobItem.to,
                text: jobItem.text,
              })
            }

            return jobItem._id.toString()
          } catch (err) {
            failedJobs.push(jobItem._id)
          }
        }

        emailJobPromises.push(sendEmail)
      })

      if (!emailJobPromises.length) {
        this.readingEmailJobsFile = false
        this.writingEmailJobsFile = false
        this.executingEmailJobs = false

        return false
      }

      const res = await Promise.all(emailJobPromises.map((_job) => _job()))

      await EmailJobsModel.deleteMany({ _id: { $in: res } })

      const updatedEmailJobs = await EmailJobsModel.find({}).lean().exec()

      if (!updatedEmailJobs.length) {
        this.stopFetchingEmailJobs()
      }

      this.stopEmailJobExecution()

      return true
    } catch (err) {
      console.log('Something went wrong')
      console.log(err)
    }
  }
}

export default EmailHelpers
