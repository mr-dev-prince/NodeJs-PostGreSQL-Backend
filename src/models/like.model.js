import { DataTypes } from "sequelize";
import { sequelize } from "../database/sequelizeInstance.js";
import { Post } from "./post.model.js";
import { User } from "./user.model.js";

export const Like = sequelize.define(
  "Like",
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    postId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Post,
        key: "id",
      },
      index: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      index: true,
    },
  },
  { timestamps: true }
);

Post.hasMany(Like, {
  as: "likes",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Like.belongsTo(Post, {
  foreignKey: "postId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Like.belongsTo(User, {
  foreignKey: "userId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

User.hasMany(Like, {
  as: "likes",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
