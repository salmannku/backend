import Joi from 'joi'

export class UserSocketValidations {
  static joinQuestionDetailsRoom = Joi.object().keys({
    question_id: Joi.string().required(),
  })

  static joinCategorizerRoomForQuestion = Joi.object().keys({
    question_id: Joi.string().required(),
  })

  static getIncomingQuestions = Joi.object().keys({
    page: Joi.number().required(),
    limit: Joi.number().required(),
  })
}
