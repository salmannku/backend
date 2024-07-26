import mongoose, { Types } from 'mongoose'
import { AdminStatus } from '../utils/adminEnums'
import mongoosePaginate from 'mongoose-paginate-v2'
import { CommonEnums } from '../enums/common.enums'
import RolesModel from './roles.model'

export interface ICountriesModelSchema {
  country_name: string
  country_code: string
}

const countriesSchema: any = new mongoose.Schema<ICountriesModelSchema>(
  {
    country_name: {
      type: String,
      required: true,
      trim: true,
    },
    country_code: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
  },
  { timestamps: true }
)

countriesSchema.plugin(mongoosePaginate)

const CountriesModel = mongoose.model<ICountriesModelSchema>(
  'countries',
  countriesSchema
)

export default CountriesModel
