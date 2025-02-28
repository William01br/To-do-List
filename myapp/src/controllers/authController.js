/**
 * auth Controller
 * Handles all auth-related operations, such login, send of cookies and creation of acess and refresh tokens
 */

import authService from "../services/authService.js";
import { createDefaultlist } from "./userController.js";
import userService from "../services/userService.js";
import { encrypt } from "../utils/crypto.js";

/**
 * Handles user login by validating credentials, generating tokens, and setting cookies.
 *
 * @async
 * @function login
 * @param {Object} req - The request object containing the user's email and password in the body.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.email - The user's email address.
 * @param {string} req.body.password - The user's password.
 * @param {Object} res - The response object used to send back the HTTP response.
 * @returns {Promise<Object>} A JSON response indicating the result of the login attempt.
 * @throws {Error} If an unexpected error occurs during the login process.
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "email and password are required" });

  try {
    // validates credentials and return user ID.
    const userId = await authService.login(email, password);

    if (!userId)
      return res.status(401).json({ message: "Invalid credentials" });

    // get Acess and Refresh tokens.
    const tokens = await authService.getTokens(userId);
    if (!tokens.accessToken || !tokens.refreshToken)
      return res.status(500).json({ message: "tokens not sent" });

    // encrypting the tokens for send by cookies
    const accessTokenEncrypted = encrypt(tokens.accessToken);
    const refreshTokenEncrypted = encrypt(tokens.refreshToken);

    res.cookie("acessToken", accessTokenEncrypted, {
      httpOnly: true,
      signed: true,
      sameSite: "strict",
      secure: false,
      maxAge: 1440000, // 1h
    });

    res.cookie("refreshToken", refreshTokenEncrypted, {
      httpOnly: true,
      signed: true,
      secure: false,
      sameSite: "strict",
      maxAge: 604800000, // 7 days
    });

    return res.status(200).json({ message: "Login successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * Retrieves and sets a new access token using a refresh token.
 *
 * @async
 * @function getAcessToken
 * @param {Object} req - The request object containing the refresh token and user ID.
 * @param {string} req.refreshToken - The refresh token used to generate a new access token.
 * @param {string} req.userId - The ID of the user requesting the access token.
 * @param {Object} res - The response object used to send back the HTTP response.
 * @returns {Promise<Object>} A JSON response indicating the result of the access token retrieval.
 * @throws {Error} If an unexpected error occurs during the process.
 */
const getAcessToken = async (req, res) => {
  try {
    const refreshToken = req.refreshToken;
    const userId = req.userId;

    // return the acess token
    const accessToken = await authService.getAcessToken(refreshToken, userId);
    if (!accessToken)
      return res.status(500).json({ message: "access token not created" });

    // encrypting the token for send by cookies
    const acessTokenEncrypted = encrypt(accessToken);

    res.cookie("acessToken", acessTokenEncrypted, {
      httpOnly: true,
      signed: true,
      sameSite: "strict",
      secure: false,
      maxAge: 1440000, // 1h
    });
    return res.status(200).json({ message: "acess Token recovered" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

/**
 * Handles user login via OAuth (e.g., Google, Facebook, etc.).
 * If the user does not exist, it registers them using OAuth profile data.
 * Generates access and refresh tokens, encrypts them, and sets them as cookies.
 *
 * @async
 * @function loginByOAuth
 * @param {Object} req - The request object containing the OAuth user profile.
 * @param {Object} req.user - The OAuth user profile.
 * @param {string} req.user.id - The OAuth ID of the user.
 * @param {string} req.user.displayName - The display name of the user.
 * @param {Array<Object>} req.user.emails - An array of email objects, where the first email is used.
 * @param {string} req.user.emails[0].value - The email address of the user.
 * @param {Array<Object>} req.user.photos - An array of photo objects, where the first photo is used.
 * @param {string} req.user.photos[0].value - The URL of the user's avatar.
 * @param {Object} res - The response object used to send back the HTTP response.
 * @returns {Promise<Object>} A JSON response containing the user data or an error message.
 * @throws {Error} If an unexpected error occurs during the process.
 */
const loginByOAuth = async (req, res) => {
  try {
    const profile = req.user;
    let user = await userService.findUserByOauthId(profile.id);

    if (!user) {
      user = await userService.registerByOAuth({
        provider: profile.provider,
        oauthId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        avatar: profile.photos[0].value,
      });
      await createDefaultlist(user.id);
    }
    // get acess and refresh tokens
    const tokens = await authService.getTokens(user.id);

    // encrpyt the tokens for will be send by cookies
    const encryptedAcessToken = encrypt(tokens.accessToken);
    const encryptedRefreshToken = encrypt(tokens.refreshToken);

    res.cookie("acessToken", encryptedAcessToken, {
      httpOnly: true,
      signed: true,
      sameSite: "strict",
      secure: false,
      maxAge: 1440000, // 1h
    });

    res.cookie("refreshToken", encryptedRefreshToken, {
      httpOnly: true,
      signed: true,
      secure: false,
      sameSite: "strict",
      maxAge: 604800000, // 7 days
    });
    return res.status(200).json({ user: user.data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export { login, getAcessToken, loginByOAuth };
