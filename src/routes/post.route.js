import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { createPost } from "../controller/post.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router
  .route("/createPost")
  .post(verifyToken, upload.array("images", 10), createPost);

export default router;
