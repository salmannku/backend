import { ObjectId } from 'mongodb'
import { CommonEnums } from '../enums/common.enums'
import CategoriesModel, {
  categoryModelSchema,
} from '../models/categories.model'
import CompaniesModel, {
  ICompaniesModelSchema,
} from '../models/companies.model'
import DelegatesProfileSurveySelectionsModel from '../models/delegates-profile-survey-selections.model'
import DelegatesModel from '../models/delegates.model'
import ExhibitorProfileSurveySelectionsModel from '../models/exhibitor-profile-survey-selections.model'
import ExhibitorsModel from '../models/exhibitors.model'
import MediaPartnerProfileSurveySelectionsModel from '../models/media-partner-profile-survey-selections.model'
import MediaPartnersModel from '../models/media-partners.model'
import ProfileSurveyOptionsModel from '../models/profile-survey-options.model'
import SpeakerProfileSurveySelectionsModel from '../models/speaker-profile-survey-selections.model'
import SpeakersModel from '../models/speakers.model'
import SponsorProfileSurveySelectionsModel from '../models/sponsor-profile-survey-selections.model'
import SponsorsModel from '../models/sponsors.model'
import mongoose, { Types } from 'mongoose'
import MeetingRequestsModel from '../models/meeting-requests.model'
import moment from 'moment'
import { EnvVariables } from '../enums/env.variables.enums'

export interface IUser {
  _id: Types.ObjectId
  first_name: string
  last_name: string
  username: string
  exhibitor_name: string
  media_partner_name: string
  bio: string
  avatar: string
  phone: string
  email: string
  phone_country_code: string
  password: string
  is_phone_verified: boolean
  is_email_verified: boolean
  created_by: Types.ObjectId
  status: string
  city: string
  country: string
  zip: string
  // state: string
  address_line_1: string
  address_line_2: string
  delegate_URL: string
  delegate_linkedin: string
  events: Types.ObjectId[]
  job_titles: Types.ObjectId[]
  companies: Types.ObjectId[]
  delegate_associations: Types.ObjectId[]
  profile_surveys: Types.ObjectId[]
  last_login: Date
  is_online: boolean
  user_type: string
  pa_name: string
  pa_email: string
  schedules: Types.ObjectId[]
  description: string
  exhibitor_logo: string
  exhibitor_URL: string
  sponsor_name: string
  sponsor_logo: string
  sponsor_description: string
  sponsor_URL: string
  representative_firstname: string
  representative_lastname: string
  sponsor_graphic: string
  company: ICompaniesModelSchema
  company_name: string
  category: categoryModelSchema
  category_name: string

  speaker_URL: string
  speaker_linkedin: string

  logo: string
  // city: string
  // country: string
  // zip: string
  // state: string
  // address_line_1: string
  // address_line_2: string
  mediapartner_URL: string

  createdAt: Date
  updatedAt: Date
}

