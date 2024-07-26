import mongoose, { Types } from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
import EventsModel from './events.model'
import DelegatesModel from './delegates.model'
import SpeakersModel from './speakers.model'
import ExhibitorsModel from './exhibitors.model'
import SponsorsModel from './sponsors.model'
import MediaPartnersModel from './media-partners.model'


export interface IEventLocationsModelSchema {
  _id: Types.ObjectId
  location_name: string
  assigned_to_multiple_ids: Types.ObjectId[]
  assigned_to_delegates: Types.ObjectId[]
  assigned_to_speakers: Types.ObjectId[]
  assigned_to_exhibitors: Types.ObjectId[]
  assigned_to_sponsors: Types.ObjectId[]
  assigned_to_media_partners: Types.ObjectId[]
  assigned_to_name: string
  user_type: string
  // location_code: string
  assigned_to: Types.ObjectId
  event_id: Types.ObjectId
}

const eventLocationSchema: any =
  new mongoose.Schema<IEventLocationsModelSchema>(
    {
      location_name: {
        type: String,
        required: true,
        trim: true,
      },
      // location_code: {
      //   type: String,
      //   default: '',
      //   trim: true,
      // },
      assigned_to_multiple_ids: [
	      {
	        type: mongoose.Schema.Types.ObjectId,
	      },
	  ],
      assigned_to_delegates: [
	      {
	        type: mongoose.Schema.Types.ObjectId,
	        ref: DelegatesModel,
	      },
	  ],
	  assigned_to_speakers: [
	      {
	        type: mongoose.Schema.Types.ObjectId,
	        ref: SpeakersModel,
	      },
	  ],
	  assigned_to_exhibitors: [
	      {
	        type: mongoose.Schema.Types.ObjectId,
	        ref: EventsModel,
	      },
	  ],
	  assigned_to_sponsors: [
	      {
	        type: mongoose.Schema.Types.ObjectId,
	        ref: SponsorsModel,
	      },
	  ],
	  assigned_to_media_partners: [
	      {
	        type: mongoose.Schema.Types.ObjectId,
	        ref: MediaPartnersModel,
	      },
	  ],
      assigned_to: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
      },
      assigned_to_name: {
        type: String,
        default: '',
        trim: true,
      },
      user_type: {
        type: String,
        default: '',
        trim: true,
      },
      event_id: { type: mongoose.Schema.Types.ObjectId, ref: EventsModel },
    },
    {
      timestamps: true,
    }
  )

eventLocationSchema.plugin(mongoosePaginate)

const EventLocationsModel = mongoose.model<IEventLocationsModelSchema>(
  'event_locations',
  eventLocationSchema
)

export default EventLocationsModel
