import { Joi } from "express-validation";

export const questionsAttachmentsValidationObject = Joi.object().keys({
  question_id: Joi.string().required(),
  attachment_type: Joi.string().required(),
  attachment_name: Joi.string().required(),
  attachment_caption: Joi.string().required(),
  attachmentFile_format: Joi.string().required(),
  attachment_size: Joi.string().required(),
  attachment_url: Joi.string().required(),
});

const questionAttachment = {
  body: Joi.array().items(questionsAttachmentsValidationObject),
};
export default questionAttachment;