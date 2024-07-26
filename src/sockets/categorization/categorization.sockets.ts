import { AppSocketServer } from '../../types/socketTypes'
import { SocketEvents } from '../socket.enums'
import dotenv from 'dotenv'

import io from 'socket.io-client'
import { UserSocketMethods } from '../web/web.sockets'

dotenv.config({ path: `.env.${process.env.NODE_ENV}` })

interface ICategorizationResult {
  job: string
  'category-label': string
  category: string
  confidence: string
  success: boolean
}

const categorizerSocketUrl = process.env.CATEGORIZE_SOCKET_URL_DEV

let categorizationSocketClient = io(categorizerSocketUrl as string, {
  transports: ['websocket'],
})

categorizationSocketClient.connect()

categorizationSocketClient.io.on('error', (error) => {
  console.log(
    'Error: socket.io client connection to categorization sockets: \n',
    error
  )
})

categorizationSocketClient.on('connect', () => {
  console.log(
    'socket.io client connection to categorization sockets: ',
    categorizationSocketClient.connected
  )

  categorizationSocketClient.on(
    SocketEvents.categorizer.result,
    (res: ICategorizationResult) => {
      console.log('categorization results:', res)
      UserSocketMethods.onCategorizationSuccess({
        category: res.category,
        category_label: res?.['category-label'],
        job_id: res.job,
        success: res.success,
      })
    }
  )
})

interface ICategorizeQuestion {
  job_id: string
  question: string
}

export class CategorizerSocketMethods {
  /**
   *
   * @param {{job_id: string, question: string}}
   *
   * job_id here can be generated manually
   *
   * @param question
   * question is the text of question to be categorized
   */

  static categorizeQuestion = async ({
    job_id,
    question,
  }: ICategorizeQuestion) => {
    categorizationSocketClient.emit(SocketEvents.categorizer.categorize, {
      job: job_id,
      prompt: question,
    })
  }
}
