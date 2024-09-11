import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.body?.accessToken ||
      req.headers["authorization"]?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(400)
        .json(ApiResponse.error(400, null, "No token found!"));
    }

    const decodedToken = jwt.decode(token, process.env.ACCESS_TOKEN_SECRET);

    if (!decodedToken) {
      return res
        .status(400)
        .json(ApiResponse.error(400, null, "Unauthorized token !!"));
    }

    const user = await User.findOne({
      where: { email: decodedToken.email },
      attributes: { exclude: ["refreshToken", "password"] },
    });

    if (!user) {
      return res
        .status(400)
        .json(ApiResponse.error(400, null, "User not found !!"));
    }

    req.user = user;

    next();
  } catch (error) {
    return res
      .status(500)
      .json(ApiResponse.error(500, error, "Token verification error!"));
  }
};
