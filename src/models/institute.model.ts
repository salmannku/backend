import mongoose from 'mongoose'
import {InstituteType} from '../utils/enums'

const instituteSchema = new mongoose.Schema(
  {
    logo: {
      type: String,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address_line1: {
      type: String,
    },
    address_line2: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    country: {
      type: String,
    },
    zip_code: {
      type: Number,
    },
    institute_type: {
      type: String,
      enum: [InstituteType.SCHOOL, InstituteType.COLLEGE],
    },
  },
  {timestamps: true}
)

const Institute = mongoose.model('institutes', instituteSchema)

export default Institute
