/**
 * auth Service
 * Resolve all deeps operations of the user Controller, such as validations and interacting with database and extern server.
 */

import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";

import { pool } from "../config/database.js";
import { bufferToStream } from "../utils/bufferToStream.js";
import "../config/cloudinary.js";

const register = async (username, email, password) => {
  try {
    const avatarUrl =
      "https://static.vecteezy.com/system/resources/thumbnails/009/734/564/small_2x/default-avatar-profile-icon-of-social-media-user-vector.jpg";

    const passwordHashed = await bcrypt.hash(password, 10);
    console.log(passwordHashed);

    const text =
      "INSERT INTO users(username, email, password, avatar) VALUES ($1, $2, $3, $4) RETURNING id, username, email, avatar, created_at";
    const values = [username, email, passwordHashed, avatarUrl];

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
    const text = "SELECT * FROM users WHERE oauth_id = $1";
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
    const username = name.split(" ")[0];
    const text =
      "INSERT INTO users (username, email, oauth_provider, oauth_id, avatar) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *";
    const values = [username, email, oauthProvider, oauthId, avatar];

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

    // otimizes the imagem
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

const verifyPassword = async (userId, password) => {
  try {
    const text = "SELECT * FROM users WHERE id = $1";
    const value = [userId];
    const result = await pool.query(text, value);
    const hashPassword = result.rows[0].password;

    const matchPassword = await bcrypt.compare(password, hashPassword);
    if (!matchPassword) return null;

    const temporaryToken = jwt.sign(
      { userId },
      process.env.TEMPORARY_VERIFICATION_TOKEN,
      { expiresIn: "25m" }
    );
    return temporaryToken;
  } catch (err) {
    console.error("Error verifying password:", err);
    throw new Error("Error verifying password");
  }
};

const updatePassword = async (userId, password) => {
  try {
    console.log(password);
    const hashedPassword = await bcrypt.hash(password, 10);

    const text = "UPDATE users SET password = $1 WHERE id = $2";
    const values = [hashedPassword, userId];

    const result = pool.query(text, values);
    if (result.rowCount === 0) return null;

    return true;
  } catch (err) {
    console.error("Error updating password:", err);
    throw new Error("Error updating password");
  }
};

const getAllDataUserByUserId = async (userId) => {
  try {
    const text = `
    SELECT 
    u.id AS user_id,
    u.username,
    u.email,
    u.avatar,
    u.created_at,
    ARRAY_AGG(
        JSON_BUILD_OBJECT(
            'list_id', l.id,
            'list_name', l.name_list,
            'list_created_at', l.created_at,
            'list_is_protected', l.is_protected,
            'tasks', (
                SELECT ARRAY_AGG(
                    JSON_BUILD_OBJECT(
                        'task_id', t.id,
                        'task_title', t.name_task,
                        'task_description', t.comment,
                        'task_due_date', t.due_date,
                        'task_finished', t.completed,
                        'task_created_at', t.created_at
                    )
                    ORDER BY t.created_at
                )
                FROM tasks t
                WHERE t.list_id = l.id
            )
        )
        ORDER BY l.created_at
    ) AS lists
    FROM
        users u
    LEFT JOIN
        lists l ON u.id = l.user_id
    WHERE 
        u.id = $1
    GROUP BY
        u.id`;
    const value = [userId];

    const result = await pool.query(text, value);
    if (result.rows[0].length === 0) return null;

    return result.rows[0];
  } catch (err) {
    console.error("Error getting all data user by userId:", err);
    throw new Error("Error getting all data user by userId");
  }
};

const deleteAccount = async (userId) => {
  try {
    const text = "DELETE FROM users WHERE id = $1";
    const value = [userId];

    const result = await pool.query(text, value);
    if (result.rowCount === 0) return null;

    return true;
  } catch (err) {
    console.error("Error deleting all data user by userId:", err);
    throw new Error("Error deleting all data user by userId");
  }
};

export default {
  register,
  findUserByOauthId,
  registerByOAuth,
  uploadToCloudinary,
  updateAvatar,
  verifyPassword,
  updatePassword,
  getAllDataUserByUserId,
  deleteAccount,
};
