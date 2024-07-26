import mongoose, { Types } from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
import EventsModel from './events.model'
import { CommonEnums } from '../enums/common.enums'

export interface IEmailTemplatesMetadata {
  body_content: string
}

export interface IEmailTemplatesModelSchema {
  _id: Types.ObjectId
  event: Types.ObjectId
  user_type: string
  template_type: string
  metadata: IEmailTemplatesMetadata
  createdAt: Date
  updatedAt: Date
}

const emailTemplatesSchema = new mongoose.Schema<IEmailTemplatesModelSchema>(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: EventsModel,
    },
    metadata: {
      body_content: String,
    },
    user_type: {
      type: String,
      enum: [
        CommonEnums.users.delegate,
        CommonEnums.users.exhibitor,
        CommonEnums.users.media_partner,
        CommonEnums.users.speaker,
        CommonEnums.users.sponsor,
      ],
      default: '',
    },
    template_type: {
      type: String,
      enum: [CommonEnums.emailTypes.event_invite_to_user],
      default: '',
    },
  },
  { timestamps: true }
)

emailTemplatesSchema.plugin(mongoosePaginate)

const EmailTemplateModel = mongoose.model<IEmailTemplatesModelSchema>(
  'email_templates',
  emailTemplatesSchema
)

export default EmailTemplateModel
