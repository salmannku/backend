import dotenv from 'dotenv'
import { EmailJobsHelpers } from '../helpers/jobs.helpers'
import ResponseCodes from '../utils/responseCodes'
import { ErrorLogsService } from './errors.logs.services'

const { Vonage } = require('@vonage/server-sdk')

dotenv.config()

interface ISendSMS {
  to: string
  from: string
  text: string
}

interface IVonageBalanceResponse {
  autoReload: boolean
  value: number // Balance in EUR
}

const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET,
})

let lowBalanceAlert = false
let InsufficientBalanceAlert = false

export class SmsService {
  static sendSMS = async ({ to = '', from = '', text = '' }: ISendSMS) => {
    const vonageBalance: IVonageBalanceResponse =
      await vonage.accounts.getBalance()

    if (!lowBalanceAlert) {
      if (vonageBalance.value <= 0.1) {
        lowBalanceAlert = true
        InsufficientBalanceAlert = true

        EmailJobsHelpers.createNewJob({
          greeting: 'Dear System Admin,',
          mail_content: `<div>
                  <p>Insufficient balance at Vonage SMS service</p>
                  <p>Your current balance is <b>${vonageBalance.value} EUR.</b></p>
          <p><a href='${process.env.VONAGE_DASHBOARD_URL}'>Login to Vonage Dashboard</a></p>
                  </div>`,
          subject:
            'Mylo System Update - Insufficient balance at Vonage SMS service',
          to: process.env.SYSTEM_ADMIN_EMAIL_ADDRESS_AMIT as string,
          text: '',
          type: '',
        })
      } else if (vonageBalance.value < 1) {
        lowBalanceAlert = true
        InsufficientBalanceAlert = false

        EmailJobsHelpers.createNewJob({
          greeting: 'Dear System Admin,',
          mail_content: `<div>
            <p>Balance at Vonage SMS service is low</p>
            <p>Your current balance is <b>${vonageBalance.value} EUR.</b></p>
    <p><a href='${process.env.VONAGE_DASHBOARD_URL}'>Login to Vonage Dashboard</a></p>
            </div>`,
          subject: 'Mylo System Update - Balance at Vonage SMS service is low!',
          to: process.env.SYSTEM_ADMIN_EMAIL_ADDRESS_AMIT as string,
          text: '',
          type: '',
        })
      } else {
        lowBalanceAlert = false
      }
    }

    if (lowBalanceAlert) {
      if (vonageBalance.value > 1) {
        lowBalanceAlert = false
        InsufficientBalanceAlert = false
      }
    }

    if (InsufficientBalanceAlert) {
      return {
        success: false,
      }
    }
    try {
      await vonage.sms.send({ to, from, text })

      return {
        success: true,
      }
    } catch (err) {
      ErrorLogsService.addNewLog({
        error: err,
        message: `Sms sent failed to ${to}`,
        type: ErrorLogsService.errorTypes.SMS_SENT_ERROR,
        metadata: {
          message: 'Sending sms to phone number',
          to,
          text,
          from,
        },
      })
      return {
        success: false,
      }
    }
  }
}
