import { string } from 'joi'
import mongoose, { Types } from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
import { CommonEnums } from '../enums/common.enums'
import CategoriesModel from './categories.model'

export interface ICompaniesModelSchema {
  _id: Types.ObjectId
  company_name: string
  company_type: string
  email: string
  phone: string
  phone_country_code: string
  city: string
  country: string
  zip: string
  address_line_1: string
  address_line_2: string
  description: string
  status: string
  company_URL: string
  sponsor_type: Types.ObjectId
  sponsor_type_name: string
  company_logo: string
  bio: string
}

const companiesSchema: any = new mongoose.Schema<ICompaniesModelSchema>(
  {
    company_name: {
      type: String,
      required: true,
      trim: true,
    },
    company_type: {
      type: String,
      default: '',
      trim: true,
    },
    email: {
      type: String,
      default: '',
      trim: true,
    },
    phone: {
      type: String,
      default: '',
    },
    phone_country_code: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      required: false,
      default: '',
      trim: true,
    },

    // Address fields
    city: {
      type: String,
      required: false,
      default: '',
      trim: true,
    },
    country: {
      type: String,
      required: false,
      default: '',
      trim: true,
    },
    zip: {
      type: String,
      default: '',
      trim: true,
    },
    address_line_1: {
      type: String,
      default: '',
      trim: true,
    },
    address_line_2: {
      type: String,
      default: '',
      trim: true,
    },

    status: {
      type: String,
      enum: [CommonEnums.status.ACTIVE, CommonEnums.status.DEACTIVE],
      default: CommonEnums.status.ACTIVE,
    },
    company_URL: {
      type: String,
      default: '',
      trim: true,
    },
    sponsor_type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: CategoriesModel,
      default: null,
    },
    sponsor_type_name: {
      type: String,
      default: '',
      trim: true,
    },
    company_logo: {
      type: String,
      default: '',
      trim: true,
    },
    bio: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

companiesSchema.plugin(mongoosePaginate)

const CompaniesModel = mongoose.model<ICompaniesModelSchema>(
  'companies',
  companiesSchema
)

export default CompaniesModel
