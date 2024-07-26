import { Request, Response } from 'express';
import multer from 'multer';
import { parseFile } from '../../utils/fileParser';
import { PeoplebulkUpload } from '../../services/people-bulk-upload.services';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../helpers/common';
import ResponseCodes from '../../utils/responseCodes';
import SponsorsModel, { sponsorsSchema } from '../../models/sponsors.model';
import DelegatesModel, { delegatesSchema } from '../../models/delegates.model';
import SpeakersModel, { speakersSchema } from '../../models/speakers.model';
import ExhibitorsModel, { exhibitorsSchema } from '../../models/exhibitors.model';
import MediaPartnersModel, { mediaPartnerSchema } from '../../models/media-partners.model';
import { createExcelFromJson, createExcelFromJsonWithoutUpload, uploadStaticFiles } from '../../utils/jsonToExcel';
import * as path from "path";
import { UploadsHelpers } from '../../helpers/uploads.helpers';
import fs from "fs";
const upload = multer();
const downloadSampleJson:any={
  "delegateSample":delegatesSchema,
  "sponsorSample":sponsorsSchema,
  "speakerSample":speakersSchema,
  "mediapartnerSample":mediaPartnerSchema,
  "exihibitorSample":exhibitorsSchema
}
export const handleBulkUpload = catchAsync(async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const usertype = req.query.usertype as string;
    if (!file) {
      return sendResponse({
        res,
        success: false,
        message: 'No file uploaded.',
        response_code: ResponseCodes.UPLOAD_FAILED,
      })
    }

    const data = await parseFile(file);
    const result = await PeoplebulkUpload(data, usertype);
    console.log("line 19", result)
    return sendResponse({
      res,
      success: true,
      message: `Successfully uploaded ${result?.created} new accounts, and updated ${result?.updated} existing accounts, and skipped ${result?.failed} accounts`,
      response_code: ResponseCodes.UPLOAD_SUCCESS,
    })
  } catch (error: any) {
    console.log("error", error)
    return sendResponse({
      res,
      success: false,
      message: error.message,
      response_code: ResponseCodes.FAILED,
    })
  }
});

