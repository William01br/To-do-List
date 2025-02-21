/**
 * auth Controller
 * Handles all auth-related operations, such login, send of cookies and creation of acess and refresh tokens
 */

import authService from "../services/authService.js";
import userService from "../services/userService.js";
import { encrypt } from "../utils/crypto.js";

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
    const result = await authService.getTokens(userId);
    if (!result)
      return res.status(500).json({ message: "Internal Server Error" });

    // encrypting the tokens for send by cookies
    const acessTokenEncrypted = encrypt(result.accessToken);
    const refreshTokenEncrypted = encrypt(result.refreshToken);

    res.cookie("acessToken", acessTokenEncrypted, {
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

    return res.status(200).json({ message: "Login sucessfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// generates acess token from refresh token provided
const getAcessToken = async (req, res) => {
  try {
    const refreshToken = req.refreshToken;
    const userId = req.userId;

    // return the acess token
    const result = await authService.getAcessToken(refreshToken, userId);
    if (!result)
      return res.status(500).json({ message: "Internal Server Error" });

    // encrypting the token for send by cookies
    const acessTokenEncrypted = encrypt(result);

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

// get informations provided by google and storage in DB.
const loginByOAuth = async (req, res) => {
  try {
    const profile = req.user;
    console.log(profile);
    let user = await userService.findUserByOauthId(profile.id);

    if (!user || user.length === 0) {
      user = await userService.registerByOAuth({
        oauthId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        avatar: profile.photos[0].value,
      });
    }
    // get acess and refresh tokens
    const tokens = await authService.getTokens(user.id);

    // encrpyt the tokens for will be send by cookies
    const encryptedAcessToken = encrypt(tokens.acessToken);
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
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export { login, getAcessToken, loginByOAuth };
