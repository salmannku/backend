import mongoose, { Types } from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

export interface faqsModelSchema {
  question: string
  answer: string
  event_id: Types.ObjectId[]
}

const faqSchema: any = new mongoose.Schema<faqsModelSchema>(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
    },
    event_id: [{ type: mongoose.Schema.Types.ObjectId, ref: 'events' }],
  },
  {
    timestamps: true,
  }
)

faqSchema.plugin(mongoosePaginate)

const faqModel = mongoose.model<faqsModelSchema>('faqs', faqSchema)

export default faqModel
