import SponsorsModel, { sponsorsSchema } from '../models/sponsors.model';
import DelegatesModel, { delegatesSchema } from '../models/delegates.model';
import SpeakersModel, { speakersSchema } from '../models/speakers.model';
import ExhibitorsModel, { exhibitorsSchema } from '../models/exhibitors.model';
import MediaPartnersModel, { mediaPartnerSchema } from '../models/media-partners.model';
import { UserServices } from './users.services';
import { SponsorsController } from '../controllers/admin/sponsors.controller';
import { SponsorValidations } from '../validations/sponsors.validations';
import Joi from 'joi';
import pick from '../utils/pick';
import { NextFunction } from "express";
import { format, parseFile, writeToPath } from 'fast-csv';
import { DelegateValidations } from '../validations/delegates.validations';
import { DelegateController } from '../controllers/admin/delegate.controller';
import { SpeakersController } from '../controllers/admin/speakers.controller';
import { SpeakerValidations } from '../validations/speakers.validations';
import { ExhibitorValidations } from '../validations/exhibitors.validations';
import { ExhibitorController } from '../controllers/admin/exhibitors.controller';
import { MediaPartnerValidations } from '../validations/media-partner.validations';
import { MediaPartnerController } from '../controllers/admin/media-partners.controller';
import { SponsorServices } from './sponsors.services';
import { DelegateServices } from './delegates.services';
import { SpeakerServices } from './speaker.services';
import { ExhibitorServices } from './exhibitors.services';
import { MediaPartnerServices } from './media-partner.services';
import CompaniesModel from '../models/companies.model';
import CategoriesModel from '../models/categories.model';
import path from 'path';
import fs from "fs";
export const PeopleObjects={
  "delegate":{
    "first_name": "",
    "last_name": "",
    "bio": null,
    "avatar": null,
    "email": "",
    "phone": "",
    "telephone": "",
    "phone_country_code": "",
    "city": "",
    "country": "",
    "zip": "",
    "address_line_1": null,
    "address_line_2": null,
    "delegate_URL": "",
    "delegate_linkedin": "",
    "job_title": "",
    "company_name": "",
    "category_name": "",
    // "user_type": "delegate",
  },
  "speaker":{
    "first_name": "",
    "last_name": "",
    "bio": "",
    "avatar": "",
    "email": "",
    "phone": "",
    "telephone": "",
    "phone_country_code": "",
    "city": "",
    "country": "",
    "zip": "",
    "address_line_1": "",
    "address_line_2": "",
    "speaker_URL": "",
    "speaker_linkedin": "",
    "job_title": "",
    "company_name": "",
    "category_name": "",
    // "user_type": "speaker",
  },
  "sponsor":{
    "sponsor_name": "",
    "sponsor_logo": "",
    "sponsor_description": "",
    "sponsor_URL": "",
    "sponsor_type": "",
    "representative_firstname": "",
    "representative_lastname": "",
    "phone": "",
    "telephone": "",
    "email": "",
    "phone_country_code": "",
    "sponsor_graphic": "",
    "city": "",
    "country": "",
    "zip": "",
    "state": "",
    "address_line_1": "",
    "address_line_2": "",
    "job_title": "",
    "company_name": "",
    "category_name": "",
    // "user_type": "sponsor",
  }
  ,
  "mediapartner":{
    "first_name": "",
    "last_name": "",
    "description": "",
    "logo": "",
    "email": "",
    "phone": "",
    "telephone": "",
    "phone_country_code": "",
    "mediapartner_URL": "",
    "job_title": "",
    "company_name": "",
    "category_name": "",
    // "user_type": "media_partner",
  },
  "exihibitor":{
    "exhibitor_name": "",
    "first_name": "",
    "last_name": "",
    "phone": "",
    "telephone": "",
    "email": "",
    "phone_country_code": "",
    "description": "",
    "exhibitor_logo": "",
    "city": "",
    "country": "",
    "zip": "",
    "address_line_1": "",
    "address_line_2": "",
    "exhibitor_URL": "",
    "job_title": "",
    "company_name": "",
    "category_name": "",
    // "user_type": "exhibitor",
  }  
}
export const PeoplebulkUpload = async (data: any[], usertype: string) => {
  const createArray: any[] = [];
  const updateArray: any[] = [];
  const failedArray: any[] = [];

  for (const item of data) {
    // if (!item.email || !item.first_name) {
      // failedArray.push(item);
      // continue;
    // }

    if (item["company_name"]) {
      let company: any = await createCompany({ company_name: item.company_name })
      item.company_id = (company?._id).toString();
      delete item["company_name"];
    }
    if (item["category_name"]) {
      let category: any = await createCategory({ category_name: item.category_name })
      item.category_id = (category?._id).toString();
      delete item["category_name"];
    }

    let email: string = item.email;
    const existingUser = await UserServices.getUserByEmail({ email });
    if (usertype) {
      item.UserType = usertype;
    }
    if (existingUser?._id) {
      item._id = existingUser?._id
      console.log("line t", item?._id, existingUser?._id)
      updateArray.push(item);
    } else {
      createArray.push(item);
    }
  }

  const createResults = await processArray(createArray, 'create');
  const updateResults = await processArray(updateArray, 'update');
  console.log("createResults", createResults, "updateResults", updateResults)
  const finalResults = [
    ...createResults,
    ...updateResults,
    ...failedArray.map(item => ({ ...item, status: 'failed', message: 'Missing required fields' }))
  ];
  console.log("68", finalResults)
  await writeResultsToCSV(finalResults);

  return {
    created: createResults.filter((result: any) => result.status === 'created').length,
    updated: updateResults.filter((result: any) => result.status === 'updated').length,
    failed: failedArray.length + createResults.filter((result: any) => result.status === 'failed').length + updateResults.filter((result: any) => result.status === 'failed').length,
  };
};

