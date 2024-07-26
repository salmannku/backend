import { Response } from 'express'
import { v4 as uuid } from 'uuid'
import dotenv from 'dotenv'
import UploadsModel from '../models/uploads.model'
import ResponseCodes from '../utils/responseCodes'
import { CommonEnums } from '../enums/common.enums'
import fs from 'fs/promises'
import { CommonUtils } from '../utils/common.utils'

const sharp = require('sharp')

// env source required here too for some odd reason
dotenv.config({ path: `.env.${process.env.NODE_ENV}` })

// const fs = require('fs-extra')

class uploadController {
  static uploadFile = async (req: any, res: Response, next: any) => {
    const user = req?.user

    try {
      const promises = []
      const files: any[] = []
      const failures: number[] = []

      let uploadPath = CommonEnums.uploadPaths.static

      let uploadPromises: any = []

      let uploadFile = async (file: any) => {
        const index = req.files.indexOf(file)
        const identifier = `${file.filename}-${uuid()}`
        const fileSize = file.size
        const fileName = file.originalname
        const filetype = file.mimetype

        console.log('filetype', filetype)

        let extension = file.originalname.split('.').pop()

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
          user_id: user?.id,
        })

        // const answer:any = await Answer.findById(req.body.answer_id);
        // answer.attachments = [...answer.attachments, attachment._id];
        // answer.save();

        files.push(uploadRes)
      }

      for (const file of req.files) {
        uploadPromises.push(() => uploadFile(file))
      }

      await Promise.all(uploadPromises.map(async (promise: any) => promise()))

      return res.status(201).json({
        success: true,
        data: files,
        failed: failures.length,
        response_code: ResponseCodes.UPLOAD_SUCCESS,
        ...(failures.length && { failures }),
      })
    } catch (error) {
      res.status(500).json({
        error: error,
        success: false,
        response_code: ResponseCodes.UPLOAD_FAILED,
        message: `Internal Server Error: ${error}`,
      })
    }
  }

  // TODO: IMP FILE PERMS
  // anyone can delete any file?
  // should not be possible

  static deleteFile = async (req: any, res: Response, next: any) => {
    try {
      const items = req.body.upload_ids
      const failures: any = []

      let deletePromises = []

      const _deleteFile = async (upload_id: string) => {
        const upload = await UploadsModel.findOne({ _id: upload_id })

        if (!upload) {
          failures.push(upload_id)
        }

        let filePath = upload?.file_url

        await fs.unlink(filePath as string)

        await upload?.delete()
      }

      for (const id of items) {
        deletePromises.push(() => _deleteFile(id))
      }

      await Promise.all(deletePromises.map(async (promise: any) => promise()))

      return res.status(201).json({
        success: true,
        response_code: ResponseCodes.DELETE_SUCCESS,
        failed: failures.length,
        ...(failures.length && { failures }),
      })
    } catch (error) {
      res.status(500).json({
        error: error,
        success: false,
        response_code: ResponseCodes.DELETE_FAILED,
        message: `Internal Server Error: ${error}`,
      })
    }
  }
}

export default uploadController
