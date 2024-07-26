// @ts-nocheck

import moment from 'moment'
import { sendResponse } from '../helpers/common'
import EmailHelpers from '../helpers/email.helpers'
import CountriesModel from '../models/countries.model'
import { DelegateServices } from '../services/delegates.services'
import { EventServices } from '../services/event.services'
import { UserServices } from '../services/users.services'
import { catchAsync } from '../utils/catchAsync'
import { FileLocationEnums } from '../utils/files.enums'
import ResponseCodes from '../utils/responseCodes'
import { CommonUtils } from '../utils/common.utils'
import {
  IMeetingRecipientUserDetails,
  IMeetingRequestsModelSchema,
} from '../models/meeting-requests.model'
import { EnvVariables } from '../enums/env.variables.enums'
import { MeetingServices } from '../services/meeting.services'
var crypto = require('crypto')
var assert = require('assert')

const fs = require('fs').promises

const ExcelJS = require('exceljs')

const meetings = [
  {
    _id: {
      $oid: '65d291900a6a13c6d652d8fa',
    },
    requestor: {
      _id: {
        $oid: '66125c768e2737ab6b7b6448',
      },
      first_name: 'Niten',
      last_name: 'Exhibitor',
      description:
        '<p class="ql-align-justify"><strong>Lorem Ipsum</strong>&nbsp;is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p><p><br></p>',
      exhibitor_logo:
        'https://mylo-global-dev-storage.s3.amazonaws.com/attachments/avatars//945a1eb70aacc764f2da7e2b525cae19-0bb50316-fa0b-4b2c-aafb-489982af4f5d',
      phone: '',
      email: 'nitensolanki02@gmail.com',
      phone_country_code: '',
      city: 'surat',
      country: 'India',
      zip: '',
      address_line_1: '',
      address_line_2: '',
      password: '$2a$10$Fi1NM0iJEyCZmJfnd5esDuLhg0oQ1VvIXaPo5klseacZrvKfY.tw.',
      is_phone_verified: false,
      is_email_verified: false,
      exhibitor_URL: 'wolffox.in',
      job_title: 'System Architect',
      company: {
        $oid: '65d9e33fd0d68ea6da058c91',
      },
      company_name: 'WolfFox',
      category: {
        $oid: '65d8a41ed25707a23a27d382',
      },
      category_name: 'System Admin',
      events: [
        {
          $oid: '65d9e5359686c6e93975d215',
        },
      ],
      created_by: null,
      status: 'active',
      user_type: 'exhibitor',
      pa_name: '',
      pa_email: '',
      last_login: null,
      is_online: false,
      createdAt: {
        $date: '2024-04-07T08:42:30.365Z',
      },
      updatedAt: {
        $date: '2024-05-31T18:44:44.995Z',
      },
      __v: 1,
      event_invites: [
        {
          $oid: '65d9e5359686c6e93975d215',
        },
      ],
      telephone: '',
    },
    requestor_user_type: 'exhibitor',
    requestor_first_name: 'Eva',
    requestor_last_name: 'Exhibitor',
    requestor_email: 'exhibitor.eva@mailinator.com',
    requested_users: [
      {
        $oid: '65cb56b344eec155229e74b7',
      },
      {
        $oid: '65ccccd65f5f6a3fb980ac51',
      },
    ],
    requested_users_details: [
      {
        first_name: 'Niten',
        last_name: 'Solanki',
        avatar:
          'https://mylo-global-dev-storage.s3.amazonaws.com/attachments/avatars//207a11e88d2bb781b1c360b7a5aae081-dccc8875-4a5f-4ba6-ac62-3b02bfd22060',
        email: 'nitensolanki02@gmail.com',
        company_name: '',
        company_id: '',
        user_id: '65df2474a32cccaf6fbd4f7f',
        user_type: 'delegate',
        meeting_status: 'pending',
        _id: {
          $oid: '65d291900a6a13c6d652d8fb',
        },
      },
      {
        first_name: 'Eva',
        last_name: 'Exhibitor',
        avatar: '',
        email: 'exhibitor.eva@mailinator.com',
        company_name: '',
        company_id: '',
        user_id: '65fbc39427040ce1c1d81578',
        user_type: 'exhibitor',
        meeting_status: 'accepted',
        _id: {
          $oid: '65d291900a6a13c6d652d8fc',
        },
      },
    ],
    group_meetings: [],
    event: {
      $oid: '65c358a0521dc5a4c4bb3e59',
    },
    meeting_notes: 'Meeting notes',
    meeting_location: {
      _id: {
        $oid: '66110e2ab66c3c851ce8625c',
      },
      location_name: 'Stand 1B',
      assigned_to: {
        $oid: '65df2474a32cccaf6fbd4f7f',
      },
      assigned_to_name: 'Update Delegate-edit update 03',
      user_type: 'delegate',
      event_id: {
        $oid: '65d9e5359686c6e93975d215',
      },
      __v: 0,
      createdAt: {
        $date: '2024-04-06T08:56:10.825Z',
      },
      updatedAt: {
        $date: '2024-04-06T08:56:10.825Z',
      },
    },
    meeting_date: {
      $date: '2023-12-31T00:00:00.000Z',
    },
    meeting_start_time: '2023-12-31T13:00:00.000Z',
    meeting_end_time: '2023-12-31T15:20:00.000Z',
    meeting_status: 'cancelled',
    __v: 0,
    requestor_company_name: '',
    requestor_company_id: {
      _id: {
        $oid: '65dd77650b8821ab1bdcffac',
      },
      company_name: 'Dreamy Occasions',
      company_type: '',
      email: 'John.Doe@example.com',
      phone: '446787897969',
      phone_country_code: '44',
      description: '<p>test</p>',
      city: 'Ahmedabad',
      country: 'Albania',
      zip: '365004',
      address_line_1: 'Apt 23B',
      address_line_2: '',
      status: 'active',
      createdAt: {
        $date: '2024-02-27T05:47:17.770Z',
      },
      updatedAt: {
        $date: '2024-02-27T05:47:17.770Z',
      },
      __v: 0,
    },
  },
  {
    _id: {
      $oid: '65d291900a6a13c6d652d8fa',
    },
    requestor: {
      _id: {
        $oid: '66125c768e2737ab6b7b6448',
      },
      first_name: 'Niten',
      last_name: 'Exhibitor',
      description:
        '<p class="ql-align-justify"><strong>Lorem Ipsum</strong>&nbsp;is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p><p><br></p>',
      exhibitor_logo:
        'https://mylo-global-dev-storage.s3.amazonaws.com/attachments/avatars//945a1eb70aacc764f2da7e2b525cae19-0bb50316-fa0b-4b2c-aafb-489982af4f5d',
      phone: '',
      email: 'nitensolanki02@gmail.com',
      phone_country_code: '',
      city: 'surat',
      country: 'India',
      zip: '',
      address_line_1: '',
      address_line_2: '',
      password: '$2a$10$Fi1NM0iJEyCZmJfnd5esDuLhg0oQ1VvIXaPo5klseacZrvKfY.tw.',
      is_phone_verified: false,
      is_email_verified: false,
      exhibitor_URL: 'wolffox.in',
      job_title: 'System Architect',
      company: {
        $oid: '65d9e33fd0d68ea6da058c91',
      },
      company_name: 'WolfFox',
      category: {
        $oid: '65d8a41ed25707a23a27d382',
      },
      category_name: 'System Admin',
      events: [
        {
          $oid: '65d9e5359686c6e93975d215',
        },
      ],
      created_by: null,
      status: 'active',
      user_type: 'exhibitor',
      pa_name: '',
      pa_email: '',
      last_login: null,
      is_online: false,
      createdAt: {
        $date: '2024-04-07T08:42:30.365Z',
      },
      updatedAt: {
        $date: '2024-05-31T18:44:44.995Z',
      },
      __v: 1,
      event_invites: [
        {
          $oid: '65d9e5359686c6e93975d215',
        },
      ],
      telephone: '',
    },
    requestor_user_type: 'exhibitor',
    requestor_first_name: 'Eva',
    requestor_last_name: 'Exhibitor',
    requestor_email: 'exhibitor.eva@mailinator.com',
    requested_users: [
      {
        $oid: '65cb56b344eec155229e74b7',
      },
      {
        $oid: '65ccccd65f5f6a3fb980ac51',
      },
    ],
    requested_users_details: [
      {
        first_name: 'Niten',
        last_name: 'Solanki',
        avatar:
          'https://mylo-global-dev-storage.s3.amazonaws.com/attachments/avatars//207a11e88d2bb781b1c360b7a5aae081-dccc8875-4a5f-4ba6-ac62-3b02bfd22060',
        email: 'nitensolanki02@gmail.com',
        company_name: '',
        company_id: '',
        user_id: '65df2474a32cccaf6fbd4f7f',
        user_type: 'delegate',
        meeting_status: 'pending',
        _id: {
          $oid: '65d291900a6a13c6d652d8fb',
        },
      },
      {
        first_name: 'Eva',
        last_name: 'Exhibitor',
        avatar: '',
        email: 'exhibitor.eva@mailinator.com',
        company_name: '',
        company_id: '',
        user_id: '65fbc39427040ce1c1d81578',
        user_type: 'exhibitor',
        meeting_status: 'accepted',
        _id: {
          $oid: '65d291900a6a13c6d652d8fc',
        },
      },
    ],
    group_meetings: [],
    event: {
      $oid: '65c358a0521dc5a4c4bb3e59',
    },
    meeting_notes: 'Meeting notes',
    meeting_location: {
      _id: {
        $oid: '66110e2ab66c3c851ce8625c',
      },
      location_name: 'Stand 1B',
      assigned_to: {
        $oid: '65df2474a32cccaf6fbd4f7f',
      },
      assigned_to_name: 'Update Delegate-edit update 03',
      user_type: 'delegate',
      event_id: {
        $oid: '65d9e5359686c6e93975d215',
      },
      __v: 0,
      createdAt: {
        $date: '2024-04-06T08:56:10.825Z',
      },
      updatedAt: {
        $date: '2024-04-06T08:56:10.825Z',
      },
    },
    meeting_date: {
      $date: '2023-12-31T00:00:00.000Z',
    },
    meeting_start_time: '2023-12-31T13:00:00.000Z',
    meeting_end_time: '2023-12-31T15:20:00.000Z',
    meeting_status: 'cancelled',
    __v: 0,
    requestor_company_name: '',
    requestor_company_id: {
      _id: {
        $oid: '65dd77650b8821ab1bdcffac',
      },
      company_name: 'Dreamy Occasions',
      company_type: '',
      email: 'John.Doe@example.com',
      phone: '446787897969',
      phone_country_code: '44',
      description: '<p>test</p>',
      city: 'Ahmedabad',
      country: 'Albania',
      zip: '365004',
      address_line_1: 'Apt 23B',
      address_line_2: '',
      status: 'active',
      createdAt: {
        $date: '2024-02-27T05:47:17.770Z',
      },
      updatedAt: {
        $date: '2024-02-27T05:47:17.770Z',
      },
      __v: 0,
    },
  },
]
const eventRecord = {
  _id: {
    $oid: '65d9e5359686c6e93975d215',
  },
  name: 'Global Summit 2024',
  description:
    '<h2>Where does it come from?</h2><p class="ql-align-justify"><strong>Lorem Ipsum</strong>&nbsp;is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p><p><br></p><h2>Where does it come from?</h2><p class="ql-align-justify">Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.</p>',
  poster_images: [],
  start_date: {
    $date: '2024-02-24T12:44:33.000Z',
  },
  end_date: {
    $date: '2024-02-27T18:30:00.000Z',
  },
  venue_city: 'Surat',
  venue_country: 'India',
  venue_zip: '395004',
  venue_address_line_1: '313, Laxmi Enclave 1',
  venue_address_line_2: '',
  delegates: [],
  exhibitors: [],
  speakers: [],
  media_partners: [],
  sponsors: [],
  faqs: [],
  hotels: [
    {
      $oid: '65e06868bf106064e168e974',
    },
  ],
  conference_programmes: [],
  status: 'active',
  createdAt: {
    $date: '2024-02-24T12:46:45.820Z',
  },
  updatedAt: {
    $date: '2024-05-07T05:40:21.240Z',
  },
  __v: 148,
  featured_image:
    'https://mylo-global-dev-storage.s3.amazonaws.com/attachments/images//ba899048b20a5e9af403d4010a690e29-4b29be9b-deb6-4cd3-8d7a-747fc48f549a',
  venue_map_id: {
    $oid: '66159dd2810040b57e8e1e93',
  },
  venue_map_url:
    'https://mylo-global-dev-storage.s3.amazonaws.com/attachments/images/4b5045eb1e910e857e6097ab26c431ea-e0444e1a-ce61-48c9-80d4-7d8384627a62',
}

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

