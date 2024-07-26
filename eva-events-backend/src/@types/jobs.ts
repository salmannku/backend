import { Types } from 'mongoose'
import { IEmailJobsMetadata } from '../models/email-jobs.model'

export interface EmailJobObject {
  type: string
  subject: string
  text: string
  greeting: string
  mail_content: string
  metadata: IEmailJobsMetadata
  to: string
  _id: Types.ObjectId
}
