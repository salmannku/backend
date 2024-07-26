import { HttpStatusCode } from 'axios'
import { APIError } from '../middlewares/errorHandler.middleware'
import EventsModel from '../models/events.model'
import ResponseCodes from '../utils/responseCodes'
import { CommonUtils } from '../utils/common.utils'
import moment from 'moment'
import MeetingRequestsModel, {
  IMeetingRecipientUserDetails,
  IMeetingRequestsModelSchema,
} from '../models/meeting-requests.model'
import EventLocationsModel from '../models/event-locations.model'
import { IUser, UserServices } from './users.services'
import { EnvVariables } from '../enums/env.variables.enums'
import { cloneDeep } from 'lodash'

const ExcelJS = require('exceljs')

/**
 * Meeting list excel sheet columns
 */
const tableColumns = {
  meeting_status: {
    column: 1,
    value: 'A',
  },
  full_name: {
    column: 2,
    value: 'B',
  },
  company: {
    column: 3,
    value: 'C',
  },
  user_type: {
    column: 4,
    value: 'D',
  },
  email: {
    column: 5,
    value: 'E',
  },
  telephone: {
    column: 6,
    value: 'F',
  },
  meeting_time: {
    column: 7,
    value: 'G',
  },
  meeting_location: {
    column: 8,
    value: 'H',
  },
  attendees_full_name: {
    column: 9,
    value: 'I',
  },
  attendees_company: {
    column: 10,
    value: 'J',
  },
  attendees_telephone: {
    column: 11,
    value: 'K',
  },
  attendees_email: {
    column: 12,
    value: 'L',
  },
  attendees_user_type: {
    column: 13,
    value: 'M',
  },
  attendees_meeting_status: {
    column: 14,
    value: 'N',
  },
}

