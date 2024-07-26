import mongoose from 'mongoose'

const placeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    state_code: {
      type: String,
      required: true,
      trim: true,
    },
    state_name: {
      type: String,
      required: true,
      trim: true,
    },
    country_code: {
      type: String,
      required: true,
      trim: true,
    },
    country_name: {
      type: String,
      required: true,
      trim: true,
    },
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
)

placeSchema.index({ name: 'text' })

const Place = mongoose.model('Places', placeSchema)

export default Place
