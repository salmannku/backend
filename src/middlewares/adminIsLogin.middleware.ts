import { Request, Response } from "express";
import Admin from "../models/admins.model";
import ResponseCodes from "../utils/responseCodes";
const jwt = require("jsonwebtoken");

const config = process.env;

const verifyToken = async (req: any, res: any, next: any) => {
  const { email } = req.body;

  if (!req.headers.authorization) {
    return res.status(403).json("A token is required for authentication");
  }

  if (req.headers.authorization) {
    let token = req.headers.authorization.split(" ")[1];

    console.log("token >>>", token);

    try {
      const decoded = jwt.verify(`${token}`, config.ACCESS_TOKEN_SECRET);

      const admin: any = await Admin.findOne({ _id: decoded.user_id });

      if (!admin) {
        return res.status(201).json({
          success: false,
          message: "admin not found",
          response_code: ResponseCodes.USER_NOT_FOUND,
          data: null,
        });
      } else {
        if (decoded) {
          req.user = decoded;
        } else {
          return res.status(200).json({
            success: false,
            response_code: ResponseCodes.USER_NOT_FOUND,
            message: "user not found!",
          });
        }
      }
    } catch (err) {
      return res.status(401).json({
        success: false,
        response_code: ResponseCodes.INVALID_TOKEN,
        message: "Invalid Token",
      });
    }
    return next();
  }
};

module.exports = verifyToken;