export class MeetingServices {
  static generateMeetingsExcelFile = async (params: { event_id: string }) => {
    const eventRecord = await EventsModel.findById(params.event_id).lean()

    if (!eventRecord) {
      throw new APIError({
        code: ResponseCodes.NOT_FOUND,
        message: 'Event not found!',
        status: HttpStatusCode.NotFound,
      })
    }

    let eventDays: any[] = []

    const eventStartDate = moment(eventRecord?.start_date).utc()
    const eventEndDate = moment(eventRecord?.end_date).utc()

    const diffDays = eventEndDate.diff(eventStartDate, 'days')

    for (let i = 0; i <= diffDays + 1; i++) {
      eventDays.push(moment(eventStartDate).add(i, 'days').toISOString())
    }

    eventDays = eventDays.map((_date) => {
      let updatedDate = new Date(_date)
      let outputDate = new Date()

      outputDate.setDate(updatedDate.getDate())
      outputDate.setMonth(updatedDate.getMonth())
      outputDate.setFullYear(updatedDate.getFullYear())
      outputDate.setHours(updatedDate.getHours())
      outputDate.setMinutes(updatedDate.getMinutes())
      outputDate.setSeconds(updatedDate.getSeconds())

      return outputDate.toISOString()
    })

    let eventDates = CommonUtils.formatEventDates({
      startDate: eventRecord.start_date.toISOString(),
      endDate: eventRecord.end_date.toISOString(),
    })

    let meetingsBatch: {
      date: string
      meetings: IMeetingRequestsModelSchema[]
    }[] = []

    const getMeetings = async (params: {
      event_id: string
      event_date: string
      meetingBatchIndex: number
    }) => {
      let updatedDate = params.event_date.split('T')?.[0]

      let getQuery = {
        event: params.event_id?.trim(),
        meeting_date: {
          $gte: moment(updatedDate).toDate(),
          $lte: moment(updatedDate).add(1, 'days').toDate(),
        },
      }

      const meetings = await MeetingRequestsModel.find(getQuery)
        .sort({
          meeting_start_time: 1,
        })
        .populate({
          path: 'meeting_location',
          model: EventLocationsModel,
        })
        .lean()

      meetingsBatch[params.meetingBatchIndex].meetings = meetings
    }

    const getMeetingPromises: any[] = []

    for (let i = 0; i < eventDays.length; i++) {
      let batchData = {
        date: eventDays[i],
        meetings: [],
      }

      getMeetingPromises.push(() =>
        getMeetings({
          event_id: params.event_id,
          event_date: eventDays[i],
          meetingBatchIndex: i,
        })
      )

      meetingsBatch[i] = batchData
    }

    await Promise.all(getMeetingPromises.map((_promise) => _promise()))

    let sheetTitle = `Meeting Schedules | ${eventRecord?.name?.trim()} (${eventDates})`

    /**
     * Process sheet
     */

    const workbook = new ExcelJS.Workbook()

    const processExcelSheet = async (params: {
      event_date: string
      sheet_index: number
    }) => {
      let writeableRowNumber = 5

      let eventDate = moment(params.event_date).utc().format('DD-MM-YYYY')

      let tabTitle = `Day ${params.sheet_index + 1} - ${eventDate}`

      const worksheet = workbook.addWorksheet(tabTitle)

      worksheet.views = [{ state: 'frozen', ySplit: 3 }]

      let processMeetingDataPromises: any[] = []

      /**
       * Sample data
       */
      // let meetingsProcessesRowNumbers: number[] = [
      //   {
      //     meetingData: 1,
      //     attendeesDataRows: [1, 2],
      //   },
      // ]
      let meetingsProcessesRowNumbers: {
        meetingRow: number
        attendeesDataRows: number[]
      }[] = []

      let processMeetingAttendeesPromises: any[] = []

      let numberOfMaxColumns = 14

      worksheet.getCell('A1').value = sheetTitle

      worksheet.mergeCells(
        `A1:${worksheet.getColumn(numberOfMaxColumns).letter}1`
      )

      const processMeetingAttendees = async (params: {
        attendeeUserData: IMeetingRecipientUserDetails
        meetingRecord: IMeetingRequestsModelSchema
        tableRow: number
        attendee_index: number
        meeting_index: number
      }) => {
        let rowNumber =
          meetingsProcessesRowNumbers[params.meeting_index].attendeesDataRows[
            params.attendee_index
          ]

        const userDetails = await UserServices.getUserById({
          user_id: params.attendeeUserData.user_id,
        })

        let userName = '-'
        let company = '-'
        let userType = '-'
        let email = '-'
        let telephone = '-'
        let meetingStatus = '-'

        if (userDetails) {
          userName = UserServices.getUserName(userDetails) ?? ''
          company = userDetails.company_name
          userType = CommonUtils.getUserTypeName({
            user_type: userDetails.user_type,
          })
          email = userDetails.email
          telephone = userDetails.telephone
          meetingStatus = CommonUtils.getMeetingStatusByEnum({
            status: params.attendeeUserData.meeting_status,
          })
        }

        worksheet.getCell(
          `${tableColumns.attendees_full_name.value}${rowNumber}`
        ).value = userName

        worksheet.getCell(
          `${tableColumns.attendees_company.value}${rowNumber}`
        ).value = company

        worksheet.getCell(
          `${tableColumns.attendees_user_type.value}${rowNumber}`
        ).value = userType

        worksheet.getCell(
          `${tableColumns.attendees_email.value}${rowNumber}`
        ).value = email

        worksheet.getCell(
          `${tableColumns.attendees_telephone.value}${rowNumber}`
        ).value = telephone

        worksheet.getCell(
          `${tableColumns.attendees_meeting_status.value}${rowNumber}`
        ).value = meetingStatus
      }

      const writeDataInCells = async (params: {
        meetingRecord: IMeetingRequestsModelSchema
        tableRow: number
        meeting_index: number
      }) => {
        let rowNumber =
          meetingsProcessesRowNumbers[params.meeting_index].meetingRow

        const requestorUser = (await UserServices.getUserById({
          user_id: params.meetingRecord?.requestor?.toString(),
        })) as IUser

        let userName = '-'
        let company = '-'
        let userType = '-'
        let email = '-'
        let telephone = '-'
        let meetingStatus = '-'
        let meetingTime = '-'
        let meetingLocation = '-'

        if (requestorUser) {
          userName = UserServices.getUserName(requestorUser) || ''
          company = requestorUser?.company?.company_name
          userType = CommonUtils.getUserTypeName({
            user_type: params.meetingRecord.requestor_user_type,
          })
          email = requestorUser.email
          telephone = requestorUser.telephone
          meetingStatus = CommonUtils.getMeetingStatusByEnum({
            status: params.meetingRecord.meeting_status,
          })
          meetingTime = CommonUtils.getMeetingTime({
            meeting: params.meetingRecord,
          }).meeting_time
          meetingLocation =
            params.meetingRecord?.meeting_location?.location_name
        }

        worksheet.getCell(
          `${tableColumns.meeting_status.value}${rowNumber}`
        ).value = meetingStatus

        worksheet.getCell(`${tableColumns.full_name.value}${rowNumber}`).value =
          userName

        worksheet.getCell(`${tableColumns.company.value}${rowNumber}`).value =
          company

        worksheet.getCell(`${tableColumns.user_type.value}${rowNumber}`).value =
          userType

        worksheet.getCell(`${tableColumns.email.value}${rowNumber}`).value =
          email

        worksheet.getCell(`${tableColumns.telephone.value}${rowNumber}`).value =
          telephone

        worksheet.getCell(
          `${tableColumns.meeting_time.value}${rowNumber}`
        ).value = meetingTime

        worksheet.getCell(
          `${tableColumns.meeting_location.value}${rowNumber}`
        ).value = meetingLocation
      }

      let meetings = meetingsBatch?.[params.sheet_index]?.meetings ?? []

      for (let i = 0; i < meetings.length; i++) {
        let meetingRecord = meetings[i]

        let attendeesDataRows =
          meetingsProcessesRowNumbers?.[i]?.attendeesDataRows

        if (!attendeesDataRows) {
          attendeesDataRows = []
        }

        let rowMemory: any = {
          meetingRow: writeableRowNumber,
          attendeesDataRows: attendeesDataRows,
        }

        processMeetingDataPromises.push(() =>
          writeDataInCells({
            meetingRecord: meetingRecord,
            tableRow: writeableRowNumber,
            meeting_index: i,
          })
        )

        let attendees = meetingRecord.requested_users_details

        for (
          let attendeeIndex = 0;
          attendeeIndex < attendees.length;
          attendeeIndex++
        ) {
          processMeetingAttendeesPromises.push(() =>
            processMeetingAttendees({
              attendeeUserData: attendees[attendeeIndex],
              meetingRecord: meetingRecord,
              tableRow: writeableRowNumber,
              meeting_index: i,
              attendee_index: attendeeIndex,
            })
          )

          rowMemory.attendeesDataRows.push(writeableRowNumber)

          if (attendeeIndex !== attendees.length - 1) {
            writeableRowNumber = writeableRowNumber + 1
          }
        }

        meetingsProcessesRowNumbers[i] = rowMemory

        writeableRowNumber = writeableRowNumber + 1
      }

      const titleCell = worksheet.getCell('A1')

      const firstRow = worksheet.getRow(1)

      firstRow.height = 35

      titleCell.font = { size: 14, bold: true, color: { argb: 'FFFFFF' } }

      firstRow.alignment = { vertical: 'middle', horizontal: 'left' }

      titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '000000' }, // Red background
      }

