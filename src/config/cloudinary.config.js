import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// move the keys to .env

cloudinary.config({
  cloud_name: "dslbgs58t",
  api_key: "813599789388492",
  api_secret: "-iGQR0-lHR4ObVbJf1VoKZodJzY",
  secure: true,
});

export const uploadOnCloundinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return null;
  }
};
