import mongoose, { Types } from 'mongoose'
import { CommonEnums } from '../enums/common.enums'
import EventsModel from './events.model'

export interface IExhibitionInfoModelSchema {
  general_information: string
  exhibition_stand_information: string
  additional_orders: string
  shipping_information: string
  exhibitor_insurance: string
  product_demos: string
  parking: string
  deadlines: string
  raising_your_profile: string
  marketing_graphics: string
  status: string
  event: Types.ObjectId
}

const exhibitionInfoSchema: any =
  new mongoose.Schema<IExhibitionInfoModelSchema>(
    {
      general_information: {
        type: String,
        default: '',
        trim: true,
      },
      exhibition_stand_information: {
        type: String,
        default: '',
        trim: true,
      },
      additional_orders: {
        type: String,
        default: '',
        trim: true,
      },
      shipping_information: {
        type: String,
        default: '',
        trim: true,
      },
      exhibitor_insurance: {
        type: String,
        default: '',
        trim: true,
      },
      product_demos: {
        type: String,
        default: '',
        trim: true,
      },
      parking: {
        type: String,
        default: '',
        trim: true,
      },
      deadlines: {
        type: String,
        default: '',
        trim: true,
      },
      raising_your_profile: {
        type: String,
        default: '',
        trim: true,
      },
      marketing_graphics: {
        type: String,
        default: '',
        trim: true,
      },

      // Reference to events
      event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: EventsModel,
      },

      // Possible statues for the roles are
      // ACTIVE, if active
      // DISABLED, if not active
      // BINNED, if removed temporarily
      status: {
        type: String,
        enum: [
          CommonEnums.status.ACTIVE,
          CommonEnums.status.DISABLED,
          CommonEnums.status.BINNED,
        ],
        default: CommonEnums.status.ACTIVE,
      },
    },
    { timestamps: true }
  )

const ExhibitionInfoModel = mongoose.model<IExhibitionInfoModelSchema>(
  'exhibition_infos',
  exhibitionInfoSchema
)

export default ExhibitionInfoModel
