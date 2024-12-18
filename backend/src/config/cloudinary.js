import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: "djtxlkeya",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const uploadImage = async (path) => {
  try {
    const result = await cloudinary.uploader.upload(path);
    return result.secure_url;
  } catch (err) {
    console.error("Error uploading image:", err);
    throw err;
  }
};

export const getUrlImage = (secure_url) => {
  try {
    const url = cloudinary.url(secure_url, {
      transformation: [
        {
          quality: "auto",
          fecth_format: "auto",
        },
        {
          width: 1200,
          height: 1200,
          crop: "fill",
          gravity: "auto",
        },
      ],
    });
    console.log(url);
    return url;
  } catch (err) {
    console.error("Error getting image URL:", err);
    throw err;
  }
};
