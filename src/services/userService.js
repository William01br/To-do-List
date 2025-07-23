/**
 * auth Service
 * Resolve all deeps operations of the user Controller, such as validations and interacting with database and extern server.
 */

import bcrypt from "bcrypt";

import { pool } from "../config/db.js";
import { bufferToStream } from "../utils/bufferToStream.js";
import { createTokenReset } from "../utils/crypto.js";
import { transporter } from "../config/nodemailer.js";
import { uploadFileToCloudinary, optimizeImage } from "./cloudinaryService.js";
import InternalErrorHttp from "../errors/InternalError.js";
import ConflictErrorHttp from "../errors/ConflicError.js";
import NotFoundErrorHttp from "../errors/NotFoundError.js";
import BadRequestErrorHttp from "../errors/BadRequestError.js";

const register = async (username, email, password) => {
  const emailAlredyExist = await verifyEmailExists(email);
  if (emailAlredyExist)
    throw new ConflictErrorHttp({
      message: "The email address is already registered",
    });

  const avatarUrl =
    "https://static.vecteezy.com/system/resources/thumbnails/009/734/564/small_2x/default-avatar-profile-icon-of-social-media-user-vector.jpg";

  const passwordHashed = await bcrypt.hash(password, 10);

  const user = await insertUser(username, email, passwordHashed, avatarUrl);

  return user.id;
};

const insertUser = async (username, email, passwordHashed, avatarUrl) => {
  const text =
    "INSERT INTO users(username, email, password, avatar) VALUES ($1, $2, $3, $4) RETURNING id, username, email, avatar, created_at";
  const values = [username, email, passwordHashed, avatarUrl];

  const result = await pool.query(text, values);
  return result.rows[0];
};

const findUserByOauthId = async (oauthId) => {
  const text = "SELECT * FROM users WHERE oauth_id = $1";

  const result = await pool.query(text, [oauthId]);
  // should return 'null'
  if (result.rows.length === 0) return null;

  const userId = result.rows[0].id;
  const userData = await getAllDataUserByUserId(userId);

  return { id: userId, data: userData };
};

// function to save the user data that is registered by the OAuth provider.
const registerByOAuth = async (data) => {
  /**
   * REFATORAR ESSA FUNÇÃO AQUI
   * ESSE USERNAME É UNIQUE, SALVO ENGANO, NO BANCO. SOMENTE ESSE MEIO DE GERÁ-LO VAI DAR MERDA.
   */
  const { oauthId, name, email, avatar, provider } = data;
  const username = name.split(" ")[0];

  const user = await insertUserByOAuth(
    username,
    email,
    provider,
    oauthId,
    avatar
  );

  await createDefaultlist(user.id);

  const userData = await getAllDataUserByUserId(user.id);
  return { id: user.id, data: userData };
};

const insertUserByOAuth = async (
  username,
  email,
  oauthProvider,
  oauthId,
  avatar
) => {
  const text =
    "INSERT INTO users (username, email, oauth_provider, oauth_id, avatar) VALUES ($1, $2, $3, $4, $5) RETURNING *";
  const values = [username, email, oauthProvider, oauthId, avatar];

  const result = await pool.query(text, values);
  return result.rows[0];
};

const uploadToCloudinary = async (fileData) => {
  // converts the Buffer file into a readable stream file that can be sent to cloudinary
  const readableStream = bufferToStream(fileData.buffer);

  // Resolves the promise and return data of image uploaded in server.
  const result = await uploadFileToCloudinary(readableStream);

  // optimizes the imagem
  const url = optimizeImage(result.secure_url);
  return url;
};

const updateAvatar = async (url, userId) => {
  const text = "UPDATE users SET avatar = $1 WHERE id = $2";
  const values = [url, userId];

  const result = await pool.query(text, values);
  // se chegou aqui é porque tá autenticado
  // então é erro interno
  if (result.rowCount === 0)
    throw new InternalErrorHttp({
      message: "Avatar was not updated",
      context: "Reason unknown",
    });
};

