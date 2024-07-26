import Joi from 'joi'

class ReportValidations {
  static addReport = {
    body: Joi.object().keys({
      question_id: Joi.string().required(),
      description: Joi.string().required().default(''),
    }),
  }
}

export default ReportValidations
