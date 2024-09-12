import { sequelize } from "../database/sequelizeInstance.js";
import { DataTypes } from "sequelize";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import "dotenv/config.js";

export const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    profileImg: {
      type: DataTypes.STRING,
    },
    dob: {
      type: DataTypes.DATE,
    },
    gender: {
      type: DataTypes.STRING,
    },
    city: {
      type: DataTypes.STRING,
    },
    state: {
      type: DataTypes.STRING,
    },
    country: {
      type: DataTypes.STRING,
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    accessToken: {
      type: DataTypes.STRING,
    },
    resetToken: {
      type: DataTypes.STRING,
    },
    resetTokenExpiry: {
      type: DataTypes.DATE,
    },
    verifyToken: {
      type: DataTypes.STRING,
    },
    verifyTokenExpiry: {
      type: DataTypes.DATE,
    },
    refreshToken: {
      type: DataTypes.STRING,
    },
    refreshTokenExpiry: {
      type: DataTypes.DATE,
    },
  },
  {
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
    },
  }
);

// check if the password is correct
User.prototype.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// generate access token
User.prototype.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this.id,
      name: this.name,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1h" }
  );
};

// generate refresh token
User.prototype.generateRefreshToken = function () {
  return jwt.sign(
    {
      id: this.id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "30d" }
  );
};