const sendEmailToResetPassword = async (emailProvided) => {
  const userEmail = await verifyEmailExists(emailProvided);
  if (!userEmail)
    throw new NotFoundErrorHttp({
      message: "E-mail not found",
    });

  // Generate a reset token and set its expiration date (1 hour from generation time)
  /**
   * ANALISAR ISSO
   */
  const resetToken = await createTokenReset();

  const isUpdated = await updateResetPasswords(resetToken, userEmail);
  // e-mail já foi validado
  if (!isUpdated)
    throw new InternalErrorHttp({
      message: "Token reset passoword was not updated",
      context: "Reason unknown",
    });

  // Create the reset URL with the generated token
  const resetUrl = `localhost:3000/user/reset-password/${resetToken}`;

  /**
   * ISSO AQUI DEVERIA IR PARA OUTRO LUGAR
   * podia ser uma função que recebe os parâmetros e retorna a mensagem.
   */
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
};

const verifyEmailExists = async (email) => {
  const text = "SELECT * FROM users WHERE email = $1";
  const result = await pool.query(text, [email]);

  if (result.rows.length === 0) return null;
  return result.rows[0].email;
};

const updateResetPasswords = async (resetToken, userEmail) => {
  //   console.log(resetToken);
  const dateExpires = new Date(Date.now() + 3600000); // 1 hour
  // console.log(resetToken, typeof resetToken, dateExpires);
  console.log(dateExpires);

  const text =
    "UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE email = $3";
  const values = [resetToken, dateExpires, userEmail];

  const result = await pool.query(text, values);
  // console.log(result.rowCount);
  return result.rowCount != 0;
};

const resetPassword = async (newPassword, resetToken) => {
  const tokenIsValid = await verifyExpirationToken(resetToken);
  if (!tokenIsValid)
    throw new BadRequestErrorHttp({
      message: "Reset token was expired",
    });

  const passwordHashed = await bcrypt.hash(newPassword, 10);

  const updatedPassword = await updateNewPassword(passwordHashed, resetToken);
  if (!updatedPassword)
    throw new InternalErrorHttp({
      message: "Password was not updated",
      context: "Reason unknown",
    });

  return true;
};

const verifyExpirationToken = async (resetToken) => {
  // console.log(resetToken);
  const dateNow = new Date(Date.now());
  // console.log(new Date(Date.now() + 3600000) > dateNow);
  // checks that the token has not expired
  const text =
    "SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expires > $2";
  const values = [resetToken, dateNow];

  const result = await pool.query(text, values);
  console.log(result.rows);

  return result.rows.length != 0;
};

const updateNewPassword = async (passwordHashed, resetToken) => {
  const text =
    "UPDATE users SET password = $1, reset_password_token = $2, reset_password_expires = $3 WHERE reset_password_token = $4";
  const values = [passwordHashed, null, null, resetToken];

  const result = await pool.query(text, values);

  return result.rowCount === 1;
};

const getAllDataUserByUserId = async (userId) => {
  const text = `
    SELECT 
    u.id AS user_id,
    u.username,
    u.email,
    u.avatar,
    u.created_at
    FROM
        users u
    WHERE 
        u.id = $1;`;

  const result = await pool.query(text, [userId]);
  if (result.rows.length === 0)
    throw new BadRequestErrorHttp({
      message: "User not found",
    });

  return result.rows[0];
};

const deleteAccount = async (userId) => {
  const text = "DELETE FROM users WHERE id = $1";

  // IDEMPOTENT
  await pool.query(text, [userId]);
};

export default {
  register,
  insertUser,
  findUserByOauthId,
  registerByOAuth,
  uploadToCloudinary,
  uploadFileToCloudinary,
  optimizeImage,
  updateAvatar,
  sendEmailToResetPassword,
  resetPassword,
  updateResetPasswords,
  getAllDataUserByUserId,
  deleteAccount,
};
