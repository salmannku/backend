import mongoose, { InferSchemaType } from 'mongoose'
import { AvatarType, ExpertStatus } from '../utils/enums'
import Place from './places.model'

const briefFields = [
  'qualification_title',
  'qualification_area',
  'university_name',
  'university_location',
  'job_title',
  'workplace_name',
  'workplace_location',
  'expertise_area',
  'profession',
  'years_of_experience',
  'free_form'
]

const profileBriefSchema = new mongoose.Schema({
  ...Object.fromEntries(briefFields.map((x) => [x, { type: String }])),
  profile_title_format: {
    type: [{ type: String, enum: briefFields }]
  }
})

const predefinedSessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  // topic as a category
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'categories'
  },

  summary: {
    type: String,
    required: true
  },

  outline: [{
    type: String,
  }],

  cost: {
    price: Number,
    currency: String
  },

  duration: Number,

  sessions: {
    type: Number,
    required: true,
    default: 1
  },

  group: Boolean

  // TODO: availability
})

const expertsSchema = new mongoose.Schema(
  {
    // bio data

    first_name: {
      type: String,
      trim: true
    },
    last_name: {
      type: String,
      trim: true
    },
    prefix: {
      type: String,
      trim: true
    },

    birth_date: {
      type: Date
    },

    // credentials
    country_code: {
      type: Number,
      trim: true
    },

    phone: {
      type: Number,
      trim: true
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true
    },

    password: {
      type: String,
      select: false,
    },

    // TODO: IMPORTANT SALT PASSWORDS PLEASE
    salt: {
      type: String
    },

    avatar: {
      type: String,
      required: true,
      default: AvatarType.NONE,
      enum: [AvatarType.PUBLIC, AvatarType.NONE, AvatarType.PRIVATE]
    },

    // profile fields
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categories'
      }
    ],

    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categories'
      }
    ],

    brief: {
      type: profileBriefSchema,

      default: {
        profile_title_format: [
          'qualification_title',
          'university_name',
          'university_location'
        ]
      },

      required: true
    },

    profile_layout: {
      type: [
        {
          type: String,
          enum: ['summary', 'qualifications', 'work_experience']
        }
      ],
      default: ['summary', 'qualifications', 'work_experience']
    },

    status: {
      type: String,
      enum: [
        ExpertStatus.ACCEPTED,
        ExpertStatus.ACTIVE,
        ExpertStatus.INACTIVE,
        ExpertStatus.PENDING,
        ExpertStatus.REJECTED,
        ExpertStatus.ON_HOLD
      ]
    },

    summary: {
      type: String,
      trim: true
    },

    work_experience: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'expert_work_experience'
      }
    ],

    qualifications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'expert_qualifications'
      }
    ],

    // application-related fields
    // should later be moved to a separate collection
    admin_notes: {
      type: String
    },
    verified: {
      type: Boolean
    },
    resume: {
      type: String
    },

    assignee_admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'admins'
    },

    // profile overhaul
    sessions: [predefinedSessionSchema],

    language: [{
      code: String,
      fluency: {
        type: String,
        enum: ['conversational', 'fluent']
      }
    }],

    areas_of_knowledge: {
      type: [String],
      required: false
    },

    usual_pricing: {
      price: Number,
      currency: String,
      per: {
        type: String,
        enum: ['session', 'hour']
      }
    },

    meeting_method: [{
      type: String,
      enum: ['online', 'in-person']
    }],

    profile_location: {
      lat: Number,
      lon: Number,
      place_id: String,
      place_id_time: Date,
      address: [String],
      location_type: {
        type: String,
        enum: ['office', 'studio', 'workplace', 'clinic', 'other']
      }
    },

    treatment_approach: [{
      name: String,
      id: mongoose.Schema.Types.ObjectId
    }],

    specialities_expertise: [{
      name: String,
      id: mongoose.Schema.Types.ObjectId
    }],

    clientele: {
      age: [{
        type: String,
        enum: ['infant', 'teen', 'adult', 'elder']
      }],

      participants: [{
        type: String,
        enum: ['individual', 'family', 'group', 'couple']
      }]
    },


    // impl for future
    residences: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user_addresses'
      }
    ],
    latitude: {
      type: Number
    },
    longitude: {
      type: Number
    },
    years_of_experience: {
      type: Number
    },
    show_prefix: {
      type: Boolean,
      default: false
    },
    questionnaire: {
      type: Boolean,
      default: false
    },
    place: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Place
    },
    city: {
      type: String
    },
    state: {
      type: String
    },
    country: {
      type: String,
    },
    wallet: {
      type: String,
      ref: 'wallets',
    },
  },
  { timestamps: true }
)

export type ExpertType = InferSchemaType<typeof expertsSchema>

const Expert = mongoose.model('experts', expertsSchema)

export default Expert
