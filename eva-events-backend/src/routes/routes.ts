import { Router } from 'express'
import TestController from '../controllers/test-controller'
import adminUsersRoutes from './admin/admins.route'
import rolesRoutes from './admin/roles.route'
import permissionRoutes from './admin/permissions.route'
import eventRoutes from './admin/events.routes'
import uploadRoutes from './uploads.route'
import exhibitorRoutes from './admin/exhibitor.routes'
import sponsorRoutes from './admin/sponsors.routes'
import delegateRoutes from './admin/delegates.routes'
import speakerRoutes from './admin/speakers.routes'
import mediaPartnerRoutes from './admin/media-partners.routes'
import faqsRoutes from './admin/faqs.routes'
import conferenceProgramRoutes from './admin/conference-programs.routes'
import profileSurveyOptionRoutes from './admin/profile-survey-options.route'
import profileSurveySectionRoutes from './admin/profile-survey-sections.route'
import networkingEventRoutes from './admin/networking-events.route'
import hotelRoutes from './admin/hotels.routes'
import exhibitionInfoRoutes from './admin/exhibition-info.routes'
import webRoutes from './web.routes'
import categoryRoutes from './admin/categories.route'
import companiesRoutes from './admin/companies.routes'
import eventLocationsRoutes from './admin/event-locations.routes'
import emailTemplatesRoutes from './admin/email-templates.routes'
import Peoplebulkupload from './admin/people-bulk-upload.route'

const multer = require('multer')

const router = Router()

const upload = multer({
  dest: 'src/uploads/',
  limits: {
    fieldSize: 8 * 1024 * 1024,
  },
})

/**
 * Admin Routes
 */

/**
 * Events routes
 */
router.use('/api/admins/events', eventRoutes)

router.use('/api/admins/events/locations', eventLocationsRoutes)

router.use('/api/events/exhibition-info', exhibitionInfoRoutes)

/**
 * Exhibitor routes
 */
router.use('/api/admins/exhibitors', exhibitorRoutes)

/**
 * Delegate routes
 */
router.use('/api/admins/delegates', delegateRoutes)

/**
 * Sponsor routes
 */
router.use('/api/admins/sponsors', sponsorRoutes)

/**
 * Speaker routes
 */
router.use('/api/admins/speakers', speakerRoutes)

/**
 * Media Partners routes
 */
router.use('/api/admins/media-partners', mediaPartnerRoutes)

/**
 * Event FAQs
 */
router.use('/api/admins/faqs', faqsRoutes)

/**
 * Event categories
 */
router.use('/api/admins/categories', categoryRoutes)

/**
 *Event conference programs
 */
router.use('/api/admins/conference-programs', conferenceProgramRoutes)

/**
 * Profile Survey Options
 */
router.use('/api/admins/profile-survey-options', profileSurveyOptionRoutes)

/**
 * Profile Survey sections
 */
router.use('/api/admins/profile-survey-sections', profileSurveySectionRoutes)

/**
 * Hotels
 */
router.use('/api/admins/hotels', hotelRoutes)

/**
 * Networking events
 */
router.use('/api/admins/networking-events', networkingEventRoutes)

/**
 * Company routes
 */
router.use('/api/admin/companies', companiesRoutes)

/**
 * Email templates
 */
router.use('/api/email-templates', emailTemplatesRoutes)

// Roles
router.use('/api/admins/roles', rolesRoutes)

// Permissions
router.use('/api/admins/permissions', permissionRoutes)

// Admins
router.use('/api/admins', adminUsersRoutes)

// Uploads general route
router.use('/api/uploads', uploadRoutes)


/**
 * The People Bulk Upload route (Sponsor, Speaker, Media Partner, Delegates)
 */
router.use('/api/admins/people-bulk', Peoplebulkupload)

/**
 * Web routes
 */

router.use('/api/web', webRoutes)

router.get(
  '/api/download-file',
  // authenticateRequests,
  TestController.downloadFile
  // QuestionsController.addQuestionViews
)

/**
 * Test Route
 * Can be used for testing the different controllers and services file
 *
 */

router.post(
  '/api/test-route',
  // authenticateRequests,
  TestController.testFunction
  // QuestionsController.addQuestionViews
)

router.get(
  '/api/test-download-file',
  // authenticateRequests,
  TestController.downloadFile
  // QuestionsController.addQuestionViews
)

router.post(
  '/api/test-email-template',
  // authenticateRequests,
  upload.single('featured_image'),
  TestController.testEmailTemplate
  // QuestionsController.addQuestionViews
)

/**
 * Questionnaire routes
 */
const apiRoutes = router

export default apiRoutes
