import { v4 as uuidv4 } from 'uuid'
import EmailJobsModel, { IEmailJobsMetadata } from '../models/email-jobs.model'
import EmailHelpers from './email.helpers'

interface ICreateNewJob {
  type?: string
  subject: string
  text?: string
  greeting?: string
  mail_content?: string
  to: string
  metadata?: IEmailJobsMetadata
}

export class EmailJobsHelpers {
  /**
   * Generate id for email job
   */
  static generateJobId = () => {
    return uuidv4()
  }

  /**
   * Create new job for email and add it to email.json file
   */
  static createNewJob = async ({
    type = '',
    subject = '',
    text = '',
    greeting = '',
    mail_content = '',
    metadata = {},
    to = '',
  }: ICreateNewJob) => {
    try {
      const newJob = {
        type,
        subject,
        text,
        greeting,
        mail_content,
        to,
        metadata,
      }

      const jobRes = await EmailJobsModel.create(newJob)

      if (!jobRes) {
        return {
          success: false,
          data: null,
        }
      }

      EmailHelpers.startFetchEmailJobs()

      return {
        success: true,
        data: null,
      }
    } catch (err) {
      return {
        success: false,
        data: err,
      }
    }
  }
}
