import mongoose, { Types } from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
import ProfileSurveyOptionsModel from './profile-survey-options.model'
import ProfileSurveySectionsModel from './profile-survey-sections.model'
import MediaPartnersModel from './media-partners.model'

export interface IMediaPartnerProfileSurveySelectionsModelSchema {
  user: Types.ObjectId
  survey_option: Types.ObjectId
  profile_survey_section: Types.ObjectId
  selected: boolean
  text_input: string
  order: number
}

const mediaPartnerProfileSurveySelectionsSchema: any =
  new mongoose.Schema<IMediaPartnerProfileSurveySelectionsModelSchema>(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: MediaPartnersModel,
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

mediaPartnerProfileSurveySelectionsSchema.plugin(mongoosePaginate)

const MediaPartnerProfileSurveySelectionsModel =
  mongoose.model<IMediaPartnerProfileSurveySelectionsModelSchema>(
    'media_partner_profile_survey_selections',
    mediaPartnerProfileSurveySelectionsSchema
  )

export default MediaPartnerProfileSurveySelectionsModel
