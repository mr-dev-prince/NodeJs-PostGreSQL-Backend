import { Op } from "sequelize";
import { Like } from "../models/like.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sequelize } from "../database/sequelizeInstance.js";

export const likeUnlike = async (req, res) => {
  const userId = req.user?.id;
  const postId = req.body?.postId;

  if (!userId) {
    return res
      .status(400)
      .json(ApiResponse.error(400, null, "User not found!"));
  }

  if (!postId) {
    return res
      .status(400)
      .json(ApiResponse.error(400, null, "Post not found!"));
  }

  const transaction = await sequelize.transaction();

  try {
    const likeExists = await Like.findOne({
      where: { [Op.and]: [{ postId }, { userId }] },
      transaction,
    });

    if (likeExists) {
      await likeExists.destroy({ transaction });
      await transaction.commit();
      return res
        .status(204)
        .json(ApiResponse.success(204, null, "Post Disliked!!"));
    }

    await Like.create({ postId, userId });
    await transaction.commit();

    return res.status(200).json(ApiResponse.success(200, null, "Post Liked!"));
  } catch (error) {
    await transaction.rollback();
    console.log("i am error----->", error);
    return res
      .status(500)
      .json(ApiResponse.error(500, error, "Failed to like!"));
  }
};

export const getLikeCount = async (req, res) => {
  const postId = req.query?.postId;

  if (!postId) {
    return res
      .status(400)
      .json(ApiResponse.error(400, null, "Post Id is required!"));
  }

  try {
    const count = await Like.count({
      where: { postId },
    });

    return res
      .status(200)
      .json(
        ApiResponse.success(200, count, "Like Count fetched successfully!")
      );
  } catch (error) {
    console.log("I am error---------->", error);
    return res
      .status(500)
      .json(ApiResponse.error(500, error, "Failed to get likes count!"));
  }
};
