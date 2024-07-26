import mongoose, {InferSchemaType} from 'mongoose'
import {PublicationStatus, PublicationType} from '../utils/enums'

const publicationsSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true
  },

  thumbnail: {
    type: String,
    trim: true
  },

  summary: {
    type: String,
    trim: true
  },

  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'experts',
    required: true,
  },

  // index type and status for faster queries

  type: {
    type: String,
    index: true,
    required: true,
    default: PublicationType.ARTICLE,
    enum: [PublicationType.ARTICLE]
  },

  status: {
    type: String,
    index: true,
    required: true,
    default: PublicationStatus.DRAFT,
    enum: [
      PublicationStatus.DRAFT,
      PublicationStatus.PUBLIC,
      PublicationStatus.PRIVATE
    ]
  },

  content: {
    type: String
  },

  revision_time: {
    type: Date
  },

  publication_time: {
    type: Date
  },

  views: {
    type: Number,
    required: true,
    default: 0
  }
}, {timestamps: true})

const Publication = mongoose.model('publications', publicationsSchema)

export default Publication
