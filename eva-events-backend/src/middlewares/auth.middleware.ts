import { Request, Response } from "express";
import User from "../models/users.model";
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

    try {
      const decoded = jwt.verify(`${token}`, config.ACCESS_TOKEN_SECRET);
      console.log(decoded);

      if (email == decoded.email) {
        req.user = decoded;
      } else {
        return res.status(200).json({
          success: false,
          response_code: ResponseCodes.USER_NOT_FOUND,
          message: "user not found!",
        });
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
