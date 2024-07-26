import mongoose, { Types } from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
import DelegatesModel from './delegates.model'
import ProfileSurveyOptionsModel from './profile-survey-options.model'
import ProfileSurveySectionsModel from './profile-survey-sections.model'

export interface IDelegatesProfileSurveySelectionsModelSchema {
  user: Types.ObjectId
  survey_option: Types.ObjectId
  profile_survey_section: Types.ObjectId
  selected: boolean
  text_input: string
  order: number
}

const delegatesProfileSurveySelectionsSchema: any =
  new mongoose.Schema<IDelegatesProfileSurveySelectionsModelSchema>(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: DelegatesModel,
        required: true,
      },
      survey_option: {
        type: mongoose.Schema.Types.ObjectId,
        ref: ProfileSurveyOptionsModel,
        required: true,
      },
      profile_survey_section: {
        type: mongoose.Schema.Types.ObjectId,
        ref: ProfileSurveySectionsModel,
        required: true,
      },
      selected: {
        type: Boolean,
        default: false,
      },
      text_input: {
        type: String,
        default: '',
      },
      order: {
        type: Number,
        default: 0,
      },
    },
    { timestamps: true }
  )

delegatesProfileSurveySelectionsSchema.plugin(mongoosePaginate)

const DelegatesProfileSurveySelectionsModel =
  mongoose.model<IDelegatesProfileSurveySelectionsModelSchema>(
    'delegates_profile_survey_selections',
    delegatesProfileSurveySelectionsSchema
  )

export default DelegatesProfileSurveySelectionsModel
