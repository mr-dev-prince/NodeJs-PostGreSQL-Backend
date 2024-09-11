import { Router } from "express";
import {
  changePassword,
  deleteUser,
  getUserDetails,
  login,
  logout,
  register,
  updateUser,
  uploadProfileImg,
  verifyEmail,
} from "../controller/user.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/deleteUser").delete(verifyToken, deleteUser);

router.route("/getUser").get(verifyToken, getUserDetails);
router.route("/logout").get(verifyToken, logout);

router.route("/verifyEmail").get(verifyEmail);

router.route("/update").patch(verifyToken, updateUser);
router.route("/changePassword").patch(verifyToken, changePassword);

router
  .route("/uploadProfileImg")
  .patch(verifyToken, upload.single("profileImg"), uploadProfileImg);

export default router;
