import { uploadOnCloundinary } from "../config/cloudinary.config.js";
import { Post, PostImg } from "../models/post.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const createPost = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res
      .status(400)
      .json(ApiResponse.error(400, null, "User is required to post !"));
  }

  const { caption, description, location } = req.body;
  
  const images = req.files;

  if (!images || images.length === 0) {
    return res
      .status(400)
      .json(ApiResponse.error(400, null, "No Images found !"));
  }

  try {
    const post = await Post.create({ caption, description, location, userId });

    const uploadedImages = [];

    for (const file of images) {
      const img = await uploadOnCloundinary(file.path);
      const postImage = await PostImg.create({
        imgUrl: img.url,
        postId: post.id,
      });
      uploadedImages.push(postImage);
    }

    return res
      .status(201)
      .json(
        ApiResponse.success(
          201,
          post,
          "Post created & Images uploaded Successfully !"
        )
      );
  } catch (error) {
    return res
      .status(500)
      .json(ApiResponse.error(500, error, "Failed to post !"));
  }
};
