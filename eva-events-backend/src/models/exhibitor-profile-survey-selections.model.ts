import mongoose, { Types } from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
import ProfileSurveyOptionsModel from './profile-survey-options.model'
import ProfileSurveySectionsModel from './profile-survey-sections.model'
import ExhibitorsModel from './exhibitors.model'

export interface IExhibitorProfileSurveySelectionsModelSchema {
  user: Types.ObjectId
  survey_option: Types.ObjectId
  profile_survey_section: Types.ObjectId
  selected: boolean
  text_input: string
  order: number
}

const exhibitorProfileSurveySelectionsSchema: any =
  new mongoose.Schema<IExhibitorProfileSurveySelectionsModelSchema>(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: ExhibitorsModel,
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

exhibitorProfileSurveySelectionsSchema.plugin(mongoosePaginate)

const ExhibitorProfileSurveySelectionsModel =
  mongoose.model<IExhibitorProfileSurveySelectionsModelSchema>(
    'exhibitor_profile_survey_selections',
    exhibitorProfileSurveySelectionsSchema
  )

export default ExhibitorProfileSurveySelectionsModel
