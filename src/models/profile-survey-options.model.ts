import mongoose, { Types } from 'mongoose'
import { AdminStatus } from '../utils/adminEnums'
import mongoosePaginate from 'mongoose-paginate-v2'
import { CommonEnums } from '../enums/common.enums'
import RolesModel from './roles.model'
import ProfileSurveySectionsModel from './profile-survey-sections.model'

export interface IProfileSurveyOptionsModelSchema {
  option_title: string
  description: string
  option_type: string
  profile_survey_section_id: Types.ObjectId
  order: number
}

const profileSurveyOptionsSchema: any =
  new mongoose.Schema<IProfileSurveyOptionsModelSchema>(
    {
      option_title: {
        type: String,
        required: true,
        trim: true,
      },
      description: {
        type: String,
        default: '',
        trim: true,
      },
      order: {
        type: Number,
        required: true,
      },
      option_type: {
        type: String,
        enum: [
          CommonEnums.profileSurveyOptionTypes.CHECKBOX,
          CommonEnums.profileSurveyOptionTypes.INPUT,
        ],
        default: CommonEnums.profileSurveyOptionTypes.CHECKBOX,
      },
      profile_survey_section_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'profile_survey_sections',
        required: true,
      },
    },
    { timestamps: true }
  )

profileSurveyOptionsSchema.plugin(mongoosePaginate)

const ProfileSurveyOptionsModel =
  mongoose.model<IProfileSurveyOptionsModelSchema>(
    'profile_survey_options',
    profileSurveyOptionsSchema
  )

export default ProfileSurveyOptionsModel
