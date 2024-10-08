import { uploadOnCloundinary } from "../config/cloudinary.config.js";
import { Post, PostImg } from "../models/post.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const createPost = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res
      .status(400)
      .json(ApiResponse.error(400, null, "No User found! Login First!"));
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

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [
        {
          model: PostImg,
          as: "images",
          attributes: ["imgUrl"],
        },
      ],
    });

    if (!posts) {
      return res
        .status(401)
        .json(ApiResponse.error(401, null, "No Posts Found"));
    }

    return res
      .status(200)
      .json(ApiResponse.success(200, posts, "All Posts Fetched !"));
  } catch (error) {
    return res
      .status(500)
      .json(ApiResponse.error(500, error, "Failed to get all posts !!"));
  }
};

export const getPostById = async (req, res) => {
  const postid = req.query?.id;

  if (!postid) {
    return res.status(400).json(ApiResponse.error(400, null, "No id provided"));
  }

  try {
    const postById = await Post.findOne({
      where: { id: postid },
      include: [
        {
          model: PostImg,
          as: "images",
          attributes: ["imgUrl"],
        },
      ],
    });

    if (!postById) {
      return res
        .status(400)
        .json(
          ApiResponse.error(
            400,
            null,
            "No post with the specified id was found !"
          )
        );
    }

    return res
      .status(200)
      .json(
        ApiResponse.success(
          200,
          postById,
          "Post with specified id was fetched successfully !"
        )
      );
  } catch (error) {
    return res
      .status(500)
      .json(
        ApiResponse.error(400, null, "Failed to get post by specified ID.")
      );
  }
};

export const editPostById = async (req, res) => {
  const postId = req.query?.postId;


  if (!postId) {
    return res
      .status(400)
      .json(ApiResponse.error(400, null, "PostId not found!"));
  }

  const { newCaption, newDescription, newLocation } = req.body;

  try {
    const post = await Post.findOne({ id: postId });

    if (!post) {
      return res
        .status(400)
        .json(ApiResponse.error(400, null, "PostId not found!"));
    }

    const [affectedRows, updatedPost] = await Post.update(
      {
        caption: newCaption,
        description: newDescription,
        location: newLocation,
      },
      { where: { id: postId }, plain: true, returning: true }
    );

    if (affectedRows === 0) {
      return res
        .status(200)
        .json(ApiResponse.success(200, null, "No updates found!"));
    }

    return res
      .status(200)
      .json(ApiResponse.success(200, updatedPost, "Post Updated!"));
  } catch (error) {
    return res
      .status(500)
      .json(ApiResponse.error(500, error, "Failed to update the post.."));
  }
};

export const deletePost = async (req, res) => {
  const postId = req.query?.postId;

  if (!postId) {
    return res
      .status(400)
      .json(ApiResponse.error(400, null, "Post Id not provided!"));
  }

  try {
    const post = await Post.findOne({ id: postId });

    if (!post) {
      return res
        .status(400)
        .json(ApiResponse.error(400, null, "Post Id not provided!"));
    }

    await post.destroy();

    return res
      .status(200)
      .json(ApiResponse.success(200, null, "Post deleted successfully"));
  } catch (error) {
    return res
      .status(500)
      .json(ApiResponse.error(500, error, "Failed to delete post"));
  }
};