export class UserServices {
  static fillSurveyOption = async ({
    user,
    option_id,
    checked = false,
    text_input = '',
  }: {
    user: any
    option_id: string
    checked?: boolean
    text_input?: string
  }) => {
    const userType = user?.user_type

    const option = await ProfileSurveyOptionsModel.findById(option_id.trim())

    if (!option) {
      return {
        success: false,
      }
    }

    let updateValues: any = {
      selected: checked,
      text_input,
    }

    let createValues = {
      profile_survey_section: option?.profile_survey_section_id,
      selected: checked,
      survey_option: option._id,
      text_input: text_input,
      user_type: userType,
      user: user?._id,
      order: option.order,
    }

    let updateRes: any

    let findQuery = {
      user: user._id,
      profile_survey_section: option?.profile_survey_section_id,
      survey_option: option?._id,
      order: option?.order,
    }

    if (userType === CommonEnums.users.delegate) {
      updateRes = await DelegatesProfileSurveySelectionsModel.findOneAndUpdate(
        findQuery,
        updateValues,
        {
          new: true,
        }
      )

      if (!updateRes) {
        updateRes = await DelegatesProfileSurveySelectionsModel.create(
          createValues
        )
      }
    }

    if (userType === CommonEnums.users.exhibitor) {
      updateRes = await ExhibitorProfileSurveySelectionsModel.findOneAndUpdate(
        findQuery,
        updateValues,
        {
          new: true,
        }
      )

      if (!updateRes) {
        updateRes = await ExhibitorProfileSurveySelectionsModel.create(
          createValues
        )
      }
    }

    if (userType === CommonEnums.users.sponsor) {
      updateRes = await SponsorProfileSurveySelectionsModel.findOneAndUpdate(
        findQuery,
        updateValues,
        {
          new: true,
        }
      )

      if (!updateRes) {
        updateRes = await SponsorProfileSurveySelectionsModel.create(
          createValues
        )
      }
    }

    if (userType === CommonEnums.users.media_partner) {
      updateRes =
        await MediaPartnerProfileSurveySelectionsModel.findOneAndUpdate(
          findQuery,
          updateValues,
          {
            new: true,
          }
        )

      if (!updateRes) {
        updateRes = await MediaPartnerProfileSurveySelectionsModel.create(
          createValues
        )
      }
    }

    if (userType === CommonEnums.users.speaker) {
      updateRes = await SpeakerProfileSurveySelectionsModel.findOneAndUpdate(
        findQuery,
        updateValues,
        {
          new: true,
        }
      )

      if (!updateRes) {
        updateRes = await SpeakerProfileSurveySelectionsModel.create(
          createValues
        )
      }
    }

    if (updateRes) {
      return true
    }

    return false
  }

  static getUserByEmail = async ({ email }: { email: any }) => {
    let user: any = null

    const query = {
      email,
    }

    const [delegate, exhibitors, speaker, sponsor, mediaPartner] =
      await Promise.all([
        DelegatesModel.findOne(query).select('+password'),
        ExhibitorsModel.findOne(query).select('+password'),
        SpeakersModel.findOne(query).select('+password'),
        SponsorsModel.findOne(query).select('+password'),
        MediaPartnersModel.findOne(query).select('+password'),
      ])

    user = delegate || exhibitors || speaker || sponsor || mediaPartner

    return user
  }

  static getUserName = (user: IUser) => {
    let username = ''

    if (user?.sponsor_name) {
      username = user.sponsor_name
      return username
    }

    if (user?.exhibitor_name) {
      username = user.exhibitor_name
      return username
    }

    if (user?.media_partner_name) {
      username = user.media_partner_name
      return username
    }

    if (user?.first_name) {
      username = user.first_name
    }

    if (user?.last_name) {
      if (username) username = username + ' ' + user?.last_name
      else username = user?.last_name

      return username
    }
  }

  static getUserById = async ({ user_id }: { user_id: any }) => {
    let user: any = null

    if (!user_id) return user

    const [delegate, exhibitor, speaker, sponsor, mediaPartner] =
      await Promise.all([
        DelegatesModel.findById(user_id)
          .populate({
            path: 'company',
            model: CompaniesModel,
          })
          .populate({
            path: 'category',
            model: CategoriesModel,
          })
          .lean(),
        ExhibitorsModel.findById(user_id)
          .populate({
            path: 'company',
            model: CompaniesModel,
          })
          .populate({
            path: 'category',
            model: CategoriesModel,
          })
          .lean(),
        SpeakersModel.findById(user_id)
          .populate({
            path: 'company',
            model: CompaniesModel,
          })
          .populate({
            path: 'category',
            model: CategoriesModel,
          })
          .lean(),
        SponsorsModel.findById(user_id)
          .populate({
            path: 'company',
            model: CompaniesModel,
          })
          .populate({
            path: 'category',
            model: CategoriesModel,
          })
          .lean(),
        MediaPartnersModel.findById(user_id)
          .populate({
            path: 'company',
            model: CompaniesModel,
          })
          .populate({
            path: 'category',
            model: CategoriesModel,
          })
          .lean(),
      ])

    user = delegate || exhibitor || speaker || sponsor || mediaPartner

    if (user) {
      user.avatar =
        delegate?.avatar ||
        exhibitor?.exhibitor_logo ||
        speaker?.avatar ||
        sponsor?.sponsor_logo ||
        mediaPartner?.logo ||
        ''
    }

    if (sponsor && user) {
      user.first_name = sponsor.sponsor_name
    }

    if (user) {
      user.username = this.getUserName(user)
    }

    return user as IUser
  }

