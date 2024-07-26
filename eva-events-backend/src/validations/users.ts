import { Joi } from "express-validation";

export const userObject = Joi.object().keys({
  email: Joi.string().required(),
});

const userValidation = {
  body: Joi.array().items(userObject),
};
export default userValidation;