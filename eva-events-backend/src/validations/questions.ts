import { Joi } from 'express-validation'

export const questionsValidationObject = Joi.object().keys({
  question: Joi.string().required(),
  // question_id: Joi.string().required(),
  attachments: Joi.string().required(),
  category: Joi.string().required(),
  equation: Joi.string().required(),
  code_snippet: Joi.string().required(),
  comment: Joi.string().required(),
})

const questionValidation = {
  body: Joi.array().items(questionsValidationObject),
}

/**
 * Admin
 * Question routes validations
 */

export const pendingQuestionsForRoutingValidationObject = {
  query: Joi.object().keys({
    page: Joi.string().required(),
    limit: Joi.string().required(),
  }),
}

export const questionRoutingRemoveExpertsValidation = {
  body: Joi.object().keys({
    question_id: Joi.string().required(),
    expert_ids: Joi.array().items(Joi.string()).required(),
  }),
}

export const questionRoutingUpdateCategoriesValidation = {
  body: Joi.object().keys({
    question_id: Joi.string().required(),
    categories: Joi.array().items(Joi.string()).required(),
  }),
}

export const questionRoutingRejectQuestionValidation = {
  body: Joi.object().keys({
    question_id: Joi.string().required(),
    reject_notes: Joi.string().optional().default(''),
  }),
}

export const addQuestionViewByExpertValidation = {
  body: Joi.object().keys({
    question_id: Joi.string().required(),
  }),
}

export const getIncomingQuestionsForExpertValidation = {
  query: Joi.object().keys({
    page: Joi.string().required(),
    limit: Joi.string().required(),
    category: Joi.string().optional().allow(''),
  }),
}

export class WebQuestionsValidations {
  static toggleEmailNotificationForAnswers = {
    query: Joi.object().keys({
      active: Joi.boolean().required().default(true),
      qid: Joi.string().required(),
      email: Joi.string().email().allow('')
    }),
  }

  static getAnswersByQuestion = {
    query: Joi.object().keys({
      page: Joi.string().required().default(1),
      limit: Joi.string().required().default(10),
    }),
  }
}

export default questionValidation
