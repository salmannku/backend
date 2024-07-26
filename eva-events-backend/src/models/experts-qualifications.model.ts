import mongoose from 'mongoose'

const expertsQualificationSchema = new mongoose.Schema(
  {
    institute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'institutes',
    },

    expert: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'experts',
    },

    title: {
      type: String,
    },

    area_of_study: {
      type: String,
    },

    from: {
      type: Date
    },

    // null acts as Present entry
    to: {
      type: Date,
      default: null
    },

    description: {
      type: String,
    }
  },
  {timestamps: true}
)

const ExpertQualification = mongoose.model(
  'expert_qualifications',
  expertsQualificationSchema
)

export default ExpertQualification
