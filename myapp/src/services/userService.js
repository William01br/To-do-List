/**
 * auth Service
 * Resolve all deeps operations of the user Controller, such as validations and interacting with database and extern server.
 */

import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";

import { pool } from "../config/db.js";
import { bufferToStream } from "../utils/bufferToStream.js";
import "../config/cloudinary.js";
import { createTokenReset } from "../utils/crypto.js";
import { transporter } from "../config/nodemailer.js";

const register = async (username, email, password) => {
  const avatarUrl =
    "https://static.vecteezy.com/system/resources/thumbnails/009/734/564/small_2x/default-avatar-profile-icon-of-social-media-user-vector.jpg";

  try {
    const passwordHashed = await bcrypt.hash(password, 10);

    const user = await insertUser(username, email, passwordHashed, avatarUrl);

    return user;
  } catch (err) {
    // error code of value duplicate in DB.
    if (err.code === "23505") return 23505;

    console.error("Error registering user:", err);
    throw new Error("Failed to register user");
  }
};

const insertUser = async (username, email, passwordHashed, avatarUrl) => {
  try {
    const text =
      "INSERT INTO users(username, email, password, avatar) VALUES ($1, $2, $3, $4) RETURNING id, username, email, avatar, created_at";
    const values = [username, email, passwordHashed, avatarUrl];

    const result = await pool.query(text, values);
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

const findUserByOauthId = async (oauthId) => {
  try {
    const text = "SELECT * FROM users WHERE oauth_id = $1";

    const result = await pool.query(text, [oauthId]);
    return result.rows[0];
  } catch (err) {
    console.error("Error finding user by oauthId:", err);
    throw new Error("Error finding user by oauthId");
  }
};

// function to save the user data that is registered by the OAuth provider.
const registerByOAuth = async (data) => {
  try {
    const { oauthId, name, email, avatar } = data;
    const oauthProvider = "google";
    const username = name.split(" ")[0];

    const user = await insertUserByOAuth(
      username,
      email,
      oauthProvider,
      oauthId,
      avatar
    );
    return user;
  } catch (err) {
    console.error("Error registering user by OAuth:", err);
    throw new Error("Error registering user by OAuth");
  }
};

const insertUserByOAuth = async (
  username,
  email,
  oauthProvider,
  oauthId,
  avatar
) => {
  try {
    const text =
      "INSERT INTO users (username, email, oauth_provider, oauth_id, avatar) VALUES ($1, $2, $3, $4, $5) RETURNING *";
    const values = [username, email, oauthProvider, oauthId, avatar];

    const result = await pool.query(text, values);
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

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
function uploadFileToCloudinary(readableStream) {
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

/**
 * Uploads file data to Cloudinary and optimizes the uploaded image.
 *
 * This function takes file data, converts it to a readable stream, uploads it to Cloudinary,
 * and then generates an optimized URL for the uploaded image with specific transformations.
 *
 * @async
 * @function uploadToCloudinary
 * @param {Object} fileData - The file data to be uploaded.
 * @param {Buffer} fileData.buffer - The buffer containing the file data.
 * @returns {Promise<string>} A promise that resolves with the optimized Cloudinary URL of the uploaded image.
 * @throws {Error} If an error occurs during the upload or optimization process, an error is thrown.
 */
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

/**
 * Sends an email to reset a user's password.
 *
 * This function checks if the provided email exists in the database, generates a reset token,
 * updates the user's record with the token and expiration date, and sends an email with a reset link.
 *
 * @async
 * @function sendEmailToResetPassword
 * @param {string} emailProvided - The email address provided by the user requesting a password reset.
 * @returns {Promise<boolean>} A promise that resolves to `true` if the email is sent successfully, or `null` if the email does not exist in the database.
 * @throws {Error} If an error occurs during the process, an error is thrown.
 */
const sendEmailToResetPassword = async (emailProvided) => {
  try {
    const userEmail = await verifyEmailExists(emailProvided);
    if (!userEmail) return null;

    // Generate a reset token and set its expiration date (1 hour from generation time)
    const resetToken = createTokenReset();

    const isUpdated = await updateResetPasswords(resetPassword, userEmail);
    if (!isUpdated) return null;

    // Create the reset URL with the generated token
    const resetUrl = `localhost:3000/user/reset-password/${resetToken}`;

    const mailOptions = {
      to: userEmail,
      from: process.env.EMAIL_USER,
      subject: "Password Reset",
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
      Please click on the following link, or paste this into your browser to complete the process:\n\n
      ${resetUrl}\n\n
      If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error("Error sending email to reset password:", err);
    throw new Error("Error sending email to reset password");
  }
};

const verifyEmailExists = async (email) => {
  try {
    const text = "SELECT * FROM users WHERE email = $1";
    const result = await pool.query(text, [email]);

    if (result.rows.length === 0) return null;
    return result.rows[0].email;
  } catch (err) {
    throw err;
  }
};

const updateResetPasswords = async (resetToken, userEmail) => {
  try {
    const dateExpires = new Date(Date.now() + 3600000); // 1 hour
    // console.log(resetToken, typeof resetToken, dateExpires);

    const text =
      "UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE email = $3";
    const values = [resetToken, dateExpires, userEmail];

    const result = await pool.query(text, values);
    if (result.rowCount === 0) return null;
    return true;
  } catch (err) {
    throw err;
  }
};

/**
 * Resets a user's password using a valid reset token.
 *
 * This function verifies the reset token, checks if it is still valid (not expired),
 * hashes the new password, and updates the user's password in the database.
 * It also clears the reset token and expiration date after the password is updated.
 *
 * @async
 * @function resetPassword
 * @param {string} newPassword - The new password provided by the user.
 * @param {string} resetToken - The reset token provided by the user for verification.
 * @returns {Promise<boolean>} A promise that resolves to `true` if the password is reset successfully, or `null` if the reset token is invalid or expired.
 * @throws {Error} If an error occurs during the process, an error is thrown.
 */
const resetPassword = async (newPassword, resetToken) => {
  try {
    const tokenIsValid = await verifyExpirationToken(resetToken);
    if (!tokenIsValid) return null;

    const passwordHashed = await bcrypt.hash(newPassword, 10);

    const updatedPassword = await updateNewPassword(passwordHashed, resetToken);
    if (!updatedPassword) return null;

    return true;
  } catch (err) {
    console.error("Error resetting password:", err);
    throw new Error("Error resetting password");
  }
};

const verifyExpirationToken = async (resetToken) => {
  try {
    // checks that the token has not expired
    const text =
      "SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expires > NOW()";

    const result = await pool.query(text, [resetToken]);

    if (result.rows.length === 0) return null;
    return true;
  } catch (err) {
    throw err;
  }
};

const updateNewPassword = async (passwordHashed, resetToken) => {
  try {
    const text =
      "UPDATE users SET password = $1, reset_password_token = $2, reset_password_expires = $3 WHERE reset_password_token = $4";
    const values = [passwordHashed, null, null, resetToken];

    const result = await pool.query(text, values);

    if (result.rowCount === 0) return null;
    return true;
  } catch (err) {
    throw err;
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
                SELECT COALESCE(ARRAY_AGG(
                    JSON_BUILD_OBJECT(
                        'task_id', t.id,
                        'task_title', t.name_task,
                        'task_description', t.comment,
                        'task_due_date', t.due_date,
                        'task_finished', t.completed,
                        'task_created_at', t.created_at
                    )
                    ORDER BY t.created_at
                ), '{}')
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

    const result = await pool.query(text, [userId]);
    if (result.rows.length === 0) return null;

    return result.rows[0];
  } catch (err) {
    console.error("Error getting all data user by userId:", err);
    throw new Error("Error getting all data user by userId");
  }
};

const deleteAccount = async (userId) => {
  try {
    const text = "DELETE FROM users WHERE id = $1";

    const result = await pool.query(text, [userId]);
    if (result.rowCount === 0) return null;

    return true;
  } catch (err) {
    console.error("Error deleting all data user by userId:", err);
    throw new Error("Error deleting all data user by userId");
  }
};

export default {
  register,
  insertUser,
  findUserByOauthId,
  registerByOAuth,
  uploadToCloudinary,
  updateAvatar,
  sendEmailToResetPassword,
  resetPassword,
  getAllDataUserByUserId,
  deleteAccount,
};
