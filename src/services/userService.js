import bcrypt from "bcrypt";

import { bufferToStream } from "../utils/bufferToStream.js";
import { createTokenReset } from "../utils/crypto.js";
import { transporter } from "../config/nodemailer.js";
import { uploadFileToCloudinary, optimizeImage } from "./cloudinaryService.js";
import InternalErrorHttp from "../errors/InternalError.js";
import ConflictErrorHttp from "../errors/ConflicError.js";
import NotFoundErrorHttp from "../errors/NotFoundError.js";
import BadRequestErrorHttp from "../errors/BadRequestError.js";
import userRepository from "../repository/userRepository.js";
import listRepository from "../repository/listRepository.js";
import { createMessageEmail } from "../utils/createMessageEmail.js";

const register = async (username, email, password) => {
  if ((await userRepository.emailExists(email)).rows[0]?.email)
    throw new ConflictErrorHttp({
      message: "The email address is already registered",
    });

  const avatarUrl =
    "https://static.vecteezy.com/system/resources/thumbnails/009/734/564/small_2x/default-avatar-profile-icon-of-social-media-user-vector.jpg";

  const passwordHashed = await bcrypt.hash(password, 10);

  const user = await userRepository.create(
    username,
    email,
    passwordHashed,
    avatarUrl
  );

  return user.rows[0].id;
};

const findUserByOauthId = async (oauthId) => {
  const result = await userRepository.findByOauthId(oauthId);
  if (result.rows.length === 0) return null;

  const userId = result.rows[0].id;
  // user alredy validated
  const userData = await userRepository.getAllByUserId(userId);

  return { id: userId, data: userData };
};

const registerByOAuth = async (data) => {
  /**
   * REFATORAR ESSA FUNÇÃO AQUI
   * ESSE USERNAME É UNIQUE, SALVO ENGANO, NO BANCO. SOMENTE ESSE MEIO DE GERÁ-LO VAI DAR MERDA.
   */
  const { oauthId, name, email, avatar, provider } = data;
  const username = name.split(" ")[0];

  const user = (
    await userRepository.insertUserByOAuth(
      username,
      email,
      provider,
      oauthId,
      avatar
    )
  ).rows[0];

  await listRepository.createList("Default list", user.id, true);

  const userData = await userRepository.getAllByUserId(user.id);
  return { id: user.id, data: userData };
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
  const result = await userRepository.updateAvatar(url, userId);
  if (result.rowCount === 0)
    throw new InternalErrorHttp({
      message: "Avatar was not updated",
      context: "Reason unknown",
    });
};

const sendEmailToResetPassword = async (emailProvided) => {
  if ((await userRepository.emailExists(emailProvided)).rows[0]?.email)
    throw new NotFoundErrorHttp({
      message: "E-mail not found",
    });

  // Generate a reset token and set its expiration date (1 hour from generation time)
  /**
   * ANALISAR ISSO
   */
  const resetToken = await createTokenReset();

  const dateExpires = new Date(Date.now() + 3600000);
  const isUpdated = await userRepository.updateResetPasswords(
    resetToken,
    emailProvided,
    dateExpires
  );
  // e-mail já foi validado
  if (isUpdated.rowCount === 0)
    throw new InternalErrorHttp({
      message: "Token reset passoword was not updated",
      context: "Reason unknown",
    });

  // Create the reset URL with the generated token
  const resetUrl = `localhost:3000/user/reset-password/${resetToken}`;

  const mailOptions = createMessageEmail(emailProvided, resetUrl);

  await transporter.sendMail(mailOptions);
};

const resetPassword = async (newPassword, resetToken) => {
  const dateNow = new Date(Date.now());
  if (
    !(await userRepository.verifyExpirationToken(resetToken, dateNow)).rows[0]
      ?.reset_password_token
  )
    throw new BadRequestErrorHttp({
      message: "Reset token was expired",
    });

  const passwordHashed = await bcrypt.hash(newPassword, 10);

  if (
    (await userRepository.updatePassword(passwordHashed, resetToken))
      .rowCount === 0
  )
    throw new InternalErrorHttp({
      message: "Password was not updated",
      context: "Reason unknown",
    });

  // retornar "true"? faz mais sentido não retornar nada, dado que se houver qualquer erro, um erro é estourado.
  return true;
};

const getAllDataUserByUserId = async (userId) => {
  const result = (await userRepository.getAllByUserId(userId)).rows;
  if (result.length === 0)
    throw new BadRequestErrorHttp({
      message: "User not found",
    });

  return result[0];
};

const deleteAccount = async (userId) => {
  // IDEMPOTENT
  await userRepository.deleteByUserId(userId);
};

export default {
  register,
  findUserByOauthId,
  registerByOAuth,
  uploadToCloudinary,
  uploadFileToCloudinary,
  optimizeImage,
  updateAvatar,
  sendEmailToResetPassword,
  resetPassword,
  getAllDataUserByUserId,
  deleteAccount,
};
