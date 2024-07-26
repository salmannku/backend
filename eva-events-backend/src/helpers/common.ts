import { Response } from 'express'
import ResponseCodes from '../utils/responseCodes'
import { SocketErrors } from '../sockets/socket.enums'
import { v4 as uuidv4 } from 'uuid'
import { ErrorLogsService } from '../services/errors.logs.services'
import passwordGenerator from 'generate-password'

import dotenv from 'dotenv'
dotenv.config({ path: `.env.${process.env.NODE_ENV}` })

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
var crypto = require('crypto')
var assert = require('assert')

export const generateFiveDigitOtp = () => {
  return Math.floor(10000 + Math.random() * 90000)
}

export const getAttachementUrl = ({
  key,
  bucket,
}: {
  key: string
  bucket: string
}) => {
  const [_bucket, path, _] = bucket.split(/\/(.*)/s)
  const url = `https://${_bucket}.s3.amazonaws.com/${path}/${key}`
  return url
}

interface ISendResponse {
  res: Response
  res_code?: number
  success: boolean
  message?: string
  data?: any
  response_code?: string
  errors?: any
}

interface ISendSocketResponse {
  success: boolean
  message?: string
  data?: any
  response_code?: string
  errors?: any
}

interface ISocketSendValidationError {
  error: boolean
  message?: string
  required: Record<any, any>
  type?: string
}

export const sendResponse = ({
  res,
  res_code = 200,
  success = false,
  message = '',
  data = null,
  response_code = ResponseCodes.GET_SUCCESS,
  errors = undefined,
}: ISendResponse) => {
  if (errors) {
    return res.status(res_code).json({
      success,
      message,
      data,
      response_code,
      errors,
    })
  }

  return res.status(res_code).json({
    success,
    message,
    data,
    response_code,
  })
}

export const sendSocketResponse = ({
  success = false,
  message = '',
  data = null,
  response_code = ResponseCodes.GET_SUCCESS,
  errors = undefined,
}: ISendSocketResponse) => {
  if (errors) {
    return {
      success,
      message,
      data,
      response_code,
      errors,
    }
  }

  return {
    success,
    message,
    data,
    response_code,
  }
}

/**
 * sendSocketValidationError
 * This function we are using for sending the error responses from
 * socket handlers
 *
 */

export const sendSocketValidationError = ({
  error = true,
  message = 'Arguments are invalid',
  required = {},
  type = SocketErrors.argumentsValidationError,
}: ISocketSendValidationError) => {
  return {
    error,
    message,
    required,
    type,
  }
}

export class PasswordHelpers {
  /**
   * Generate new random password for users
   *
   */
  static autoGeneratePassword = async ({
    user_type,
  }: {
    user_type: string
  }) => {
    var password = passwordGenerator.generate({
      length: 10,
      numbers: true,
      lowercase: false,
      uppercase: true,
    })

    const encrypted = await bcrypt.hashSync(password, 10)

    return { password, encrypted }
  }

  static decodeUserPassword = async ({ password }: { password: string }) => {
    const encrypted = await bcrypt.hashSync(password.trim(), 10)

    return { password, encrypted }
  }

  static encryptPassword = async ({ password }: { password: string }) => {
    const encrypted = await bcrypt.hashSync(password.trim(), 10)

    return encrypted
  }

  static decryptPassword = async ({
    encryptedPassword,
  }: {
    encryptedPassword: string
  }) => {
    var decipher = crypto.createDecipher(
      process.env.CRYPTO_ALGORITHM,
      process.env.CRYPTO_SECRET
    )

    var decrypted =
      decipher.update(encryptedPassword, 'hex', 'utf8') + decipher.final('utf8')

    return decrypted
  }

  /**
   * Compare passwords
   *
   * returns true/false
   */
  static checkPasswords = ({
    input_password,
    password_from_db,
  }: {
    input_password: string
    password_from_db: string
  }) => {
    return bcrypt.compareSync(input_password, password_from_db)
  }

  static generatePasswordForEventPage = async () => {
    var password = passwordGenerator.generate({
      length: 10,
      numbers: true,
      uppercase: true,
      lowercase: false,
    })

    const encrypted = await bcrypt.hashSync(password.trim(), 10)

    return { password, encrypted }
  }

  static generateResetPasswordToken = () => {
    return crypto.randomBytes(25).toString('hex')
  }
}

export class JwtHelpers {
  /**
   * Generate new random password for users
   *
   */
  static createAuthTokensForUser = async ({
    payload,
    remember = false,
    expiry = '1w',
  }: {
    payload?: Record<any, any>
    remember?: boolean
    expiry?: string
  }) => {
    try {
      let _expiry = expiry
      let _expiryForRefreshToken = '2w'

      if (remember) {
        _expiry = '4w'
        _expiryForRefreshToken = '5w'
      }

      const accessToken = await jwt.sign(
        payload,
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: _expiry,
        }
      )

      const refreshToken = await jwt.sign(
        payload,
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: _expiryForRefreshToken,
        }
      )

      return {
        success: true,
        access_token: accessToken,
        refresh_token: refreshToken,
      }
    } catch (err) {
      await ErrorLogsService.addNewLog({
        error: '',
        message: 'Something went wrong while generating access token for user',
        metadata: {
          payload: {
            data: payload,
            remember,
            expiry,
          },
        },
        type: ErrorLogsService.errorTypes.AUTH_TOKEN_CREATION_FAILED,
      })
      console.log('Something went wrong while generating access token for user')
      console.log(err)
      return {
        success: false,
        access_token: '',
        refresh_token: '',
      }
    }
  }
}

export class UrlHelpers {
  static getAdminWebUrl = () => {
    if (process.env.PRODUCTION_ENV == 'true') return process.env.STAGING_ADMIN_WEB

    return process.env.ADMIN_WEB
  }

  static getWebUrl = () => {
    if (process.env.PRODUCTION_ENV == 'true') return process.env.STAGING_WEB_URL

    return process.env.EVA_FRONTEND_URL
  }

  static getLogoUrl = () => {
    return process.env.EVA_LOGO_FOR_EMAIL as string
  }

  static getImageUrl = (params: { image_url: string }) => {
    // let baseURL = 'https://api.eva-events.wolffox.in';
    let baseURL = process.env.FILES_ENDPOINT
    if (params.image_url) {
      let result = params.image_url.includes('https')
      if (result) {
        return params.image_url
      } else {
        const imageUrlArray = params.image_url?.split('/')
        let imageUrl = `${baseURL}/${imageUrlArray[1]}/${imageUrlArray[2]}`
        return imageUrl
      }
    } else {
      return ''
    }
  }
}
