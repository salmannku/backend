import mongoose from 'mongoose'

export interface IEmailJobsMetadata {
  meeting_date?: string
  old_meeting_date?: string
  meeting_event_title?: string
  event_poster_url?: string
  meeting_requestor_user_name?: string
  meeting_requestor_company_name?: string
  meeting_notes?: string
  meeting_time?: string
  meeting_location?: string
  old_meeting_time?: string
  accept_meeting_link?: string
  reschedule_meeting_link?: string
  decline_meeting_link?: string
  meeting_location?: string
  meeting_link?: string
  meeting_description?: string
  meeting_attendees?: string[]
  username?: string
  event_date?: string
  event_title?: string
  event_login_link?: string
  login_password?: string
  login_email?: string
  event_logo?: string
  user_who_cancelled_the_meeting?: string
  user_company_name_who_cancelled_the_meeting?: string
  user_with_whom_meeting_is?: string
  user_company_name_with_whom_meeting_is?: string
  static_body_content?: string
}

export interface EmailJobsSchema {
  type: string
  subject: string
  text: string
  greeting: string
  mail_content: string
  metadata: IEmailJobsMetadata
  to: string
  created_at: Date
  updated_at: Date
}

const emailJobsSchema: any = new mongoose.Schema<EmailJobsSchema>(
  {
    type: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      trim: true,
      required: true,
    },
    text: {
      type: String,
      trim: true,
      default: '',
    },
    greeting: {
      type: String,
      trim: true,
      default: '',
    },
    mail_content: {
      type: String,
      trim: true,
      default: '',
    },
    metadata: {
      meeting_event_title: String,
      event_poster_url: String,
      meeting_date: String,
      meeting_location: String,
      old_meeting_date: String,
      meeting_requestor_user_name: String,
      meeting_requestor_company_name: String,
      meeting_notes: String,
      meeting_time: String,
      old_meeting_time: String,
      accept_meeting_link: String,
      reschedule_meeting_link: String,
      decline_meeting_link: String,
      meeting_location: String,
      meeting_link: String,
      meeting_description: String,
      username: String,
      event_date: String,
      event_login_link: String,
      event_title: String,
      login_password: String,
      login_email: String,
      event_logo: String,
      user_who_cancelled_the_meeting: String,
      user_company_name_who_cancelled_the_meeting: String,
      user_with_whom_meeting_is: String,
      user_company_name_with_whom_meeting_is: String,
      static_body_content: String,
      meeting_attendees: [
        {
          type: String,
        },
      ],
    },
    to: {
      type: String,
      trim: true,
      required: true,
    },
  },
  { timestamps: true }
)

const EmailJobsModel = mongoose.model<EmailJobsSchema>(
  'email_jobs',
  emailJobsSchema
)

export default EmailJobsModel
