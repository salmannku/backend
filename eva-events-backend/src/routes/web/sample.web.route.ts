import { Router } from 'express'
import QuestionsController from '../../controllers/web/questions.controller'
const multer = require('multer')
import { authenticateRequests } from '../../middlewares/authenticateRequest.middleware'
import getFeaturedQuestions from '../../controllers/web/featured.controller'
import { WebQuestionsValidations } from '../../validations/questions'
import validator from '../../middlewares/validator.middleware'

const router = Router()

const upload = multer({
  dest: 'src/uploads/',
  limits: {
    fieldSize: 8 * 1024 * 1024,
  },
})

router.post(
  `/`,
  upload.array('attachment_files', 2),
  QuestionsController.addQuestions
)

router.get(`/`, QuestionsController.getQuestions)
router.get(
  `/answers/:question_id`,
  authenticateRequests,
  validator(WebQuestionsValidations.getAnswersByQuestion),
  QuestionsController.getAnswersForQuestion
)
router.get(`/user`, authenticateRequests, QuestionsController.userGetQuestions)
router.get(
  `/user/open-questions`,
  authenticateRequests,
  QuestionsController.getUsersOpenQuestions
)
router.get(
  `/user/answered-questions`,
  authenticateRequests,
  QuestionsController.getUsersAnsweredQuestions
)
router.get(
  `/user-questions`,
  authenticateRequests,
  QuestionsController.getQuestionsForUser
)

router.get(`/featured`, getFeaturedQuestions)
router.get(`/:id`, QuestionsController.getByIdQuestions)
router.delete(`/:id`, QuestionsController.deleteQuestions)
router.delete(`/delete/question`, QuestionsController.BulkSDeleteQuestions)
router.delete(
  `/withdraw-request/:question_id`,
  authenticateRequests,
  QuestionsController.withdrawRequest
)

router.post(
  `/toggle-email-notification-for-answers`,
  authenticateRequests,
  validator(WebQuestionsValidations.toggleEmailNotificationForAnswers),
  QuestionsController.toggleEmailNotificationForAnswers
)

router.put(
  `/:id`,
  upload.array('attachment_files', 2),
  authenticateRequests,
  QuestionsController.confirmQuestion
)
router.get(`/search/:key`, QuestionsController.searchQuestions)
router.put(`/status/update`, QuestionsController.QuestionChangeStatus)
router.put(`/publish/update`, QuestionsController.QuestionIsPublish)
router.get(`/confirm/:questionId`, QuestionsController.getConfirmQuestion)
router.get(`/users/:userId`, QuestionsController.getQuestionByUser)

router.delete(
  `/attachments/:question_id/:attachment_id`,
  QuestionsController.removeAttachment
)

const questionsRoutes = router

export default questionsRoutes
