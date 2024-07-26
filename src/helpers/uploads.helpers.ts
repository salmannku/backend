import { v4 as uuid } from 'uuid'
import dotenv from 'dotenv'
import UploadsModel, { IUploadsModelSchema } from '../models/uploads.model'
import { APIError } from '../middlewares/errorHandler.middleware'
import ResponseCodes from '../utils/responseCodes'
import { HttpStatusCode } from 'axios'
import { CommonEnums } from '../enums/common.enums'
import { CommonUtils } from '../utils/common.utils'

dotenv.config({ path: `.env.${process.env.NODE_ENV}` })

const fs = require('fs-extra')
const sharp = require('sharp')

export class UploadsHelpers {
  static uploadFile = async ({ file }: { file: any }) => {
    try {
      let uploadPath = CommonEnums.uploadPaths.static

      const identifier = `${file.filename}-${uuid()}`
      const fileSize = file.size
      const fileName = file.originalname
      const filetype = file.mimetype

      let extension = file.originalname.split('.').pop()

      let filePath = ''

      const uniqueSuffix = CommonUtils.generateUniqueId()

      const timeSuffix = Date.now()

      if (
        filetype === 'image/jpeg' ||
        filetype === 'image/jpg' ||
        filetype === 'image/png' ||
        filetype === 'image/tiff' ||
        filetype === 'image/jfif'
      ) {
        await CommonUtils.checkAndCreateDirectory(uploadPath)

        let ref = `${uniqueSuffix}-${timeSuffix}.webp`

        filePath = `${uploadPath}/${ref}`

        const { buffer, originalname } = file

        await sharp(buffer).webp({ quality: 40 }).toFile(filePath)
      } else {
        await CommonUtils.checkAndCreateDirectory(uploadPath)

        let ref = `${uniqueSuffix}-${timeSuffix}.${extension}`

        filePath = `${uploadPath}/${ref}`

        const { buffer, originalname } = file

        await fs.writeFile(`${uploadPath}/${ref}`, buffer)
      }

      const uploadRes = await UploadsModel.create({
        file_name: fileName,
        file_size: fileSize,
        file_url: filePath,
        bucket: '',
        key: identifier,
      })

      return uploadRes as unknown as IUploadsModelSchema
    } catch (error) {
      throw new APIError({
        message: 'Upload failed',
        code: ResponseCodes.UPLOAD_FAILED,
        status: HttpStatusCode.InternalServerError,
      })
    }
  }

  static uploadFileToStorage = async (params: {
    file: any
    user_id?: string
    event_id?: string
  }) => {
    let uploadPath = CommonEnums.uploadPaths.static

    const identifier = `${params.file.filename}-${uuid()}`
    const fileSize = params.file.size
    const fileName = params.file.originalname
    const filetype = params.file.mimetype

    console.log('filetype', filetype)

    let extension = params.file.originalname.split('.').pop()

    let filePath = ''

    const uniqueSuffix = CommonUtils.generateUniqueId()

    const timeSuffix = Date.now()

    // const readStream = fs.createReadStream(file.path)
    if (
      filetype === 'image/jpeg' ||
      filetype === 'image/jpg' ||
      filetype === 'image/png' ||
      filetype === 'image/tiff' ||
      filetype === 'image/jfif'
    ) {
      await CommonUtils.checkAndCreateDirectory(uploadPath)

      let ref = `${uniqueSuffix}-${timeSuffix}.webp`

      filePath = `${uploadPath}/${ref}`

      const { buffer, originalname } = params.file

      await sharp(buffer).webp({ quality: 40 }).toFile(filePath)
    } else {
      await CommonUtils.checkAndCreateDirectory(uploadPath)

      let ref = `${uniqueSuffix}-${timeSuffix}.${extension}`

      filePath = `${uploadPath}/${ref}`

      const { buffer, originalname } = params.file

      await fs.writeFile(`${uploadPath}/${ref}`, buffer)
    }

    let values: any = {
      file_name: fileName,
      file_size: fileSize,
      file_url: filePath,
      bucket: '',
      key: identifier,
    }

    if (params?.user_id) {
      values.user_id = params?.user_id
    }

    if (params?.event_id) {
      values.event_id = params?.event_id
    }

    const uploadRes = await UploadsModel.create(values)

    return uploadRes as unknown as IUploadsModelSchema
  }

  static uploadAvatar = async ({
    file,
    user_id,
  }: {
    file: any
    user_id?: string
  }) => {
    let uploadRes = await this.uploadFileToStorage({
      file,
      user_id: user_id ?? '',
    })

    if (!uploadRes) {
      return {
        success: false,
        uploadRecord: {
          file_url: '',
        },
      }
    }

    return {
      success: true,
      uploadRecord: uploadRes as unknown as IUploadsModelSchema,
    }
  }

  static uploadFeaturedImageForEvent = async ({
    file,
    event_id,
  }: {
    file: any
    event_id?: string
  }) => {
    let uploadRes = await this.uploadFileToStorage({
      file,
      event_id,
    })

    if (!uploadRes) {
      return {
        success: false,
        uploadRecord: {
          file_url: '',
        },
      }
    }

    return {
      success: true,
      uploadRecord: uploadRes as unknown as IUploadsModelSchema,
    }
  }

  static deleteUpload = async ({ image_url = '' }: { image_url: string }) => {
    if (!image_url) return true

    const upload = await UploadsModel.findOne({
      file_url: image_url.trim(),
    })

    if (!upload) {
      throw new APIError({
        code: ResponseCodes.NOT_FOUND,
        message: 'Upload not found',
        status: HttpStatusCode.NotFound,
      })
    }

    let filePath = upload?.file_url

    await fs.unlink(filePath as string)

    await upload?.delete()

    return true
  }
}
