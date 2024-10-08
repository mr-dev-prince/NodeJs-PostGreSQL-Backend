import { DataTypes } from "sequelize";
import { sequelize } from "../database/sequelizeInstance.js";
import { Post } from "./post.model.js";
import { User } from "./user.model.js";

export const Comment = sequelize.define(
  "Comment",
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    comment: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    postId: {
      type: DataTypes.UUID,
      references: {
        model: Post,
        key: "id",
      },
      index: true,
    },
    userId: {
      type: DataTypes.UUID,
      references: {
        model: User,
        key: "id",
      },
      index: true,
    },
  },
  { timestamps: true }
);

Comment.belongsTo(Post, {
  foreignKey: "postId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Comment.belongsTo(User, {
  foreignKey: "userId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

User.hasMany(Comment, {
  as: "comments",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Post.hasMany(Comment, {
  as: "comments",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
