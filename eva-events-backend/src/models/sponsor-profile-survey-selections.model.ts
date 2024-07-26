import mongoose, { Types } from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
import ProfileSurveyOptionsModel from './profile-survey-options.model'
import ProfileSurveySectionsModel from './profile-survey-sections.model'
import SponsorsModel from './sponsors.model'

export interface ISponsorProfileSurveySelectionsModelSchema {
  user: Types.ObjectId
  survey_option: Types.ObjectId
  profile_survey_section: Types.ObjectId
  selected: boolean
  text_input: string
  order: number
}

const sponsorProfileSurveySelectionsSchema: any =
  new mongoose.Schema<ISponsorProfileSurveySelectionsModelSchema>(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: SponsorsModel,
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

sponsorProfileSurveySelectionsSchema.plugin(mongoosePaginate)

const SponsorProfileSurveySelectionsModel =
  mongoose.model<ISponsorProfileSurveySelectionsModelSchema>(
    'sponsor_profile_survey_selections',
    sponsorProfileSurveySelectionsSchema
  )

export default SponsorProfileSurveySelectionsModel
