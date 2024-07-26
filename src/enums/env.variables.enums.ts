import dotenv from 'dotenv'
dotenv.config({ path: `.env.${process.env.NODE_ENV}` })

export class EnvVariables {
  static meetingManagements = {
    minuteSteps: process.env.MINUTE_STEPS,
    adminEmailToSendEmailReports:
      process.env.ADMIN_EMAIL_TO_SEND_EMAIL_REPORTS?.trim() ?? '',
  }

  static events = {
    filesPath: process.env.EVENT_FILES_PATH?.trim() ?? '',
  }
}
