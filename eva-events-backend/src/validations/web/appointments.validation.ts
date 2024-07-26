import joi from 'joi'
import { objectId } from '../custom.validation'

const validateAppointment = {
  body: joi.object().keys({
    agenda: joi.string().required(),
    title: joi.string().allow(null).optional(),
    date: joi.date().allow(null), // Allow null or a valid date
    expert: joi
      .string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required(), // ObjectId format validation
    schedule: joi
      .string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required(), // ObjectId format validation
    user: joi
      .string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required(), // ObjectId format validation
  }),
}

const validateApproveAppointment = {
  params: joi.object().keys({
    appointmentId: joi.string().required().custom(objectId),
  }),
}

const validateCancelAppointment = {
  params: joi.object().keys({
    appointmentId: joi.string().required().custom(objectId),
  }),

  body: joi.object().keys({
    rejectReason: joi.string().allow(null).optional(),
  }),
}

const validateGetAppointment = {
  query: joi.object().keys({
    status: joi.string().optional().allow(''),
  }),
}

export {
  validateAppointment,
  validateApproveAppointment,
  validateCancelAppointment,
  validateGetAppointment,
}
