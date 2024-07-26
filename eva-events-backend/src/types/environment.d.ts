import {Agenda} from 'agenda'
import * as Express from 'express'

export {}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DEV_DATABASE_URL: string,
      ACCESS_TOKEN_SECRET: string,
      FEATURED_LIST_CONSIDERATION: string,
      VIEW_PERIOD: string
      CATEGORIZE_URL: string
    }
  }
}
