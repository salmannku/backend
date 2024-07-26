import joi from "joi";

const validateSchedule = {
  body: joi.object().keys({
    start_time: joi.date().required(),
    end_time: joi.date().required(),
    date: joi.date().allow(null), // Allow null or a valid date
    expert: joi
      .string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required(), // ObjectId format validation
    day: joi.array().items(joi.number()).required(),
    week: joi.array().items(joi.number()).required(),
    month: joi.array().items(joi.number()).required(),
  }),
};
export default validateSchedule;
