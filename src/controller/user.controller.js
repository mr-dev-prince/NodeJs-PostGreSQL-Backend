import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { generateTokens } from "../utils/tokens.js";
import { uploadOnCloundinary } from "../config/cloudinary.config.js";
import bcrypt from "bcrypt";
import { sendMail } from "../utils/SendMail.js";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import { SendSuccessMail } from "../utils/SendSuccessMail.js";

export const register = async (req, res) => {
  const { name, email, password, username } = req.body;

  if (!(name || email || password || username)) {
    return res
      .status(409)
      .json(ApiResponse.error(409, null, "Empty fields !!"));
  }

  try {
    const userExist = await User.findOne({ where: { email, username } });

    if (userExist) {
      return res
        .status(400)
        .json(ApiResponse.error(400, "User already exists", null));
    }

    const token = jwt.sign({ email: email }, process.env.TOKEN_SECRET, {
      expiresIn: "1h",
    });

    const newUser = await User.create({
      name,
      username,
      email,
      password,
      verifyToken: token,
      verifyTokenExpiry: Date.now() + 3600 * 1000,
    });

    // send verification mail

    const verificationUrl = `http://localhost:8000/api/v1/user/verifyEmail?token=${token}`;
    const subject = `Verify your email address`;

    await sendMail(username, email, verificationUrl, subject);

    return res
      .status(201)
      .json(ApiResponse.success(201, newUser, "New User Created!"));
  } catch (error) {
    console.log("Register error------------>", error);
    return res
      .status(500)
      .json(ApiResponse.error(500, error, "Error while registering user!"));
  }
};

