import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import { pool } from "../config/db.js";
import InternalErrorHttp from "../errors/InternalError.js";
import BadRequestErrorHttp from "../errors/BadRequestError.js";
import NotFoundErrorHttp from "../errors/NotFoundError.js";
import authRepository from "../repository/authRepository.js";
import userRepository from "../repository/userRepository.js";
dotenv.config();

const generateAccessToken = (userId) =>
  jwt.sign({ userId }, process.env.ACESS_TOKEN_SECRET, {
    expiresIn: "1h",
  });

const generateRefreshToken = (userId) =>
  jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

const hashRefreshToken = async (refreshToken) =>
  await bcrypt.hash(refreshToken, 10);

const storeRefreshToken = async (userId, hashedRefreshToken) => {
  const daysToMilliseconds = (days) => days * 24 * 60 * 60 * 1000;
  const expiresAt = new Date(Date.now() + daysToMilliseconds(7));
  const updatedAt = new Date(Date.now());

  await authRepository.create(userId, hashedRefreshToken, expiresAt, updatedAt);
};

/**
 *
 * EXPLICAR ESSE FLUXO AQUI EM ETAPAS
 *
 */
const getTokens = async (userId) => {
  await deleteRefreshToken(userId);

  const accessToken = generateAccessToken(userId);

  const refreshToken = generateRefreshToken(userId);

  if (!refreshToken || !accessToken)
    throw new InternalErrorHttp({ message: "tokens were not generated " });

  const hashedRefreshToken = await hashRefreshToken(refreshToken);

  await storeRefreshToken(userId, hashedRefreshToken);

  return { accessToken: accessToken, refreshToken: refreshToken };
};

const login = async (email, password) => {
  const user = (await userRepository.getByEmail(email)).rows[0];
  if (!user)
    throw new NotFoundErrorHttp({
      message: "E-mail not found",
    });

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch)
    throw new UnauthorizedErrorHttp({ message: "Invalid credentials" });

  return user.id;
};

// Receive a refresh token and creates a new acess token.
const getAccessToken = async (refreshToken, userId) => {
  /**
   * E o ExpiredAt? NÃO HÁ VERIFICAÇÃO SOBRE A EXPIRAÇÃO DO TOKEN, SÓ SE ELE EXISTE OU NÃO
   * TEM QUE REVER ISSO.
   */
  const storedToken = (await authRepository.findRefreshTokenByUserId(userId))
    .rows[0];
  if (!storedToken)
    throw new NotFoundErrorHttp({
      message: "Refresh token not found",
      context: "Token Alredy revoked or expired",
    });

  const isMatch = await bcrypt.compare(refreshToken, storedToken.refresh_token);
  if (!isMatch)
    throw new BadRequestErrorHttp({
      message: "Refresh token provided is invalid",
    });

  return generateAccessToken(userId);
};

const deleteRefreshToken = async (userId) => {
  await authRepository.deleteByUserId(userId);
};

export default {
  login,
  getAccessToken,
  getTokens,
  deleteRefreshToken,
  generateAccessToken,
};
