import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { generateTokens } from "../utils/tokens.js";
import { uploadOnCloundinary } from "../config/cloudinary.config.js";
import bcrypt from "bcrypt";
import { sendVerifyEmail } from "../utils/SendMail.js";

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

    const newUser = await User.create({
      name,
      username,
      email,
      password,
    });

    // send verification mail

    const verificationUrl = `http://localhost:8000/api/v1/user/verifyEmail?id=${newUser.id}`;

    await sendVerifyEmail(username, email, verificationUrl);

    return res
      .status(201)
      .json(ApiResponse.success(201, newUser, "New User Created!"));
  } catch (error) {
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
    const id = req.query?.id;

    if (!id) {
      return res
        .status(400)
        .json(ApiResponse.error(400, null, "User ID is required"));
    }

    // Fetch the user first to check if it exists
    const user = await User.findOne({ where: { id } });

    if (!user) {
      return res
        .status(404)
        .json(ApiResponse.error(404, null, "User not found"));
    }

    // Check if the user is already verified
    if (user.isEmailVerified) {
      return res
        .status(400)
        .json(ApiResponse.error(400, null, "Email is already verified"));
    }

    // Update the user's email verification status
    const [numberOfRowsAffected, [updatedUser]] = await User.update(
      { isEmailVerified: true },
      {
        where: { id },
        returning: true, // This returns the updated rows
      }
    );

    if (numberOfRowsAffected === 0) {
      return res
        .status(400)
        .json(ApiResponse.error(400, null, "No changes made"));
    }

    return res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verification Success</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      animation: fadeIn 1s ease-out;
    }
    
    .container {
      text-align: center;
      background-color: #ffffff;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 0 20px rgba(0,0,0,0.1);
      animation: slideIn 0.5s ease-out;
    }
    
    h1 {
      color: #28a745;
      margin-bottom: 20px;
      font-size: 2em;
      animation: bounce 1s ease-out;
    }
    
    p {
      color: #555555;
      font-size: 1.2em;
      margin-bottom: 20px;
    }
    
    .button {
      display: inline-block;
      padding: 15px 30px;
      font-size: 1em;
      color: #ffffff;
      background-color: #007bff;
      text-decoration: none;
      border-radius: 5px;
      transition: background-color 0.3s ease;
    }
    
    .button:hover {
      background-color: #0056b3;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideIn {
      from { transform: translateY(-50px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
      }
      40% {
        transform: translateY(-30px);
      }
      60% {
        transform: translateY(-15px);
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Congratulations!</h1>
    <p>Your email has been successfully verified.</p>
    <a href="/" class="button">Go to Homepage</a>
  </div>

  <script>
    // Redirect after 5 seconds
    setTimeout(() => {
      window.location.href = "/";
    }, 5000);
  </script>
</body>
</html>
`);
  } catch (error) {
    return res
      .status(500)
      .json(ApiResponse.error(500, error, "Failed to verify email"));
  }
};
