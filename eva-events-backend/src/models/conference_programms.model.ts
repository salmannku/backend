import mongoose, { Date, Types } from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
import SponsorsModel from './sponsors.model'

export interface IconferenceProgramsModelSchema {
  title: string
  subtitle: string
  date: Date
  time_from: Date
  time_to: Date
  description: string
  add_to_calender: boolean
  events: Types.ObjectId[]
  sponsors: Types.ObjectId[]
  _id: Types.ObjectId
}

const conferenceProgramsSchema: any =
  new mongoose.Schema<IconferenceProgramsModelSchema>(
    {
      title: {
        type: String,
        required: true,
        trim: true,
      },
      subtitle: {
        type: String,
        default: '',
        trim: true,
      },
      date: {
        type: Date,
        required: true,
        trim: true,
      },
      time_from: {
        type: Date,
        required: true,
        trim: true,
      },
      time_to: {
        type: Date,
        required: true,
        trim: true,
      },
      description: {
        type: String,
        default: '',
        trim: true,
      },
      add_to_calender: {
        type: Boolean,
        default: false,
      },
      events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'events' }],
      sponsors: [{ type: mongoose.Schema.Types.ObjectId, ref: SponsorsModel }],
    },
    { timestamps: true }
  )

conferenceProgramsSchema.plugin(mongoosePaginate)

const conferenceProgramsModel = mongoose.model<IconferenceProgramsModelSchema>(
  'conference_programs',
  conferenceProgramsSchema
)

export default conferenceProgramsModel