  static getUserRecordById = async ({ user_id }: { user_id: any }) => {
    let user: any = null

    if (!user_id) return user

    const [delegate, exhibitor, speaker, sponsor, mediaPartner] =
      await Promise.all([
        DelegatesModel.findById(user_id).populate({
          path: 'company',
          model: CompaniesModel,
        }),
        ExhibitorsModel.findById(user_id).populate({
          path: 'company',
          model: CompaniesModel,
        }),
        SpeakersModel.findById(user_id).populate({
          path: 'company',
          model: CompaniesModel,
        }),
        SponsorsModel.findById(user_id).populate({
          path: 'company',
          model: CompaniesModel,
        }),
        MediaPartnersModel.findById(user_id).populate({
          path: 'company',
          model: CompaniesModel,
        }),
      ])

    user = delegate || exhibitor || speaker || sponsor || mediaPartner

    if (user) {
      user.avatar =
        delegate?.avatar ||
        exhibitor?.exhibitor_logo ||
        speaker?.avatar ||
        sponsor?.sponsor_logo ||
        mediaPartner?.logo ||
        ''
    }

    if (sponsor && user) {
      user.first_name = sponsor.sponsor_name
    }

    user.username = this.getUserName(user)

    return user as IUser
  }

  static getUserColleaguesForEvent = async ({
    company_id,
    event_id,
    user_id,
  }: {
    company_id: string
    event_id: string
    user_id: string
  }) => {
    // const query = {
    //   $and: [
    //     {
    //       // company: new ObjectId(company_id),
    //       company: {
    //         $eq: company_id,
    //       },
    //     },
    //     {
    //       event_invites: new ObjectId(event_id),
    //     },
    //     {
    //       _id: {
    //         $ne: user_id,
    //       },
    //     },
    //   ],
    //   // company: new ObjectId(company_id),
    //   // event_invites: new ObjectId(event_id),
    // }

    const query = {
      company: company_id,
      event_invites: new ObjectId(event_id),
      _id: {
        $ne: user_id,
      },
    }

    const [delegates, exhibitors, speakers, sponsors, mediaPartners] =
      await Promise.all([
        DelegatesModel.find(query)
          .populate({
            path: 'company',
            model: CompaniesModel,
          })
          .populate({
            path: 'category',
            model: CategoriesModel,
          })
          .lean(),
        ExhibitorsModel.find(query)
          .populate({
            path: 'company',
            model: CompaniesModel,
          })
          .populate({
            path: 'category',
            model: CategoriesModel,
          })
          .lean(),
        SpeakersModel.find(query)
          .populate({
            path: 'company',
            model: CompaniesModel,
          })
          .populate({
            path: 'category',
            model: CategoriesModel,
          })
          .lean(),
        SponsorsModel.find(query)
          .populate({
            path: 'company',
            model: CompaniesModel,
          })
          .populate({
            path: 'category',
            model: CategoriesModel,
          })
          .lean(),
        MediaPartnersModel.find(query)
          .populate({
            path: 'company',
            model: CompaniesModel,
          })
          .populate({
            path: 'category',
            model: CategoriesModel,
          })
          .lean(),
      ])

    const users = [
      ...delegates,
      ...exhibitors,
      ...speakers,
      ...sponsors,
      ...mediaPartners,
    ]

    return users
  }

