/**
 * auth Service
 * Resolve all deeps operations of the user Controller, such as validations and interacting with database and extern server.
 */

import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";

import { pool } from "../config/database.js";
import { createUsername } from "../utils/createUsername.js";
import { bufferToStream } from "../utils/bufferToStream.js";
import "../config/cloudinary.js";

const register = async (name, username, email, password) => {
  try {
    const avatarUrl =
      "https://static.vecteezy.com/system/resources/thumbnails/009/734/564/small_2x/default-avatar-profile-icon-of-social-media-user-vector.jpg";

    const passwordHashed = await bcrypt.hash(password, 10);
    console.log(passwordHashed);

    const text =
      "INSERT INTO users(name, username, email, password, avatar) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, username, email, avatar, createdAt";
    const values = [name, username, email, passwordHashed, avatarUrl];

    const result = await pool.query(text, values);
    console.log(result.rows[0]);

    return result.rows[0];
  } catch (err) {
    // code for error of value duplicate in DB.
    if (err.code === "23505") return 23505;
    console.error("Error registering user:", err);
  }
};

const findUserByOauthId = async (oauthId) => {
  try {
    const text = "SELECT * FROM users WHERE ouathId = $1";
    const value = [oauthId];

    const result = await pool.query(text, value);
    console.log(result.rows[0]);
    return result.rows[0];
  } catch (err) {
    console.error("Error finding user by oauthId:", err);
    throw new Error("Error finding user by oauthId");
  }
};

const registerByOAuth = async (data) => {
  try {
    const { oauthId, name, email, avatar } = data;
    console.log(data);
    const oauthProvider = "google";
    const username = createUsername(name);
    const text =
      "INSERT INTO users (name, username, email, oauthProvider, ouathId, avatar) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *";
    const values = [name, username, email, oauthProvider, oauthId, avatar];

    const result = await pool.query(text, values);
    return result.rows[0];
  } catch (err) {
    console.error("Error registering user by OAuth:", err);
    throw new Error("Error registering user by OAuth");
  }
};

async function uploadFileToCloudinary(readableStream) {
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
    console.log(readableStream);

    // Pipe os dados do stream de leitura para o stream de upload
    readableStream.pipe(cloudinaryStream);
  });
}

const uploadToCloudinary = async (fileData) => {
  try {
    const readableStream = bufferToStream(fileData.buffer);

    const result = await uploadFileToCloudinary(readableStream);
    const url = cloudinary.url(result.secure_url, {
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
    console.error("Error uploading image to cloudinary:", err);
    throw new Error("Error uploading image to cloudinary");
  }
};

const updateAvatar = async (url, userId) => {
  try {
    const text = "UPDATE users SET avatar = $1 WHERE id = $2";
    const values = [url, userId];

    const resultQuery = await pool.query(text, values);
    if (resultQuery.rowCount === 0) return null;

    return true;
  } catch (err) {
    console.error("Error updating avatar in DataBase:", err);
    throw new Error("Error updating avatar in DataBase");
  }
};

export default {
  register,
  findUserByOauthId,
  registerByOAuth,
  uploadToCloudinary,
  updateAvatar,
};
