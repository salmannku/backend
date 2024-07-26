import { v4 as uuidv4 } from 'uuid'
import fs from 'node:fs/promises'
import { FileLocationEnums } from '../utils/files.enums'

interface IaddLog {
  type: string
  error: any
  message: string
  metadata: any
}

export class ErrorLogsService {
  static generateErrorId = () => {
    return uuidv4()
  }

  /**
   * Types of error
   *
   * We can keep adding more types of error types here
   */
  static errorTypes = {
    SMS_SENT_ERROR: 'SMS_SENT_ERROR',
    AUTH_TOKEN_CREATION_FAILED: 'AUTH_TOKEN_CREATION_FAILED',
  }

  /**
   *
   * Create new error log
   */
  static addNewLog = async ({ type, error, message, metadata }: IaddLog) => {
    try {
      let errorId = this.generateErrorId()

      const errorLogFile = await fs.readFile(FileLocationEnums.logs.error, {
        encoding: 'utf8',
      })

      const errorLogs = JSON.parse(errorLogFile.toString())

      const newLog = {
        type,
        error,
        message,
        error_id: errorId,
        metadata,
        created_at: new Date().toISOString(), // ISO formatted date
      }

      errorLogs[errorId] = newLog

      await fs.writeFile(
        FileLocationEnums.logs.error,
        JSON.stringify(errorLogs),
        {
          encoding: 'utf8',
        }
      )

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