export const exportHandle = catchAsync(async (req: Request, res: Response) => {
  let type = req.query.type;
  let data: any = []
  switch (type) {
    case 'sponsor':
      data = await SponsorsModel.aggregate([
        {
          $match: {

          }
        },
        {
          $lookup: {
            from: "events",
            localField: "events",
            foreignField: "_id",
            pipeline: [{
              $project: {
                name: 1,
                description: 1,
                venue_city: 1,
                status: 1,
                _id: 0
              }
            }],
            as: "events"
          }
        },
        {
          $addFields: {
            "UserType": "sponsor"
          }
        },
        {
          $project: {
            _id: 0,
            password: 0,
            is_phone_verified: 0,
            is_email_verified: 0,
            category: 0,
            company: 0,
            event_invites: 0,
            created_by: 0,
            last_login: 0,
            is_online: 0,
            user_type: 0
          }
        }
      ])
      break;
    case 'delegate':
      data = await DelegatesModel.aggregate([
        {
          $match: {

          }
        },
        {
          $lookup: {
            from: "events",
            localField: "events",
            foreignField: "_id",
            pipeline: [{
              $project: {
                name: 1,
                description: 1,
                venue_city: 1,
                status: 1,
                _id: 0
              }
            }],
            as: "events"
          }
        },
        {
          $addFields: {
            "UserType": "delegate"
          }
        },
        {
          $project: {
            _id: 0,
            password: 0,
            is_phone_verified: 0,
            is_email_verified: 0,
            category: 0,
            company: 0,
            event_invites: 0,
            created_by: 0,
            last_login: 0,
            is_online: 0,
            user_type: 0
          }
        }
      ])
      break;
    case 'speaker':
      data = await SpeakersModel.aggregate([
        {
          $match: {

          }
        },
        {
          $lookup: {
            from: "events",
            localField: "events",
            foreignField: "_id",
            pipeline: [{
              $project: {
                name: 1,
                description: 1,
                venue_city: 1,
                status: 1,
                _id: 0
              }
            }],
            as: "events"
          }
        },
        {
          $addFields: {
            "UserType": "speaker"
          }
        },
        {
          $project: {
            _id: 0,
            password: 0,
            is_phone_verified: 0,
            is_email_verified: 0,
            category: 0,
            company: 0,
            event_invites: 0,
            created_by: 0,
            last_login: 0,
            is_online: 0,
            user_type: 0
          }
        }
      ])
      break;
    case 'exhibitor':
      data = await ExhibitorsModel.aggregate([
        {
          $match: {

          }
        },
        {
          $lookup: {
            from: "events",
            localField: "events",
            foreignField: "_id",
            pipeline: [{
              $project: {
                name: 1,
                description: 1,
                venue_city: 1,
                status: 1,
                _id: 0
              }
            }],
            as: "events"
          }
        },
        {
          $addFields: {
            "UserType": "exhibitor"
          }
        },
        {
          $project: {
            _id: 0,
            password: 0,
            is_phone_verified: 0,
            is_email_verified: 0,
            category: 0,
            company: 0,
            event_invites: 0,
            created_by: 0,
            last_login: 0,
            is_online: 0,
            user_type: 0
          }
        }
      ])
      break;
    case 'mediaPartner':
      data = await MediaPartnersModel.aggregate([
        {
          $match: {

          }
        },
        {
          $lookup: {
            from: "events",
            localField: "events",
            foreignField: "_id",
            pipeline: [{
              $project: {
                name: 1,
                description: 1,
                venue_city: 1,
                status: 1,
                _id: 0
              }
            }],
            as: "events"
          }
        },
        {
          $addFields: {
            "UserType": "mediaPartner"
          }
        },
        {
          $project: {
            _id: 0,
            password: 0,
            is_phone_verified: 0,
            is_email_verified: 0,
            category: 0,
            company: 0,
            event_invites: 0,
            created_by: 0,
            last_login: 0,
            is_online: 0,
            user_type: 0
          }
        }
      ])
      break;
    default:
      break;
  }
  let peopleExport = await createExcelFromJson(data, `peopleExport${Date.now().toString(16)}.xlsx`);
  return sendResponse({
    res,
    data: peopleExport,
    success: true,
    message: 'Export.',
    response_code: ResponseCodes.SUCCESS,
  })
})

export const dowloadSamples = catchAsync(async (req: Request, res: Response) => {

  const type = req.query.type as string;
  const { fileName, columns } = req.body;
  const filePath = path.join('/public/static', `${fileName}.xlsx`);
  if (fs.existsSync(filePath)) {
    return sendResponse({
      res,
      data: path.join("static", `${fileName}.xlsx`),
      success: true,
      message: 'Export.',
      response_code: ResponseCodes.SUCCESS,
    })
  }else{
    console.log("downloadSampleJson[type]",downloadSampleJson[type]["tree"])
    if(downloadSampleJson[type]["tree"]){
      let treeObject:any={}
      for(let arr in downloadSampleJson[type]["tree"]){
        treeObject[arr]=""
      }
      
      let createFile:any=await createExcelFromJsonWithoutUpload([treeObject],type,"static");
      const uploadFile=await uploadStaticFiles({file: {
        originalname: type + '.xlsx',
        size: fs.statSync(createFile).size,
        mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        buffer: fs.readFileSync(createFile)
      },file_name:type});
      if(uploadFile){
        console.log("line 334",uploadFile,uploadFile?.file_url?.replace("/public/","").replace("public/",""))
        return sendResponse({
          res,
          data: uploadFile?.file_url?.replace("/public/","").replace("public/",""),
          success: true,
          message: 'Export.',
          response_code: ResponseCodes.SUCCESS,
        })
      }else{
        return sendResponse({
          res,
          data: null,
          success: false,
          message: 'Export.',
          response_code: ResponseCodes.FAILED,
        })
      }
    }
  }

  return sendResponse({
    res,
    data: filePath,
    success: true,
    message: 'Export.',
    response_code: ResponseCodes.SUCCESS,
  });
})

export const bulkUploadMiddleware = upload.single('file');
