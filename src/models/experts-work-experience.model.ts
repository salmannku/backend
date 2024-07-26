import mongoose from 'mongoose'

const expertsWorkExperienceSchema = new mongoose.Schema(
  {
    expert: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'experts',
    },

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'companies',
    },

    country: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    from: {
      type: Date,
      required: true,
    },

    // null acts as Present entry
    to: {
      type: Date,
      default: null,
      required: false,
    },

    description: {
      type: String,
    }
  },
  {timestamps: true}
)

const ExpertWorkExperience = mongoose.model(
  'expert_work_experience',
  expertsWorkExperienceSchema
)

export default ExpertWorkExperience
