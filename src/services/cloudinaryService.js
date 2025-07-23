import { v2 as cloudinary } from "cloudinary";
import "../config/cloudinary.js";

export function uploadFileToCloudinary(readableStream) {
  return new Promise((resolve, reject) => {
    const cloudinaryStream = cloudinary.uploader.upload_stream(
      { resource_type: "auto" },
      (error, result) => {
        if (error) {
          return reject("Error while uploading for cloudinary", error);
        }
        resolve(result);
      }
    );
    // Pipe the readable stream to the Cloudinary upload stream
    readableStream.pipe(cloudinaryStream);
  });
}

export const optimizeImage = (url) =>
  cloudinary.url(url, {
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