class TestController {
  static addCountries = catchAsync(async (req: Request, res: Response) => {})

  static testFunction = catchAsync(async (req: Request, res: Response) => {
    const user = req.user

    const testString =
      '<p style="margin-left:0px;"><span style="color: rgb(24,24,24);font-size: 12px;">Welcome to event events, you are now invited to event</span></p>\r\n<ul>\r\n<li>Manage your profile and start working with us \\n</li>\r\n<li>Set up 1-1 Meetings \\n</li>\r\n<li>View the event agenda \\n</li>\r\n<li>Get travel and hotel booking advice and offers \\n</li>\r\n<li>and so much more!  \\n\\n</li>\r\n<li>hey</li>\r\n<li>hey</li>\r\n<li>hey</li>\r\n<li>hey</li>\r\n</ul>'

    let updatedString = testString.replace(/(\r\n|\n|\r|\\n)/gm,"")

    return res, json(updatedString)
    let writeableRowNumber = 5

    const workbook = new ExcelJS.Workbook()

    const worksheet = workbook.addWorksheet('Day 1 - 12-02-2024')

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

    let eventDates = CommonUtils.formatEventDates({
      startDate: eventRecord.start_date,
      endDate: eventRecord.end_date,
    })

    worksheet.getCell(
      'A1'
    ).value = `Meeting Schedules | ${eventRecord?.name?.trim()} (${eventDates})`

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

      console.log('processMeetingAttendees', rowNumber)

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
        userName = UserServices.getUserName(userDetails)
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

      console.log('Meetings', rowNumber)

      let userName = '-'
      let company = '-'
      let userType = '-'
      let email = '-'
      let telephone = '-'
      let meetingStatus = '-'
      let meetingTime = '-'
      let meetingLocation = '-'

      if (params.meetingRecord) {
        userName = UserServices.getUserName(params.meetingRecord.requestor)
        company = params.meetingRecord.requestor_company_id.company_name
        userType = CommonUtils.getUserTypeName({
          user_type: params.meetingRecord.user_type,
        })
        email = params.meetingRecord.requestor.email
        telephone = params.meetingRecord.requestor.telephone
        meetingStatus = CommonUtils.getMeetingStatusByEnum({
          status: params.meetingRecord.meeting_status,
        })
        meetingTime = CommonUtils.getMeetingTime({
          meeting: params.meetingRecord,
        }).meeting_time
        meetingLocation = params.meetingRecord.meeting_location.location_name
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

      worksheet.getCell(`${tableColumns.email.value}${rowNumber}`).value = email

      worksheet.getCell(`${tableColumns.telephone.value}${rowNumber}`).value =
        telephone

      worksheet.getCell(
        `${tableColumns.meeting_time.value}${rowNumber}`
      ).value = meetingTime

      worksheet.getCell(
        `${tableColumns.meeting_location.value}${rowNumber}`
      ).value = meetingLocation
    }

    for (let i = 0; i < meetings.length; i++) {
      let meetingRecord = meetings[i]

      let rowMemory = {
        meetingRow: writeableRowNumber,
        attendeesDataRows: [],
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

        writeableRowNumber = writeableRowNumber + 1
        console.log('writeableRowNumber', writeableRowNumber)
      }

      meetingsProcessesRowNumbers[i] = rowMemory

      writeableRowNumber = writeableRowNumber + 1

      console.log('writeableRowNumber', writeableRowNumber)
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

    attendeeTelephoneCell.alignment = { vertical: 'middle', horizontal: 'left' }

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

    attendeeUserTypeCell.alignment = { vertical: 'middle', horizontal: 'left' }

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

    // Define main headers and sub-headers
    // worksheet.mergeCells('A1:A2')
    // worksheet.getCell('A1').value = 'Main Header 1'

    // worksheet.mergeCells('B1:D1')
    // worksheet.getCell('B1').value = 'Main Header 2'

    // worksheet.getCell('B2').value = 'Sub Header 2.1'
    // worksheet.getCell('C2').value = 'Sub Header 2.2'
    // worksheet.getCell('D2').value = 'Sub Header 2.3'

    // // Optional: Set alignment to center for better visual appeal
    // worksheet.getCell('A1').alignment = {
    //   vertical: 'middle',
    //   horizontal: 'center',
    // }
    // worksheet.getCell('B1').alignment = {
    //   vertical: 'middle',
    //   horizontal: 'center',
    // }
    // worksheet.getCell('B2').alignment = {
    //   vertical: 'middle',
    //   horizontal: 'center',
    // }
    // worksheet.getCell('C2').alignment = {
    //   vertical: 'middle',
    //   horizontal: 'center',
    // }
    // worksheet.getCell('D2').alignment = {
    //   vertical: 'middle',
    //   horizontal: 'center',
    // }

    // // Add some rows of data
    // worksheet.addRow({
    //   A: 'Data 1',
    //   B: 'Data 2.1',
    //   C: 'Data 2.2',
    //   D: 'Data 2.3',
    // })
    // worksheet.addRow({
    //   A: 'Data 2',
    //   B: 'Data 2.1',
    //   C: 'Data 2.2',
    //   D: 'Data 2.3',
    // })

    let fileLocation = EnvVariables.events.filesPath

    // Save the workbook to a file
    workbook.xlsx
      .writeFile(fileLocation + '/multi_level_headers.xlsx')
      .then(() => {
        console.log('Workbook saved successfully.')
      })
      .catch((err) => {
        console.error('Error saving workbook:', err)
      })

    // Add worksheets
    // const sheet1 = workbook.addWorksheet('Day One - 17-05-2024')
    // const sheet2 = workbook.addWorksheet('Sheet2')

    let tableSubColumns = [
      {
        columnName: '',
        key: 'meeting_status',
      },
      {
        columnName: '',
        key: 'full_name_sub_column',
      },
      {
        columnName: '',
        key: 'company_sub_column',
      },
      {
        columnName: '',
        key: 'user_type_sub_column',
      },
      {
        columnName: '',
        key: 'email_sub_column',
      },
      {
        columnName: '',
        key: 'telephone_sub_column',
      },
      {
        columnName: '',
        key: 'telephone_sub_column',
      },
      {
        columnName: '',
        key: 'meeting_location_sub_column',
      },
      {
        columnName: 'Attendee Name',
        key: 'attendee_name',
      },
      {
        columnName: 'Attendee Company',
        key: 'attendee_company',
      },
      {
        columnName: 'Attendee Telephone',
        key: 'attendee_telephone',
      },
      {
        columnName: 'Email',
        key: 'attendee_email',
      },
      {
        columnName: 'User Type',
        key: 'attendee_user_type',
      },
      {
        columnName: 'Meeting Status',
        key: 'attendee_meeting_status',
      },
    ]

    // // Add data to each worksheet
    // sheet1.addRow([1, 2, 3])
    // sheet1.addRow([4, 5, 6])

    // sheet2.addRow(['A', 'B', 'C'])
    // sheet2.addRow(['D', 'E', 'F'])

    // // Save the workbook
    // workbook.xlsx
    //   .writeFile('workbook.xlsx')
    //   .then(() => {
    //     console.log('Workbook created successfully!')
    //   })
    //   .catch((err) => {
    //     console.error('Error creating workbook:', err)
    //   })

    // const meetings = await UserServices.getBookedMeetingSchedules()
    // await EmailService.sendAdminRegistrationEmail({
    //   first_name: 'Niten',
    //   last_name: 'Solanki',
    //   email: 'test@hikomore.com',
    //   password: '12345678',
    // })

    // await EventServices.addMediaPartner({
    //   event_ids: ['65a2df01732c37fa8273b1bd', '65a0e796b2338453ec1837c7'],
    //   media_partner_id: '65a16ef6b2338453ec183ac8',
    // })

    // await EventServices.removeEventFromDelegates({
    //   delegate_ids: ['65aad5dfee6423b297c44876', '65aabd269e95c455591f6ffd'],
    //   event_id: '65a0e796b2338453ec1837c7',
    // })

    // const _res = await DelegateServices.getProfileSurvey({
    //   user_id: '65b7853bc826bb0ef1e4ddde',

    // })

    // await EmailHelpers.sendEmailTemplate({
    //   to: 'test@hikomore.com',
    //   subject: 'Email template test',
    //   html_content: ``,
    // })

    // await UserServices.getUserColleaguesForEvent()

    // var algorithm = 'aes256' // or any other algorithm supported by OpenSSL
    // var key = 'password'
    // var text = 'I love kittens'

    // var cipher = crypto.createCipher(algorithm, key)
    // var encrypted = cipher.update(text, 'utf8', 'hex') + cipher.final('hex')
    // var decipher = crypto.createDecipher(algorithm, key)
    // var decrypted =
    //   decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8')

    // assert.equal(decrypted, text)

    return sendResponse({
      res,
      res_code: 200,
      // data: meetings,
      response_code: ResponseCodes.DELETE_SUCCESS,
      success: true,
    })
  })

  static downloadFile = catchAsync(async (req: Request, res: Response) => {
    const { file_path } = req.query

    let fileLocation = file_path?.trim()

    const file = `${fileLocation}`
    res.download(file)
  })

  static testEmailTemplate = catchAsync(async (req: Request, res: Response) => {
    const { html, to } = req.body

    await EmailHelpers.sendEmailTemplate({
      to: to,
      subject: 'Email template test',
      html_content: html,
    })

    return sendResponse({
      res,
      res_code: 200,
      response_code: ResponseCodes.SUCCESS,
      success: true,
    })
  })
}

export default TestController
