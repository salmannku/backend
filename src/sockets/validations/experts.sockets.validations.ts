import Joi from 'joi'

export class ExpertSocketValidations {
  static joinQuestionDetailsRoom = Joi.object().keys({
    question_id: Joi.string().required(),
  })

  static getIncomingQuestions = Joi.object().keys({
    page: Joi.number().required(),
    limit: Joi.number().required(),
  })
}