  static getBookedMeetingSchedules = async (params: {
    event_id: string
    user_id: string
    date: string
    participant_users: string[]
  }) => {
    let query: any = {}

    let orQueryParams: any = []

    let updatedDate = params.date.split('T')?.[0]

    orQueryParams.push({
      event: params.event_id?.trim(),
      requestor: params.user_id?.trim(),
      meeting_date: {
        $gte: moment(updatedDate).toDate(),
        $lte: moment(updatedDate).add(1, 'days').toDate(),
      },
      meeting_status: {
        $in: [
          CommonEnums.meetingStatus.accepted,
          CommonEnums.meetingStatus.pending,
          CommonEnums.meetingStatus.rescheduled,
        ],
      },
    })

    orQueryParams.push({
      event: params.event_id?.trim(),
      requested_users_details: {
        $elemMatch: {
          user_id: params.user_id?.trim(),
          meeting_status: {
            $in: [
              CommonEnums.meetingStatus.accepted,
              CommonEnums.meetingStatus.pending,
              CommonEnums.meetingStatus.rescheduled,
            ],
          },
        },
      },
      meeting_date: {
        $gte: moment(updatedDate).toDate(),
        $lte: moment(updatedDate).add(1, 'days').toDate(),
      },
      meeting_status: {
        $in: [
          CommonEnums.meetingStatus.accepted,
          CommonEnums.meetingStatus.pending,
          CommonEnums.meetingStatus.rescheduled,
        ],
      },
    })

    if (params.participant_users?.length) {
      params.participant_users.forEach((participant_id) => {
        orQueryParams.push({
          event: params.event_id?.trim(),
          requestor: participant_id?.trim(),
          meeting_date: {
            $gte: moment(updatedDate).toDate(),
            $lte: moment(updatedDate).add(1, 'days').toDate(),
          },
          meeting_status: {
            $in: [
              CommonEnums.meetingStatus.accepted,
              CommonEnums.meetingStatus.pending,
              CommonEnums.meetingStatus.rescheduled,
            ],
          },
        })

        orQueryParams.push({
          event: params.event_id?.trim(),
          requested_users_details: {
            $elemMatch: {
              user_id: participant_id?.trim(),
              meeting_status: {
                $in: [
                  CommonEnums.meetingStatus.accepted,
                  CommonEnums.meetingStatus.pending,
                  CommonEnums.meetingStatus.rescheduled,
                ],
              },
            },
          },
          meeting_date: {
            $gte: moment(updatedDate).toDate(),
            $lte: moment(updatedDate).add(1, 'days').toDate(),
          },
          meeting_status: {
            $in: [
              CommonEnums.meetingStatus.accepted,
              CommonEnums.meetingStatus.pending,
              CommonEnums.meetingStatus.rescheduled,
            ],
          },
        })
      })
    }

    // orQueryParams.push({
    //   event: '65d9e5359686c6e93975d215',
    //   requestor: '66125c768e2737ab6b7b6448',
    //   meeting_date: {
    //     $gte: moment('2024-02-27T12:44:33.000Z').toDate(),
    //     $lte: moment('2024-02-27T12:44:33.000Z').add(1, 'days').toDate(),
    //   },
    //   meeting_status: {
    //     $in: [
    //       CommonEnums.meetingStatus.accepted,
    //       CommonEnums.meetingStatus.pending,
    //       CommonEnums.meetingStatus.rescheduled,
    //     ],
    //   },
    // })

    // orQueryParams.push({
    //   event: '65d9e5359686c6e93975d215',
    //   requested_users_details: {
    //     $elemMatch: {
    //       user_id: '66125c768e2737ab6b7b6448',
    //       // meeting_status: CommonEnums.meetingStatus.accepted,
    //       meeting_status: {
    //         $in: [
    //           CommonEnums.meetingStatus.accepted,
    //           CommonEnums.meetingStatus.pending,
    //           CommonEnums.meetingStatus.rescheduled,
    //         ],
    //       },
    //     },
    //   },
    //   meeting_date: {
    //     $gte: moment('2024-02-27T12:44:33.000Z').toDate(),
    //     $lte: moment('2024-02-27T12:44:33.000Z').add(1, 'days').toDate(),
    //   },
    //   meeting_status: {
    //     $in: [
    //       CommonEnums.meetingStatus.accepted,
    //       CommonEnums.meetingStatus.pending,
    //       CommonEnums.meetingStatus.rescheduled,
    //     ],
    //   },
    // })

    query['$or'] = orQueryParams

    const meetings = await MeetingRequestsModel.find(query)
      .select('meeting_start_time meeting_end_time meeting_date')
      .lean()

    // const meetings = [
    //   {
    //     meeting_start_time: '2024-02-26T12:00:00.000Z',
    //     meeting_end_time: '2024-02-26T12:30:00.000Z',
    //   },
    //   {
    //     meeting_start_time: '2024-02-26T02:00:00.000Z',
    //     meeting_end_time: '2024-02-26T03:30:00.000Z',
    //   },
    //   {
    //     meeting_start_time: '2024-02-26T18:00:00.000Z',
    //     meeting_end_time: '2024-02-26T19:40:00.000Z',
    //   },
    //   {
    //     meeting_start_time: '2024-02-26T20:20:00.000Z',
    //     meeting_end_time: '2024-02-26T21:00:00.000Z',
    //   },
    // ]

    // return meetings

    let alreadyAddedDate: string[] = []
    let days: any = []

    let totalMinutes: number[] = []

    let minSteps = Number(EnvVariables.meetingManagements.minuteSteps)

    let mitTotal = 0

    for (let i = 1; mitTotal < 60; i++) {
      mitTotal += 5
      totalMinutes.push(mitTotal)
    }

    let bookedHours = []
    let selectedHours = []
    let bookedMinutes = []

    let bookedTimes = [
      {
        start: '2024-05-29T06:30:00.364+00:00',
        end: '2024-05-29T07:00:00.364+00:00',
      },
      {
        start: '2024-05-29T06:00:00.364+00:00',
        end: '2024-05-29T06:20:00.364+00:00',
      },

      // for above meeting i need to disable the minutes from 0 to 20+10 of hour 6

      {
        start: '2024-05-29T08:00:00.364+00:00',
        end: '2024-05-29T08:30:00.364+00:00',
      },

      // for above meeting i need to disable the minutes from 0 to 30+10 of hour 8

      {
        start: '2024-05-29T09:00:00.364+00:00',
        end: '2024-05-29T10:00:00.364+00:00',
      },
      {
        start: '2024-05-29T09:30:00.364+00:00',
        end: '2024-05-29T10:30:00.364+00:00',
      },
    ]

    let _usedHours: any[] = []
    let _usedMinutes: any[] = []

    let _bookedHours: any = {
      // 1: {
      //   hour: 1,
      //   disabled_minutes: [],
      //   is_hour_disabled: false,
      // },
    }

    // const disableHours = async (params: { hour: number }) => {
    //   let hourRecord = _bookedHours[params?.hour]

    //   if (hourRecord) {
    //     let disabledMinutes = hourRecord.disabled_minutes

    //     let minCounts = 60 / minSteps

    //     if (disabledMinutes.length >= minCounts) {
    //       hourRecord.is_hour_disabled = true
    //     } else {
    //       hourRecord.is_hour_disabled = false
    //     }

    //     _bookedHours[params?.hour] = hourRecord
    //   }
    // }

    // for (let i = 0; i < meetings.length; i++) {
    //   let startTimeHours = moment(meetings[i].meeting_start_time)
    //     .utc()
    //     .get('hours')
    //   let startTimeMins = moment(meetings[i].meeting_start_time)
    //     .utc()
    //     .get('minutes')

    //   let endTimeHours = moment(meetings[i].meeting_end_time).utc().get('hours')
    //   let endTimeMins = moment(meetings[i].meeting_end_time)
    //     .utc()
    //     .get('minutes')

    //   let hourDiff = endTimeHours - startTimeHours

    //   /**
    //    * Calculations for start hours
    //    */

    //   if (_usedHours.includes(startTimeHours)) {
    //     let disabledMinutes = _bookedHours[startTimeHours]?.disabled_minutes

    //     if (startTimeHours === endTimeHours) {
    //       for (let _minute = startTimeMins; _minute <= endTimeMins; ) {
    //         if (!disabledMinutes.includes(_minute)) {
    //           disabledMinutes.push(_minute)
    //         }

    //         _minute += 5
    //       }
    //       _bookedHours[startTimeHours].disabled_minutes = disabledMinutes

    //       console.log('disabledMinutes', disabledMinutes)
    //     }

    //     if (startTimeHours !== endTimeHours) {
    //       if (_usedHours.includes(endTimeHours)) {
    //         let disabledMinutesForStartHours =
    //           _bookedHours[startTimeHours]?.disabled_minutes
    //         let disabledMinutesForEndHours =
    //           _bookedHours[endTimeHours]?.disabled_minutes

    //         for (let _minute = startTimeMins; _minute <= 60; ) {
    //           if (!disabledMinutesForStartHours.includes(_minute)) {
    //             disabledMinutesForStartHours.push(_minute)
    //           }

    //           _minute += minSteps
    //         }

    //         _bookedHours[startTimeHours].disabled_minutes =
    //           disabledMinutesForStartHours

    //         for (let _minute = 0; _minute <= endTimeMins; ) {
    //           if (!disabledMinutesForEndHours.includes(_minute)) {
    //             disabledMinutesForEndHours.push(_minute)
    //           }

    //           _minute += minSteps
    //         }

    //         _bookedHours[endTimeHours].disabled_minutes =
    //           disabledMinutesForEndHours
    //       }

    //       if (!_usedHours.includes(endTimeHours)) {
    //         _usedHours.push(endTimeHours)

    //         _bookedHours[endTimeHours] = {
    //           hour: endTimeHours,
    //           disabled_minutes: [],
    //         }

    //         let disabledMinutesForStartHours =
    //           _bookedHours[startTimeHours]?.disabled_minutes
    //         let disabledMinutesForEndHours: any[] = []

    //         for (let _minute = startTimeMins; _minute <= 60; ) {
    //           if (!disabledMinutesForStartHours.includes(_minute)) {
    //             disabledMinutesForStartHours.push(_minute)
    //           }

    //           _minute += minSteps
    //         }

    //         _bookedHours[startTimeHours].disabled_minutes =
    //           disabledMinutesForStartHours

    //         for (let _minute = 0; _minute <= endTimeMins; ) {
    //           if (!disabledMinutesForEndHours.includes(_minute)) {
    //             disabledMinutesForEndHours.push(_minute)
    //           }

    //           _minute += minSteps
    //         }

    //         _bookedHours[endTimeHours].disabled_minutes =
    //           disabledMinutesForEndHours
    //       }
    //     }
    //   }

    //   if (!_usedHours.includes(startTimeHours)) {
    //     _usedHours.push(startTimeHours)

    //     _bookedHours[startTimeHours] = {
    //       hour: startTimeHours,
    //       disabled_minutes: [],
    //     }

    //     let disabledMinutes: any[] =
    //       _bookedHours[startTimeHours]?.disabled_minutes

    //     if (startTimeHours === endTimeHours) {
    //       for (let _minute = startTimeMins; _minute <= endTimeMins; ) {
    //         if (!disabledMinutes.includes(_minute)) {
    //           disabledMinutes.push(_minute)
    //         }

    //         _minute += minSteps
    //       }
    //       _bookedHours[startTimeHours].disabled_minutes = disabledMinutes
    //     }

    //     if (startTimeHours !== endTimeHours) {
    //       if (_usedHours.includes(endTimeHours)) {
    //         let disabledMinutesForStartHours =
    //           _bookedHours[startTimeHours]?.disabled_minutes
    //         let disabledMinutesForEndHours =
    //           _bookedHours[endTimeHours]?.disabled_minutes

    //         for (let _minute = startTimeMins; _minute <= 60; ) {
    //           if (!disabledMinutesForStartHours.includes(_minute)) {
    //             disabledMinutesForStartHours.push(_minute)
    //           }

    //           _minute += minSteps
    //         }

    //         _bookedHours[startTimeHours].disabled_minutes =
    //           disabledMinutesForStartHours

    //         for (let _minute = 0; _minute <= endTimeMins; ) {
    //           if (!disabledMinutesForEndHours.includes(_minute)) {
    //             disabledMinutesForEndHours.push(_minute)
    //           }

    //           _minute += minSteps
    //         }

    //         _bookedHours[endTimeHours].disabled_minutes =
    //           disabledMinutesForEndHours
    //       }

    //       if (!_usedHours.includes(endTimeHours)) {
    //         _usedHours.push(endTimeHours)

    //         _bookedHours[endTimeHours] = {
    //           hour: endTimeHours,
    //           disabled_minutes: [],
    //         }

    //         let disabledMinutesForStartHours =
    //           _bookedHours[startTimeHours]?.disabled_minutes ?? []
    //         let disabledMinutesForEndHours: any[] = []

    //         for (let _minute = startTimeMins; _minute <= 60; ) {
    //           if (!disabledMinutesForStartHours.includes(_minute)) {
    //             disabledMinutesForStartHours.push(_minute)
    //           }

    //           _minute += minSteps
    //         }

    //         _bookedHours[startTimeHours].disabled_minutes =
    //           disabledMinutesForStartHours

    //         for (let _minute = 0; _minute <= endTimeMins; ) {
    //           if (!disabledMinutesForEndHours.includes(_minute)) {
    //             disabledMinutesForEndHours.push(_minute)
    //           }

    //           _minute += minSteps
    //         }

    //         _bookedHours[endTimeHours].disabled_minutes =
    //           disabledMinutesForEndHours
    //       }
    //     }
    //   }

    //   /**
    //    * Calculations for end hours
    //    */

    //   if (_usedHours.includes(endTimeHours)) {
    //     let disabledMinutes = _bookedHours[endTimeHours]?.disabled_minutes

    //     if (startTimeHours === endTimeHours) {
    //       for (let _minute = startTimeMins; _minute <= endTimeMins; ) {
    //         if (!disabledMinutes.includes(_minute)) {
    //           disabledMinutes.push(_minute)
    //         }

    //         _minute += minSteps
    //       }

    //       _bookedHours[endTimeHours].disabled_minutes = disabledMinutes
    //     }

    //     if (startTimeHours !== endTimeHours) {
    //       if (_usedHours.includes(startTimeHours)) {
    //         let disabledMinutesForStartHours =
    //           _bookedHours[startTimeHours]?.disabled_minutes
    //         let disabledMinutesForEndHours =
    //           _bookedHours[endTimeHours]?.disabled_minutes

    //         for (let _minute = startTimeMins; _minute <= 60; ) {
    //           if (!disabledMinutesForStartHours.includes(_minute)) {
    //             disabledMinutesForStartHours.push(_minute)
    //           }

    //           _minute += minSteps
    //         }

    //         _bookedHours[startTimeHours].disabled_minutes =
    //           disabledMinutesForStartHours

    //         for (let _minute = 0; _minute <= endTimeMins; ) {
    //           if (!disabledMinutesForEndHours.includes(_minute)) {
    //             disabledMinutesForEndHours.push(_minute)
    //           }

    //           _minute += minSteps
    //         }

    //         _bookedHours[endTimeHours].disabled_minutes =
    //           disabledMinutesForEndHours
    //       }

    //       if (!_usedHours.includes(startTimeHours)) {
    //         _usedHours.push(startTimeHours)

    //         _bookedHours[startTimeHours] = {
    //           hour: startTimeHours,
    //           disabled_minutes: [],
    //         }

    //         let disabledMinutesForStartHours =
    //           _bookedHours[startTimeHours]?.disabled_minutes
    //         let disabledMinutesForEndHours =
    //           _bookedHours[endTimeHours]?.disabled_minutes

    //         for (let _minute = startTimeMins; _minute <= 60; ) {
    //           if (!disabledMinutesForStartHours.includes(_minute)) {
    //             disabledMinutesForStartHours.push(_minute)
    //           }

    //           _minute += minSteps
    //         }

    //         _bookedHours[startTimeHours].disabled_minutes =
    //           disabledMinutesForStartHours

    //         for (let _minute = 0; _minute <= endTimeMins; ) {
    //           if (!disabledMinutesForEndHours.includes(_minute)) {
    //             disabledMinutesForEndHours.push(_minute)
    //           }

    //           _minute += minSteps
    //         }

    //         _bookedHours[endTimeHours].disabled_minutes =
    //           disabledMinutesForEndHours
    //       }
    //     }
    //   }

    //   if (!_usedHours.includes(endTimeHours)) {
    //     _usedHours.push(endTimeHours)

    //     _bookedHours[endTimeHours] = {
    //       hour: endTimeHours,
    //       disabled_minutes: [],
    //     }

    //     let disabledMinutes: any[] =
    //       _bookedHours[endTimeHours]?.disabled_minutes

    //     if (startTimeHours === endTimeHours) {
    //       for (let _minute = startTimeMins; _minute <= endTimeMins; ) {
    //         if (!disabledMinutes.includes(_minute)) {
    //           disabledMinutes.push(_minute)
    //         }

    //         _minute += minSteps
    //       }
    //       _bookedHours[startTimeHours].disabled_minutes = disabledMinutes
    //     }

    //     if (startTimeHours !== endTimeHours) {
    //       if (_usedHours.includes(startTimeHours)) {
    //         let disabledMinutesForStartHours =
    //           _bookedHours[startTimeHours]?.disabled_minutes
    //         let disabledMinutesForEndHours =
    //           _bookedHours[endTimeHours]?.disabled_minutes

    //         for (let _minute = startTimeMins; _minute <= 60; ) {
    //           if (!disabledMinutesForStartHours.includes(_minute)) {
    //             disabledMinutesForStartHours.push(_minute)
    //           }

    //           _minute += minSteps
    //         }

    //         _bookedHours[startTimeHours].disabled_minutes =
    //           disabledMinutesForStartHours

    //         for (let _minute = 0; _minute <= endTimeMins; ) {
    //           if (!disabledMinutesForEndHours.includes(_minute)) {
    //             disabledMinutesForEndHours.push(_minute)
    //           }

    //           _minute += minSteps
    //         }

    //         _bookedHours[endTimeHours].disabled_minutes =
    //           disabledMinutesForEndHours
    //       }

    //       if (!_usedHours.includes(startTimeHours)) {
    //         _usedHours.push(startTimeHours)

    //         _bookedHours[startTimeHours] = {
    //           hour: startTimeHours,
    //           disabled_minutes: [],
    //         }

    //         let disabledMinutesForStartHours =
    //           _bookedHours[startTimeHours]?.disabled_minutes
    //         let disabledMinutesForEndHours =
    //           _bookedHours[endTimeHours]?.disabled_minutes

    //         for (let _minute = startTimeMins; _minute <= 60; ) {
    //           if (!disabledMinutesForStartHours.includes(_minute)) {
    //             disabledMinutesForStartHours.push(_minute)
    //           }

    //           _minute += minSteps
    //         }

    //         _bookedHours[startTimeHours].disabled_minutes =
    //           disabledMinutesForStartHours

    //         for (let _minute = 0; _minute <= endTimeMins; ) {
    //           if (!disabledMinutesForEndHours.includes(_minute)) {
    //             disabledMinutesForEndHours.push(_minute)
    //           }

    //           _minute += minSteps
    //         }

    //         _bookedHours[endTimeHours].disabled_minutes =
    //           disabledMinutesForEndHours
    //       }
    //     }
    //   }

    //   if (startTimeHours === endTimeHours) {
    //     await disableHours({
    //       hour: startTimeHours,
    //     })
    //   } else {
    //     await Promise.all([
    //       disableHours({
    //         hour: startTimeHours,
    //       }),
    //       disableHours({
    //         hour: endTimeHours,
    //       }),
    //     ])
    //   }
    // }

    return { booked_schedules: _bookedHours, meetings }
  }
}
