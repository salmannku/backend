import {ErrorRequestHandler} from 'express'

export class APIError extends Error {
  code: string
  status: number
  error: any

  constructor({status, message, code, data}: { status: number, code: string, message: string, data?: any }) {
    super(message)

    this.name = this.constructor.name
    this.status = status
    this.error = data
    this.code = code

    Error.captureStackTrace(this, this.constructor)
  }
}

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // descriptive error code
  let errorCode

  if (err.status === 400) errorCode = 'BAD_REQUEST'
  if (err?.code) errorCode = err.code

  // log error only if unexpected
  if (!err?.status || `${err.status}`.startsWith('5'))
    console.error(err)

  res.status(err.status || 500).json({
    success: false,
    message: err.message,
    error: err?.error || err?.errors?.[0] || err?.name || null,
    code: errorCode || 'UNIDENTIFIED_ERROR'
  })

  next()
}

export default errorHandler
