import joi from 'joi'

const validateExpert = (data: any) => {
  const schema = joi.object({
    first_name: joi.string().required(),
    last_name: joi.string().required(),
    birth_date: joi.string().required(),
    qualification_course_name: joi.string().required(),
  })
  return schema.validate(data)
}

export class ExpertValidations {
  static searchExperts = {
    query: joi.object().keys({
      search: joi.string().required().allow(''),
      page: joi.string().required(),
      per_page: joi.string().required(),
    }),
  }

  static getActiveQuestions = {
    query: joi.object().keys({
      limit: joi.string().required(),
      page: joi.string().required(),
      category: joi.string().optional().allow(''),
    }),
  }
}
export default validateExpert
