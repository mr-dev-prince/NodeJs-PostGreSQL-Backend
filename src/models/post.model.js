import { sequelize } from "../database/sequelizeInstance.js";
import { DataTypes } from "sequelize";
import "dotenv/config.js";
import { User } from "./user.model.js";

export const Post = sequelize.define(
  "Post",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    caption: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [1, 100],
      },
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [1, 255],
      },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
  },
  { timestamps: true }
);

export const PostImg = sequelize.define(
  "PostImg",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    imgUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    postId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Posts",
        key: "id",
      },
    },
  },
  {
    timestamps: true,
  }
);

Post.hasMany(PostImg, {
  foreignKey: "postId",
  as: "images",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

PostImg.belongsTo(Post, {
  foreignKey: "postId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Post.belongsTo(User, {
  foreignKey: "userId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
