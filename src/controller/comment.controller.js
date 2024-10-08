import { Op } from "sequelize";
import { sequelize } from "../database/sequelizeInstance.js";
import { Comment } from "../models/comment.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const comment = async (req, res) => {
  const userId = req.user?.id;
  const { postId, comment } = req.body;

  if (!userId) {
    return res
      .status(400)
      .json(ApiResponse.error(400, null, "User required to post comment"));
  }

  if (!postId) {
    return res.status(400).json(400, null, "Post id not found!");
  }

  try {
    await Comment.create({ comment, postId, userId });
    return res
      .status(200)
      .json(ApiResponse.success(200, null, "Comment Created Successfully!"));
  } catch (error) {
    console.log("this is error----------->", error);
    return res
      .status(500)
      .json(ApiResponse.error(500, error, "Failed to post comment"));
  }
};

export const getComments = async (req, res) => {
  const postId = req.body?.postId;

  if (!postId) {
    return res
      .status(400)
      .json(ApiResponse.error(400, null, "Post Id not found"));
  }

  try {
    const count = await Comment.findAndCountAll({ where: { postId } });
    return res
      .status(200)
      .json(
        ApiResponse.success(200, count, "Comment count fetched successfully !")
      );
  } catch (error) {
    return res
      .status(500)
      .json(ApiResponse.error(500, error, "Failed to get comment count"));
  }
};

export const deleteComment = async (req, res) => {
  const commentId = req.body?.commentId;
  const userId = req.user?.id;

  if (!commentId) {
    return res
      .status(400)
      .json(ApiResponse.error(400, null, "Comment Id not found!"));
  }

  const transaction = await sequelize.transaction();
  try {
    const comment = await Comment.findOne({
      where: { [Op.and]: [{ id: commentId, userId: userId }] },
      transaction,
    });

    if (!comment) {
      return res
        .status(400)
        .json(ApiResponse.error(400, null, "Comment not found!"));
    }

    await comment.destroy();
    await transaction.commit();

    return res
      .status(200)
      .json(ApiResponse.success(200, null, "Comment deleted successfully!"));
  } catch (error) {
    await transaction.rollback();
    console.log("i am error----------->", error);
    return res
      .status(500)
      .json(ApiResponse.error(500, error, "Failed to delete comment!"));
  }
};

export const editComment = async (req, res) => {
  const { commentId, newComment } = req.body?.commentId;
  const userId = req.user?.id;

  if (!commentId) {
    return res
      .status(400)
      .json(ApiResponse.error(400, null, "Comment id Not found!"));
  }

  if (!userId) {
    return res
      .status(400)
      .json(ApiResponse.error(400, null, "User not found!"));
  }

  const transaction = await sequelize.transaction();

  try {
    const comment = await Comment.findOne({
      where: { [Op.and]: [{ commentId, userId }] },
      transaction,
    });

    if (!comment) {
      return res
        .status(400)
        .json(ApiResponse.error(400, null, "Comment not found!"));
    }

    await Comment.update({ comment: newComment }, { where: { id: commentId } });
    await transaction.commit();

    return res
      .status(200)
      .json(ApiResponse.success(200, null, "Comment update success !"));
  } catch (error) {
    await transaction.rollback();
    return res
      .status(500)
      .json(ApiResponse.error(500, error, "Failed to edit message!"));
  }
};
