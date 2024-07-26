import { validate } from "express-validation";

interface schema {
  params?: object;
  headers?: object;
  query?: object;
  cookies?: object;
  signedCookies?: object;
  body?: object;
}

export const customValidate = (validationSchema: schema) => {
  const options = {
    context: false,
    statusCode: 200,
    keyByField: true,  
  };
  return validate(validationSchema, options);
};
