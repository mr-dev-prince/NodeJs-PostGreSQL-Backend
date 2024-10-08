import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  createPost,
  deletePost,
  editPostById,
  getAllPosts,
  getPostById,
} from "../controller/post.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { getLikeCount, likeUnlike } from "../controller/like.controller.js";
import {
  comment,
  deleteComment,
  getComments,
} from "../controller/comment.controller.js";

const router = Router();

router
  .route("/create")
  .post(verifyToken, upload.array("images", 10), createPost);

router.route("/getAllPosts").get(verifyToken, getAllPosts);
router.route("/getPostById").get(verifyToken, getPostById);

router.route("/delete").delete(verifyToken, deletePost);
router.route("/update").patch(verifyToken, editPostById);

router.route("/like").post(verifyToken, likeUnlike);
router.route("/likeCount").get(getLikeCount);

router.route("/comment").post(verifyToken, comment);
router.route("/comments").get(getComments);

router.route("/deleteComment").delete(verifyToken, deleteComment);

export default router;
