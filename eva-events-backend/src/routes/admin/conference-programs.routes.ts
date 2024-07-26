import { Router } from 'express'
import validator from '../../middlewares/validator.middleware'
import { authenticateRequests } from '../../middlewares/authenticateRequest.middleware'
import { conferencProgramsValidations } from '../../validations/conferenc-programs.validations'
import { conferenceProgramsController } from '../../controllers/admin/conference-programs.controller'
import { ConferenceProgrammeAttendeesController } from '../../controllers/admin/conference-programme-attendees.controllers'

const router = Router()

router.get(
  `/`,
  authenticateRequests,
  validator(conferencProgramsValidations.getConferencPrograms),
  conferenceProgramsController.getConferencePrograms
)

router.get(
  `/:conference_program_id`,
  authenticateRequests,
  conferenceProgramsController.getConferenceProgrammeDetails
)

/**
 * Attendee users
 */
router.get(
  `/:conference_program_id/attendee-delegates`,
  authenticateRequests,
  conferenceProgramsController.getAttendeeDelegates
)

router.get(
  `/:conference_program_id/attendee-speakers`,
  authenticateRequests,
  conferenceProgramsController.getAttendeeSpeakers
)

router.get(
  `/:conference_program_id/attendee-exhibitors`,
  authenticateRequests,
  conferenceProgramsController.getAttendeeExhibitors
)

router.get(
  `/:conference_program_id/attendee-sponsors`,
  authenticateRequests,
  conferenceProgramsController.getAttendeeSponsors
)

router.get(
  `/:conference_program_id/attendee-media-partners`,
  authenticateRequests,
  conferenceProgramsController.getAttendeeMediaPartners
)


router.post(
  `/create`,
  authenticateRequests,
  validator(conferencProgramsValidations.createConferencProgramme),
  conferenceProgramsController.createConferencePrograms
)

router.post(
  `/add-to-schedule`,
  authenticateRequests,
  validator(conferencProgramsValidations.addToSchedule),
  ConferenceProgrammeAttendeesController.addToUserSchedule
)

router.post(
  `/cancel-schedule`,
  authenticateRequests,
  validator(conferencProgramsValidations.cancelConferenceProgrammeFromSchedule),
  ConferenceProgrammeAttendeesController.cancelSchedule
)

router.put(
  `/update/:conference_program_id`,
  authenticateRequests,
  validator(conferencProgramsValidations.updateConferencProgramme),
  conferenceProgramsController.updateConferencePrograms
)

router.put(
  `/update/:conference_program_id`,
  authenticateRequests,
  validator(conferencProgramsValidations.updateConferencProgramme),
  conferenceProgramsController.updateConferencePrograms
)

router.delete(
  `/delete-permanent/:conference_program_id`,
  authenticateRequests,
  conferenceProgramsController.deleteConferenceProgramme
)

const conferenceProgramRoutes = router

export default conferenceProgramRoutes
