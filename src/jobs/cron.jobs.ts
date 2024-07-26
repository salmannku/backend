import EmailHelpers from '../helpers/email.helpers'

const cron = require('node-cron')

export class CronJobs {
  static StartEmailJobs = async () => {
    cron.schedule('*/10 * * * * *', () => {
      EmailHelpers.executeEmailJobs()
    })
  }
}
