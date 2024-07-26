import { Router } from 'express'
import { EventsController } from '../controllers/admin/events.controller'
import { ExhibitionInfoController } from '../controllers/admin/exhibition-info.controllers'
import { authenticateRequests } from '../middlewares/authenticateRequest.middleware'
import validator from '../middlewares/validator.middleware'
import { EventValidations } from '../validations/events.validations'
import { conferencProgramsValidations } from '../validations/conferenc-programs.validations'
import { conferenceProgramsController } from '../controllers/admin/conference-programs.controller'
import { UsersController } from '../controllers/web/users.controllers'
import { UserValidations } from '../validations/users.validations'
import { ConferenceProgrammeAttendeesController } from '../controllers/admin/conference-programme-attendees.controllers'
import { MeetingsController } from '../controllers/meetings.controller'
import { networkingEventsValidations } from '../validations/networking-events.validations'
import { networkingEventsController } from '../controllers/admin/networking-events.controller'
import { CompaniesController } from '../controllers/admin/companies.controller'
import { categoryController } from '../controllers/admin/categories.controller'
import { ExhibitorController } from '../controllers/admin/exhibitors.controller'
import { HotelController } from '../controllers/admin/hotels.controllers'

const multer = require('multer')

const router = Router()

const storage = multer.memoryStorage()

const upload = multer({
  storage: storage,
  // limits: {},
})

/**
 * Events routes
 */
router.get(
  `/events/:event_id`,
  validator(EventValidations.getEventDetails),
  EventsController.getEventDetailsByForWeb
)

router.get('/events', EventsController.getEvents)
router.get(
  '/events/exhibition-info/info-by-type/:event_id',
  ExhibitionInfoController.getExhibitionInfoByInfoType
)
router.get(
  '/events/exhibition-info/:event_id',
  ExhibitionInfoController.getExhibitionInfo
)

router.post(
  `/events/login`,
  validator(EventValidations.loginToEvent),
  EventsController.logInToEvent
)

router.post(
  `/events/:event_id/verify-invite`,
  authenticateRequests,
  UsersController.verifyEventInvite
)

/**
 * 1-1 Meetings
 */

router.post(
  `/events/one-to-one-meetings/booked-schedules`,
  authenticateRequests,
  validator(UserValidations.getBookedSchedules),
  MeetingsController.getBookedSchedules
)

router.post(
  `/events/:event_id/one-to-one-meetings/create-meeting-request`,
  authenticateRequests,
  validator(UserValidations.createMeetingRequest),
  MeetingsController.createMeetingRequest
)

router.get(
  `/events/:event_id/one-to-one-meetings/accept-meeting-request`,
  validator(UserValidations.acceptMeeting),
  MeetingsController.acceptMeeting
)

router.get(
  `/events/:event_id/one-to-one-meetings/join-colleagues-meeting`,
  authenticateRequests,
  validator(UserValidations.acceptMeeting),
  MeetingsController.joinColleagueMeeting
)

router.get(
  `/one-to-one-meetings/colleagues-meeting/cancel`,
  authenticateRequests,
  validator(UserValidations.cancelColleagueMeeting),
  MeetingsController.cancelColleagueMeeting
)

router.post(
  `/events/:event_id/one-to-one-meetings/cancel-meeting`,
  authenticateRequests,
  validator(UserValidations.cancelMeeting),
  MeetingsController.cancelMeeting
)

router.get(
  `/events/:event_id/one-to-one-meetings/meeting-requests-by-user`,
  authenticateRequests,
  validator(UserValidations.getMeetingRequestsByUser),
  MeetingsController.getMeetingRequestsByUser
)

router.get(
  `/events/:event_id/one-to-one-meetings/meeting-requests-by-others-to-user`,
  authenticateRequests,
  validator(UserValidations.getMeetingRequestsByOthersToUser),
  MeetingsController.getMeetingRequestsByOtherToUser
)

router.get(
  `/events/:event_id/one-to-one-meetings/meeting-requests-from-colleagues`,
  authenticateRequests,
  validator(UserValidations.getMeetingRequestsByOthersToUser),
  MeetingsController.getMeetingFromColleagues
)

router.get(
  `/events/:event_id/one-to-one-meetings/scheduled-meetings-for-user`,
  authenticateRequests,
  validator(UserValidations.getScheduledMeetingsForUser),
  MeetingsController.getScheduledMeetingsForUser
)