      /**
       * Meeting Status cell
       */

      const firstColumn = worksheet.getColumn(1)

      firstColumn.width = 20

      worksheet.getCell('A2').value = 'Meeting Status'
      worksheet.mergeCells('A2:A3')

      const meetingStatusCell = worksheet.getCell('A2')
      const secondRow = worksheet.getRow(2)

      meetingStatusCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '3D85C6' }, // Red background
      }

      meetingStatusCell.alignment = { vertical: 'middle', horizontal: 'left' }

      meetingStatusCell.font = {
        size: 12,
        bold: false,
        color: { argb: 'FFFFFF' },
      }

      /**
       * Full Name cell
       */

      const fullNameColumn = worksheet.getColumn(2)

      fullNameColumn.width = 25

      worksheet.getCell('B2').value = 'Full Name'
      worksheet.mergeCells('B2:B3')

      const fullNameCell = worksheet.getCell('B2')

      fullNameCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '3D85C6' }, // Red background
      }

      fullNameCell.alignment = { vertical: 'middle', horizontal: 'left' }

      fullNameCell.font = {
        size: 12,
        bold: false,
        color: { argb: 'FFFFFF' },
      }

      /**
       * Company column
       */

      const companyColumn = worksheet.getColumn(3)

      companyColumn.width = 20

      worksheet.getCell('C2').value = 'Company'
      worksheet.mergeCells('C2:C3')

      const companyCell = worksheet.getCell('C2')

      companyCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '3D85C6' }, // Red background
      }

      companyCell.alignment = { vertical: 'middle', horizontal: 'left' }

      companyCell.font = {
        size: 12,
        bold: false,
        color: { argb: 'FFFFFF' },
      }

      /**
       * User Type cell
       */

      const userTypeColumn = worksheet.getColumn(4)

      userTypeColumn.width = 21

      worksheet.getCell('D2').value = 'User Type'
      worksheet.mergeCells('D2:D3')

      const userTypeCell = worksheet.getCell('D2')

      userTypeCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '3D85C6' }, // Red background
      }

      userTypeCell.alignment = { vertical: 'middle', horizontal: 'left' }

      userTypeCell.font = {
        size: 12,
        bold: false,
        color: { argb: 'FFFFFF' },
      }

      /**
       * Email cell
       */

      const emailColumn = worksheet.getColumn(5)

      emailColumn.width = 21

      worksheet.getCell('E2').value = 'Email'
      worksheet.mergeCells('E2:E3')

      const emailCell = worksheet.getCell('E2')

      emailCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '3D85C6' }, // Red background
      }

      emailCell.alignment = { vertical: 'middle', horizontal: 'left' }

      emailCell.font = {
        size: 12,
        bold: false,
        color: { argb: 'FFFFFF' },
      }

      /**
       * Telephone cell
       */

      const telephoneColumn = worksheet.getColumn(6)

      telephoneColumn.width = 16

      worksheet.getCell('F2').value = 'Telephone'
      worksheet.mergeCells('F2:F3')

      const telephoneCell = worksheet.getCell('F2')

      telephoneCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '3D85C6' }, // Red background
      }

      telephoneCell.alignment = { vertical: 'middle', horizontal: 'left' }

      telephoneCell.font = {
        size: 12,
        bold: false,
        color: { argb: 'FFFFFF' },
      }

      /**
       * Meeting Time cell
       */

      const meetingTimeColumn = worksheet.getColumn(7)

      meetingTimeColumn.width = 22

      worksheet.getCell('G2').value = 'Meeting Time'
      worksheet.mergeCells('G2:G3')

      const meetingTimeCell = worksheet.getCell('G2')

      meetingTimeCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '3D85C6' }, // Red background
      }

      meetingTimeCell.alignment = { vertical: 'middle', horizontal: 'left' }

      meetingTimeCell.font = {
        size: 12,
        bold: false,
        color: { argb: 'FFFFFF' },
      }

      /**
       * Meeting Location cell
       */

      const meetingLocationColumn = worksheet.getColumn(8)

      meetingLocationColumn.width = 22

      worksheet.getCell('H2').value = 'Meeting Location'
      worksheet.mergeCells('H2:H3')

      const meetingLocationCell = worksheet.getCell('H2')

      meetingLocationCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '3D85C6' }, // Red background
      }

      meetingLocationCell.alignment = { vertical: 'middle', horizontal: 'left' }

      meetingLocationCell.font = {
        size: 12,
        bold: false,
        color: { argb: 'FFFFFF' },
      }

      /**
       * Attendees cell
       */

      worksheet.getCell('I2').value = 'Attendees'
      // worksheet.mergeCells('H2:H3')

      worksheet.mergeCells('I2:N2')

      const attendeesCell = worksheet.getCell('I2')

      attendeesCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '3D85C6' }, // Red background
      }

      attendeesCell.alignment = { vertical: 'middle', horizontal: 'center' }

      attendeesCell.font = {
        size: 12,
        bold: false,
        color: { argb: 'FFFFFF' },
      }

      /**
       * Attendee sub columns
       */

      // Attendee Name column

      worksheet.getCell('I3').value = 'Attendee Name'

      const attendeeNameColumn = worksheet.getColumn(9)

      attendeeNameColumn.width = 25

      const attendeeNameCell = worksheet.getCell('I3')

      attendeeNameCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '3D85C6' }, // Red background
      }

      attendeeNameCell.alignment = { vertical: 'middle', horizontal: 'left' }

      attendeeNameCell.font = {
        size: 12,
        bold: false,
        color: { argb: 'FFFFFF' },
      }

      // Attendee Company column

      worksheet.getCell('J3').value = 'Attendee Company'

      const attendeeCompanyColumn = worksheet.getColumn(10)

      attendeeCompanyColumn.width = 20

      const attendeeCompanyCell = worksheet.getCell('J3')

      attendeeCompanyCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '3D85C6' }, // Red background
      }

      attendeeCompanyCell.alignment = { vertical: 'middle', horizontal: 'left' }

      attendeeCompanyCell.font = {
        size: 12,
        bold: false,
        color: { argb: 'FFFFFF' },
      }

      // Attendee Company column

      worksheet.getCell('K3').value = 'Telephone'

      const attendeeTelephoneColumn = worksheet.getColumn(11)

      attendeeTelephoneColumn.width = 16

      const attendeeTelephoneCell = worksheet.getCell('K3')

      attendeeTelephoneCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '3D85C6' }, // Red background
      }

      attendeeTelephoneCell.alignment = {
        vertical: 'middle',
        horizontal: 'left',
      }

      attendeeTelephoneCell.font = {
        size: 12,
        bold: false,
        color: { argb: 'FFFFFF' },
      }

      // Attendee Email column

      worksheet.getCell('L3').value = 'Email'

      const attendeeEmailColumn = worksheet.getColumn(12)

      attendeeEmailColumn.width = 21

      const attendeeEmailCell = worksheet.getCell('L3')

      attendeeEmailCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '3D85C6' }, // Red background
      }

      attendeeEmailCell.alignment = { vertical: 'middle', horizontal: 'left' }

      attendeeEmailCell.font = {
        size: 12,
        bold: false,
        color: { argb: 'FFFFFF' },
      }

      // Attendee User Type column

      worksheet.getCell('M3').value = 'User Type'

      const attendeeUserTypeColumn = worksheet.getColumn(13)

      attendeeUserTypeColumn.width = 21

      const attendeeUserTypeCell = worksheet.getCell('M3')

      attendeeUserTypeCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '3D85C6' }, // Red background
      }

      attendeeUserTypeCell.alignment = {
        vertical: 'middle',
        horizontal: 'left',
      }

      attendeeUserTypeCell.font = {
        size: 12,
        bold: false,
        color: { argb: 'FFFFFF' },
      }

      // Attendee Meeting Status column

      worksheet.getCell('N3').value = 'Meeting Status'

      const attendeeMeetingStatusColumn = worksheet.getColumn(14)

      attendeeMeetingStatusColumn.width = 21

      const attendeeMeetingStatusCell = worksheet.getCell('N3')

      attendeeMeetingStatusCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '3D85C6' }, // Red background
      }

      attendeeMeetingStatusCell.alignment = {
        vertical: 'middle',
        horizontal: 'left',
      }

      attendeeMeetingStatusCell.font = {
        size: 12,
        bold: false,
        color: { argb: 'FFFFFF' },
      }

      await Promise.all([
        ...processMeetingDataPromises.map((_promise) => _promise()),
        ...processMeetingAttendeesPromises.map((_promise) => _promise()),
      ])

      return true
    }

    const sheetsProcesses: any[] = []

    // meetingsBatch = [meetingsBatch[0]]

    for (let sheetIndex = 0; sheetIndex < meetingsBatch.length; sheetIndex++) {
      let batchData = meetingsBatch[sheetIndex]

      sheetsProcesses.push(() =>
        processExcelSheet({
          event_date: batchData.date,
          sheet_index: sheetIndex,
        })
      )
    }

    await Promise.all(sheetsProcesses.map((_promise) => _promise()))

    let fileLocation = EnvVariables.events.filesPath

    let updatedEventName = (eventRecord.name as any)
      .replaceAll(' ', '-')
      .replaceAll('(', '')
      .replaceAll(')', '')
      .toLowerCase()

    let fileName = `${updatedEventName}-meeting-schedules.xlsx`

    await CommonUtils.checkAndCreateDirectory(fileLocation)

    let filePath = `${fileLocation}/${fileName}`

    await workbook.xlsx.writeFile(filePath)

    return {
      file_path: filePath,
    }
  }

  static getMeetingStatus = async (params: {
    meeting: IMeetingRequestsModelSchema
  }) => {
    const metingStatuses: string[] = []

    let meetingStatus = params.meeting?.meeting_status

    let updatedMeeting = cloneDeep(params?.meeting)

    updatedMeeting.requested_users_details.forEach((user) => {
      let status = user?.meeting_status?.trim()

      if (!metingStatuses.includes(status)) {
        metingStatuses.push(status)
      }
    })

    if (metingStatuses.length === 1) {
      meetingStatus = metingStatuses?.[0]
    }

    return {
      status: meetingStatus?.trim(),
    }
  }
}
