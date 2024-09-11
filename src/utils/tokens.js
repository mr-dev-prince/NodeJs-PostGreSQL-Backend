import { User } from "../models/user.model.js";
import { ApiResponse } from "./ApiResponse.js";

export const generateTokens = async (userId) => {
  try {
    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error("User not found");
    }
    
    console.log("I am here -------> generateTokens");

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.log("failed to generate error", error);
  }
};