router.get(
  `/one-to-one-meetings/:meeting_id`,
  authenticateRequests,
  MeetingsController.getMeetingDetailsById
)

router.put(
  `/one-to-one-meetings/update-meeting`,
  authenticateRequests,
  MeetingsController.updateMeeting
)

router.post(
  `/one-to-one-meetings/reschedule/:meeting_id`,
  authenticateRequests,
  validator(UserValidations.rescheduleMeeting),
  MeetingsController.rescheduleMeeting
)

router.get(
  `/one-to-one-meetings/decline/:meeting_id`,
  MeetingsController.declineMeeting
)

router.post(
  `/auth/login`,
  validator(UserValidations.login),
  UsersController.loginToWeb
)

router.post(
  `/auth/change-password`,
  authenticateRequests,
  validator(UserValidations.changePassword),
  UsersController.changePassword
)

router.get(
  `/events/:event_id/conference-programs`,
  validator(conferencProgramsValidations.getConferencPrograms),
  conferenceProgramsController.getConferencePrograms
)

router.get(
  `/events/:event_id/conference-programs/schedules-for-user`,
  authenticateRequests,
  validator(conferencProgramsValidations.getSchedulesForUser),
  conferenceProgramsController.getConferenceProgramSchedulesForUser
)

/**
 * Delegates for the event
 */
router.get(
  `/events/:event_id/all-delegates`,
  authenticateRequests,
  validator(UserValidations.getAllUsersForEvent),
  UsersController.getUsersForEvent
)

/**
 * Exhibitors for the event
 */
router.get(
  `/events/:event_id/exhibitors`,
  authenticateRequests,
  ExhibitorController.getExhibitorsForEvent
)

/**
 * Hotels for the event
 */
router.get(
  `/events/:event_id/hotels`,
  authenticateRequests,
  HotelController.webGetHotelsForEvent
)

/**
 * Routes for conference programs
 */

router.post(
  `/conference-programs/add-to-schedule`,
  authenticateRequests,
  validator(conferencProgramsValidations.addToSchedule),
  ConferenceProgrammeAttendeesController.addToUserSchedule
)

router.post(
  `/conference-programs/cancel-schedule`,
  authenticateRequests,
  validator(conferencProgramsValidations.cancelConferenceProgrammeFromSchedule),
  ConferenceProgrammeAttendeesController.cancelSchedule
)

/**
 * Meeting Managements
 */

router.get(
  `/users/:user_id/meeting-managements`,
  authenticateRequests,
  UsersController.getMeetingManagementsForEvent
)

router.post(
  `/users/:user_id/meeting-managements/update-settings`,
  authenticateRequests,
  validator(UserValidations.updateMeetingManagementSettings),
  UsersController.updateMeetingManagementSettings
)

router.get(
  `/users/profile`,
  authenticateRequests,
  UsersController.getUserProfileWithProfileSurvey
)

router.get(
  `/users/details`,
  authenticateRequests,
  validator(UserValidations.getUserDetails),
  UsersController.getUserDetails
)

router.get(`/users/:user_id`, authenticateRequests, UsersController.getUser)

router.post(
  `/users/profile/update`,
  authenticateRequests,
  UsersController.updateUserProfile
)

router.post(
  `/users/profile/update-profile-image`,
  upload.single('profile_image'),
  authenticateRequests,
  UsersController.updateProfileImage
)

router.get(`/companies`, authenticateRequests, CompaniesController.getCompanies)

router.get(
  `/industries`,
  authenticateRequests,
  categoryController.getCategories
)

/**
 * Networking events
 */

router.get(
  `/events/:event_id/networking-events`,
  authenticateRequests,
  validator(networkingEventsValidations.getNetworkingEvents),
  networkingEventsController.getNetworkingEventsForUser
)

router.post(
  `/networking-events/schedule`,
  authenticateRequests,
  validator(networkingEventsValidations.schedule),
  networkingEventsController.addToSchedule
)

router.get(
  `/networking-events/schedules/:networking_event_schedule_id/cancel-schedule`,
  authenticateRequests,
  networkingEventsController.cancelSchedule
)

const webRoutes = router

export default webRoutes
