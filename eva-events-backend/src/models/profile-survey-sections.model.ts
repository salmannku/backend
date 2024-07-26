import mongoose, { Types } from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
import ProfileSurveyOptionsModel from './profile-survey-options.model'

export interface IProfileSurveySectionsModelSchema {
  section_title: string
  section_description: string
  survey_options: Types.ObjectId[]
  order: number
}

const profileSurveySectionsSchema: any =
  new mongoose.Schema<IProfileSurveySectionsModelSchema>(
    {
      section_title: {
        type: String,
        required: true,
        trim: true,
      },
      section_description: {
        type: String,
        default: '',
        trim: true,
      },
      order: {
        type: Number,
        required: true,
      },
      survey_options: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: ProfileSurveyOptionsModel,
        },
      ],
    },
    { timestamps: true }
  )

profileSurveySectionsSchema.plugin(mongoosePaginate)

const ProfileSurveySectionsModel =
  mongoose.model<IProfileSurveySectionsModelSchema>(
    'profile_survey_sections',
    profileSurveySectionsSchema
  )

export default ProfileSurveySectionsModel