const processArray = async (array: any[], action: 'create' | 'update') => {
  const results = await Promise.all(array.map(item => processItem(item, action)));
  return results;
};

const processItem = async (item: any, action: 'create' | 'update') => {
  try {

    const userType = item.UserType;
    let selectedFields = getFilteredData(userType, item);
    if(item?.company_id) selectedFields.company_id = item?.company_id;
    if(item?.category_id) selectedFields.category_id = item?.category_id;
    console.log("selectedFields",selectedFields)
    let req = { body: selectedFields, params: { userType } } as any;
    const res = {} as any;

    const next: NextFunction = (err?: any) => {
      console.log("line 76", err)
      if (err) {
        throw new Error(err);
      }
      return
    };

    const validator = async (schema: any, req: any) => {
      const validSchema = pick(schema, ["params", "query", "body"]);
      const object = pick(req, Object.keys(validSchema));
      const { value, error } = Joi.compile(validSchema)
        .prefs({ errors: { label: "key" }, abortEarly: false })
        .validate(object);

      if (error) {
        const errorMessage = error.details
          .map((details) => details.message.replace(/"/g, ""))
          .join(", ");
        throw new Error(errorMessage);
      }
      Object.assign(req, value);
    };


    if (action === 'create') {
      if (userType === "sponsor") {
        console.log("line 101", "sponsor");

        await validator(SponsorValidations.createSponsor, req).then(async () => {
          let aa = await SponsorServices.addSponsor(req.user, selectedFields, "", res, (data: any) => data);

        }).catch(err => { throw err });
        return { status: 'created', data: item };
      }
      if (userType === "delegate") {

        await validator(DelegateValidations.createDelegate, req).then(async () => {

          await DelegateServices.addDelegateService(req.user, selectedFields, "", res, (data: any) => data);

        }).catch(err => { throw err });
        return { status: 'created', data: item };
      }
      if (userType === "speaker") {

        await validator(SpeakerValidations.createSpeaker, req).then(async () => {

          await SpeakerServices.addSpeaker(req.user, selectedFields, "", res, (data: any) => data);

        }).catch(err => { throw err });
        return { status: 'created', data: item };
      }
      if (userType === "exhibitor") {

        await validator(ExhibitorValidations.createExhibitor, req).then(async () => {

          await ExhibitorServices.addExhibitorsService(req.user, selectedFields, "", res, (data: any) => data);

        }).catch(err => { throw err });
        return { status: 'created', data: item };
      }
      if (userType === "mediaPartner") {

        await validator(MediaPartnerValidations.createMediaPartner, req).then(async () => {

          await MediaPartnerServices.addMediaPartner(req.user, selectedFields, "", res, (data: any) => data);

        }).catch(err => { throw err });
        return { status: 'created', data: item };
      }
    }

    if (action === 'update') {
      if (userType === "sponsor") {
        //params sponsor_id
        console.log("line t", item?._id)

        await validator(SponsorValidations.update, req).then(async () => {
          await SponsorServices.updateSponsor(item?._id, selectedFields, "", res, (data: any) => data);

        }).catch(err => { throw err });
        return { status: 'updated', data: item };
      }
      if (userType === "delegate") {
        await validator(DelegateValidations.update, req).then(async () => {
          //delegate_id
          await DelegateServices.updateDelegateService(item?._id, selectedFields, "", res, (data: any) => data);

        }).catch(err => { throw err });
        return { status: 'updated', data: item };
      }
      if (userType === "speaker") {
        await validator(SpeakerValidations.update, req).then(async () => {
          //speaker_id
          await SpeakerServices.updateSpeaker(item?._id, selectedFields, "", res, (data: any) => data);

        }).catch(err => { throw err });
        return { status: 'updated', data: item };
      }
      if (userType === "exhibitor") {

        await validator(ExhibitorValidations.updateExhibitor, req).then(async () => {

          //exhibitor_id
          await ExhibitorServices.updateExhibitorsService(item?._id, selectedFields, "", res, (data: any) => data);

        }).catch(err => { throw err });
        return { status: 'updated', data: item };
      }
      if (userType === "mediaPartner") {

        await validator(MediaPartnerValidations.update, req).then(async () => {

          //media_partner_id
          await MediaPartnerServices.updateMediaPartner(item?._id, selectedFields, "", res, (data: any) => data);

        }).catch(err => { throw err });
        return { status: 'updated', data: item };
      }
    }

  } catch (error: any) {
    return { status: 'failed', error: error.message };
  }
};

export const getModelByUserType = (userType: string): any => {
  switch (userType) {
    case 'sponsor':
      return SponsorsModel;
    case 'delegate':
      return DelegatesModel;
    case 'speaker':
      return SpeakersModel;
    case 'exhibitor':
      return ExhibitorsModel;
    case 'mediaPartner':
      return MediaPartnersModel;
    default:
      return null;
  }
};


const writeResultsToCSV = async (results: any[]) => {
  try {
    const dirPath = path.join(__dirname, '..', 'public', 'bulk-sample');
    const filePath = path.join(dirPath, `${new Date().toISOString()}-bulk_upload_results.csv`);

    // Ensure the directory exists
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const writableStream = fs.createWriteStream(filePath);
    const csvStream = format({ headers: true });

    writableStream.on('finish', () => {
      console.log('CSV file written successfully.');
    });

    writableStream.on('error', (error) => {
      console.error('Error writing CSV file:', error);
    });

    csvStream.pipe(writableStream);

    results.forEach((result: any) => {
      csvStream.write(result);
    });

    csvStream.end();
  } catch (error) {
    console.error('Error:', error);
  }
};

///getFieldsFromSchema
const getFieldsFromSchema = (schema: any) => {
  return Object.keys(schema.paths).filter(path => !path.startsWith('_'));
};
//extractFields
const extractFields = (sampleObj: any, mainObj: any) => {
  const result: any = {};
  for (const field in sampleObj) {
    if (sampleObj.hasOwnProperty(field) && mainObj.hasOwnProperty(field) && mainObj[field]?.toString()) {
      result[field] = mainObj[field]?.toString();
    }
  }
  return result;
};

const getFilteredData = (type: string, dataObject: any) => {
  let schema;
  console.log("type", type)
  switch (type) {
    case 'sponsor':
      schema = PeopleObjects.sponsor;
      break;
    case 'delegate':
      schema = PeopleObjects.delegate;
      break;
    case 'speaker':
      schema = PeopleObjects.speaker;
      break;
    case 'exhibitor':
      schema = PeopleObjects.exihibitor;
      break;
    case 'mediaPartner':
      schema = PeopleObjects.mediapartner;
      break;
    default: {
      throw new Error('Invalid type');
    }
  }
  return extractFields(schema,dataObject);
};

const createCompany = async (body: any) => {
  const {
    company_name,
    company_type = '',
    email = '',
    phone = '',
    phone_country_code = '',
    description = '',
    city = '',
    country = '',
    zip = '',
    address_line_1 = '',
  } = body;

  const existing = await CompaniesModel.findOne({
    company_name: company_name.trim(),
  })

  if (existing) {
    return existing;
  }

  const newCompany = await CompaniesModel.create({
    company_name,
    company_type,
    email,
    phone,
    phone_country_code,
    description,
    city,
    zip,
    country,
    address_line_1,
  })

  if (!newCompany) {
    return "Failed"
  }

  return newCompany;
}
const createCategory = async (body: any) => {
  const { category_name, description, status } = body

  const existing = await CategoriesModel.findOne({
    category_name: category_name.trim(),
  })

  if (existing) {
    return existing;
  }

  const newCategory = await CategoriesModel.create({
    category_name,
    description,
    // status,
  })

  if (!newCategory) {
    return "Failed"
  }

  return newCategory;
}