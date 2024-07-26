import moment from 'moment'
import fs from 'fs/promises'
import { v1 as uuidv1 } from 'uuid'
import { CommonEnums } from '../enums/common.enums'
import { IMeetingRequestsModelSchema } from '../models/meeting-requests.model'

export class CommonUtils {
  static convertStringToSlug = ({ str }: { str: string }) => {
    str = str.replace(/^\s+|\s+$/g, '') // trim
    str = str.toLowerCase()

    // remove accents, swap ñ for n, etc
    var from = 'àáãäâèéëêìíïîòóöôùúüûñç·/_,:;'
    var to = 'aaaaaeeeeiiiioooouuuunc------'

    for (var i = 0, l = from.length; i < l; i++) {
      str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i))
    }

    str = str
      .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
      .replace(/\s+/g, '-') // collapse whitespace and replace by -
      .replace(/-+/g, '-') // collapse dashes

    return str
  }

  static removeEmptyValuesFromArray = (array: any[]) => {
    let newArray: any[] = []

    array.forEach((_item) => {
      if (_item) newArray.push(_item)
    })

    return newArray
  }

  static formatEventDates = ({
    startDate,
    endDate,
  }: {
    startDate: string
    endDate: string
  }) => {
    let momentStartDateArray = moment(startDate)
      .format('MMMM Do YYYY')
      ?.split(' ')
    let startDateFilterArray = new Date(startDate).toString()?.split(' ')
    let start_date = `${momentStartDateArray[1]} ${momentStartDateArray[0]} ${startDateFilterArray[3]}`

    let filterDate = start_date
    if (endDate) {
      let momentEndDateArray = moment(endDate)
        .format('MMMM Do YYYY')
        ?.split(' ')
      let endDateFilterArray = new Date(endDate).toString().split(' ')

      if (startDateFilterArray[3] === endDateFilterArray[3]) {
        filterDate = `${momentStartDateArray[1]} ${momentStartDateArray[0]} - ${momentEndDateArray[1]} ${momentEndDateArray[0]} ${endDateFilterArray[3]}`
      } else {
        filterDate = `${start_date}-${momentEndDateArray[1]} ${momentEndDateArray[0]} ${endDateFilterArray[3]}`
      }
    }

    return filterDate
  }

  static checkAndCreateDirectory = async (path: string) => {
    try {
      await fs.access(path, fs.constants.R_OK | fs.constants.W_OK)
    } catch (err) {
      await fs.mkdir(path, { recursive: true })
    }
  }

  static generateUniqueId = () => {
    return uuidv1()
  }

  static getMeetingStatusByEnum = (params: { status: string }) => {
    if (params.status === CommonEnums.meetingStatus.accepted) {
      return CommonEnums.meetingStatus.accepted_label
    }

    if (params.status === CommonEnums.meetingStatus.declined) {
      return CommonEnums.meetingStatus.declined_label
    }

    if (params.status === CommonEnums.meetingStatus.cancelled) {
      return CommonEnums.meetingStatus.cancelled_label
    }

    if (params.status === CommonEnums.meetingStatus.rescheduled) {
      return CommonEnums.meetingStatus.rescheduled_label
    }

    return CommonEnums.meetingStatus.pending_label
  }

  static getUserTypeName = (params: { user_type: string }) => {
    if (params.user_type === CommonEnums.users.ADMIN) {
      return CommonEnums.users.admin_label
    }

    if (params.user_type === CommonEnums.users.delegate) {
      return CommonEnums.users.delegate_label
    }

    if (params.user_type === CommonEnums.users.exhibitor) {
      return CommonEnums.users.exhibitor_label
    }

    if (params.user_type === CommonEnums.users.speaker) {
      return CommonEnums.users.speaker_label
    }

    if (params.user_type === CommonEnums.users.sponsor) {
      return CommonEnums.users.sponsor_label
    }

    if (params.user_type === CommonEnums.users.media_partner) {
      return CommonEnums.users.media_partner_label
    }

    return CommonEnums.users.delegate_label
  }

  static getMeetingTime = (params: {
    meeting: IMeetingRequestsModelSchema
  }) => {
    const meetingDate = moment(new Date(params.meeting.meeting_date))
      .utc()
      .format('dddd Do MMMM YYYY')
    const startTime = moment(new Date(params.meeting.meeting_start_time))
      .utc()
      .format('HH:mm')
    const endTime = moment(new Date(params.meeting.meeting_end_time))
      .utc()
      .format('HH:mm')

    let timeDiff = ''

    let hourDiff = moment(new Date(params.meeting.meeting_end_time)).diff(
      moment(new Date(params.meeting.meeting_start_time)),
      'hour'
    )
    let minDiff = moment(new Date(params.meeting.meeting_end_time)).diff(
      moment(new Date(params.meeting.meeting_start_time)),
      'minute'
    )

    timeDiff = `${hourDiff} hr`

    if (hourDiff === 0) {
      timeDiff = `${minDiff} min`
    } else {
      const restMin = minDiff - hourDiff * 60

      if (restMin > 0) {
        timeDiff = `${hourDiff} hr ${restMin} min`
      }
    }

    const meetingTimeString = `${startTime} - ${endTime} (${timeDiff}) UTC`

    return {
      meeting_date: meetingDate,
      meeting_time: meetingTimeString,
    }
  }
}