export const login = async (req, res) => {
  const { email, password, username } = req.body;
  const findByEmailOrUsername = {};

  if (!password || (!email && !username)) {
    return res.status(400).json(ApiResponse.error(400, null, "Empty field !"));
  }

  if (email) {
    findByEmailOrUsername.email = email;
  }

  if (username) {
    findByEmailOrUsername.username = username;
  }

  try {
    const user = await User.findOne({
      where: findByEmailOrUsername,
    });

    if (!user) {
      return res
        .status(400)
        .json(ApiResponse.error(400, null, "User doesn't exist"));
    }

    const userId = user.id;

    const verifyPassword = await user.isPasswordCorrect(password);

    if (!verifyPassword) {
      return res
        .status(400)
        .json(ApiResponse.error(400, null, "Password verification failed"));
    }

    const { accessToken, refreshToken } = await generateTokens(userId);

    const loggedInUser = await User.findOne({
      where: { id: userId },
      attributes: { exclude: ["refreshToken", "password"] },
    });

    const options = {
      httpOnly: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(ApiResponse.success(200, loggedInUser, "User logged in :)"));
  } catch (error) {
    console.log("Login error------>", error);
    return res
      .status(500)
      .json(ApiResponse.error(500, error, "Error while logging in !"));
  }
};

export const getUserDetails = async (req, res) => {
  try {
    return res
      .status(200)
      .json(ApiResponse.success(200, req.user, "User details fetched"));
  } catch (error) {
    return res
      .status(500)
      .json(ApiResponse.error(500, error, "Failed to get user detailss"));
  }
};

export const logout = async (req, res) => {
  try {
    const userId = req.user?.id;

    await User.update(
      { refreshToken: null },
      { where: { id: userId }, plain: true }
    );

    const options = {
      httpOnly: true,
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(ApiResponse.success(200, null, "User logged out !!"));
  } catch (error) {
    return res
      .status(500)
      .json(ApiResponse.error(500, error, "Error while logging out the user"));
  }
};

export const updateUser = async (req, res) => {
  const { name, dob, gender, city, state, country } = req.body;

  try {
    const userId = req.user?.id;

    const [numberOfAffectedRows, affectedRows] = await User.update(
      {
        name,
        dob,
        gender,
        city,
        state,
        country,
      },
      { where: { id: userId }, plain: true, returning: true }
    );

    if (numberOfAffectedRows === 0) {
      return res
        .status(400)
        .json(ApiResponse.error(400, null, "No changes made !"));
    }

    return res
      .status(200)
      .json(
        ApiResponse.success(200, affectedRows, "Details Updated Successfully!")
      );
  } catch (error) {
    return res
      .status(500)
      .json(ApiResponse.error(500, error, "Failed to update !"));
  }
};

export const uploadProfileImg = async (req, res) => {
  const profileImgPath = req.file?.path;

  if (!profileImgPath) {
    return res
      .status(400)
      .json(ApiResponse.error(400, null, "No files found!"));
  }

  try {
    const userId = req.user?.id;

    const img = await uploadOnCloundinary(profileImgPath);

    if (!img.url) {
      return res
        .status(400)
        .json(
          ApiResponse.error(400, null, "Profile image could not be uploaded")
        );
    }

    const [numberOfAffectedRows, affectedRows] = await User.update(
      { profileImg: img?.url },
      { where: { id: userId }, plain: true, returning: true }
    );

    if (numberOfAffectedRows === 0) {
      return res
        .status(400)
        .json(
          ApiResponse.error(
            400,
            null,
            "User not found || Failed to upload image!"
          )
        );
    }

    return res
      .status(200)
      .json(
        ApiResponse.success(200, affectedRows, "Profile image uploaded !!")
      );
  } catch (error) {
    return res
      .status(500)
      .json(ApiResponse.error(500, error, "Failed to upload profile Image"));
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = req.user?.id;

    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      return res
        .status(400)
        .json(ApiResponse.error(400, null, "User not found"));
    }

    await user.destroy();

    return res
      .status(200)
      .json(ApiResponse.success(200, null, "Deleted User Successfully !"));
  } catch (error) {
    return res
      .status(500)
      .json(ApiResponse.error(500, error, "Failed to delete user!"));
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const userId = req.user?.id;

    const user = await User.findOne({ where: { id: userId } });

    const verifyPassword = await user.isPasswordCorrect(oldPassword);

    if (!verifyPassword) {
      return res
        .status(400)
        .json(ApiResponse.error(400, null, "Wrong password!"));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.set({ password: hashedPassword });

    await user.save();

    return res
      .status(200)
      .json(ApiResponse.success(200, null, "Password changed successfully!"));
  } catch (error) {
    return res
      .status(500)
      .json(ApiResponse.error(500, error, "Error changing password!"));
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const token = req.query?.token;

    if (!token) {
      return res
        .status(400)
        .json(ApiResponse.error(400, null, "Unauthorised access !"));
    }

    const user = await User.findOne({
      where: { verifyToken: token, verifyTokenExpiry: { [Op.gt]: Date.now() } },
    });

    if (!user) {
      return res
        .status(400)
        .json(ApiResponse.error(400, null, "Token Expired"));
    }

    if (user.isEmailVerified) {
      return res
        .status(400)
        .json(ApiResponse.error(400, null, "Email already verified"));
    }

    await User.update(
      { isEmailVerified: true, verifyToken: null, verifyTokenExpiry: null },
      { where: { verifyToken: token } }
    );

    return res
      .status(200)
      .json(ApiResponse.success(200, null, "Email Verified Successfully!!"));
  } catch (error) {
    console.log("email verification error------------->", error);
    return res
      .status(500)
      .json(ApiResponse.error(500, error, "Failed to verify email !"));
  }
};

export const resetPasswordEmail = async (req, res) => {
  const { email, username } = req.body;

  if (!email && !username) {
    return res.status(400).json(ApiResponse.error(400, null, "Empty fields"));
  }

  const conditions = [];
  if (email) {
    conditions.push({ email });
  } else {
    conditions.push({ username });
  }

  try {
    const user = await User.findOne({
      where: { [Op.or]: conditions },
    });

    if (!user) {
      return res
        .status(400)
        .json(ApiResponse.error(400, null, "User doesn't exists!"));
    }

    const resetToken = jwt.sign(
      { email: user.email },
      process.env.TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    await User.update(
      {
        resetToken: resetToken,
        resetTokenExpiry: Date.now() + 3600 * 1000,
      },
      {
        where: { id: user.id },
      }
    );

    const resetUrl = `http://localhost:8000/api/v1/user/resetPassword?token=${resetToken}`;
    const subject = `Reset your password`;

    await sendMail(user.username, user.email, resetUrl, subject);

    return res
      .status(200)
      .json(
        ApiResponse.success(
          200,
          null,
          "Reset Password link is sent to your email !"
        )
      );
  } catch (error) {
    console.log("reset password error ------------->", error);
    return res
      .status(500)
      .json(ApiResponse.error(500, error, "Failed to send reset email."));
  }
};

export const resetPassword = async (req, res) => {
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json(ApiResponse.error(400, null, "Empty fields"));
  }

  const token = req.query?.token;

  if (!token) {
    return res.status(400).json(ApiResponse.error(400, null, "No token found"));
  }

  try {
    const user = await User.findOne({
      where: { resetToken: token, resetTokenExpiry: { [Op.gt]: Date.now() } },
    });

    if (!user) {
      return res
        .status(400)
        .json(ApiResponse.error(400, null, "Token expired!"));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.update(
      { password: hashedPassword },
      { where: { resetToken: token } }
    );

    const successMessage = "Your password has been reset successfully !";
    const subject = "Reset password success";

    await SendSuccessMail(user.username, user.email, successMessage, subject);

    return res
      .status(200)
      .json(ApiResponse.success(200, null, "Reset password success"));
  } catch (error) {
    return res
      .status(500)
      .json(ApiResponse.error(500, error, "Failed to reset password !"));
  }
};

export const resendVerifyEmail = async (req, res) => {
  const email = req.user?.email;

  if (!email) {
    return res
      .status(400)
      .json(ApiResponse.error(400, null, "Unauthorized access!"));
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res
        .status(400)
        .json(ApiResponse.error(400, null, "User not found!"));
    }

    if (user.isEmailVerified) {
      return res
        .status(400)
        .json(ApiResponse.error(400, null, "Email already verified"));
    }

    const token = jwt.sign({ email: email }, process.env.TOKEN_SECRET, {
      expiresIn: "1h",
    });

    if (!token) {
      return res
        .status(405)
        .json(ApiResponse.error(405, null, "failed to generate token !!"));
    }

    await User.update(
      {
        verifyToken: token,
        verifyTokenExpiry: Date.now() + 3600 * 1000,
      },
      { where: { email } }
    );

    const verificationUrl = `http://localhost:8000/api/v1/user/verifyEmail?token=${token}`;
    const subject = `Verify your email address`;

    await sendMail(user.username, user.email, verificationUrl, subject);

    return res
      .status(200)
      .json(ApiResponse.success(200, null, "Email sent successfully"));
  } catch (error) {
    return res
      .status(500)
      .json(ApiResponse.error(500, error, "Failed to send email !"));
  }
};

export const changeEmail = async (req, res) => {

  const { newEmail } = req.body;

  if (!newEmail) {
    return res
      .status(400)
      .json(ApiResponse.error(400, null, "No Email provided !"));
  }

  const reqEmail = req.user?.email;

  if (!reqEmail) {
    return res
      .status(400)
      .json(ApiResponse.error(400, null, "Unauthorized access !"));
  }

  try {
    const user = await User.findOne({ where: { email: reqEmail } });

    if (!user) {
      return res
        .status(400)
        .json(ApiResponse.error(400, null, "User not found!"));
    }

    const token = jwt.sign({ email: newEmail }, process.env.TOKEN_SECRET, {
      expiresIn: "1h",
    });

    await User.update(
      {
        email: newEmail,
        verifyToken: token,
        verifyTokenExpiry: Date.now() + 3600 * 1000,
      },
      { where: { email: reqEmail } }
    );

    const verificationUrl = `http://localhost:8000/api/v1/user/verifyEmail?token=${token}`;
    const subject = `Verify your email address`;

    await sendMail(user.username, newEmail, verificationUrl, subject);

    return res
      .status(200)
      .json(
        ApiResponse.success(
          200,
          null,
          "Email changed and verification mail sent to the new email address ..."
        )
      );
  } catch (error) {
    return res
      .status(500)
      .json(ApiResponse.error(500, error, "Failed to change email"));
  }
};
