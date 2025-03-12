import { v2 as cloudinary } from "cloudinary";
import "../config/cloudinary.js";

/**
 * Uploads a file to Cloudinary using a readable stream.
 *
 * This function takes a readable stream (e.g., from a file upload) and pipes it to Cloudinary's upload stream.
 * It returns a promise that resolves with the upload result or rejects with an error if the upload fails.
 *
 * @function uploadFileToCloudinary
 * @param {stream.Readable} readableStream - A readable stream containing the file data to be uploaded.
 * @returns {Promise<Object>} A promise that resolves with the Cloudinary upload result.
 * @throws {string} If an error occurs during the upload process, the promise is rejected with an error message.
 */
export function uploadFileToCloudinary(readableStream) {
  try {
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
  } catch (err) {
    throw err;
  }
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
