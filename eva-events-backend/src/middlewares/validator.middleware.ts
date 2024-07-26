// import { Errback, NextFunction, Request, Response } from "express";
// import { ValidationError } from "express-validation";
// import { IResponse } from "../interfaces/common";

// export const validator = (
//   err: Errback,
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   if (err instanceof ValidationError) {
//     const errors = err as ValidationError;
//     const updatedErrors: Record<any, any> = {};

//     if (errors.details) {
//       (errors?.details as any)?.forEach((detail: Record<any, any>) => {
//         Object.keys(detail).forEach((item) => {
//           updatedErrors[item] = detail[item];
//         });
//       });
//     }
//     if (errors.details) {
//       delete (errors as any).details;
//     }
//     const resObject: IResponse<null> = {
//       ...errors,
//       success: false,
//       data: null,
//       errors: updatedErrors,
//     };

//     res.status(err.statusCode).json(resObject);
//     next();
//   }

//   res.status(200).json({ ...err, success: false });
//   next();
// };

import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import pick from "../utils/pick";

const validator = (schema: any) => (req: any, res: any, next: any) => {
  const validSchema = pick(schema, ["params", "query", "body"]);

  const object = pick(req, Object.keys(validSchema));

  const { value, error } = Joi.compile(validSchema)
    .prefs({ errors: { label: "key" }, abortEarly: false })
    .validate(object);

  if (error) {
    const errorMessage = error.details
      .map((details) => details.message.replace(/"/g, ""))
      .join(", ");
    return res.status(400).json({ error: errorMessage });
  }
  Object.assign(req, value);
  return next();
};

export default validator;
