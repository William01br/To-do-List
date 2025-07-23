import BadRequestErrorHttp from "../errors/BadRequestError.js";

import authService from "../services/authService.js";
import userService from "../services/userService.js";

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    throw new BadRequestErrorHttp({
      message: "email and password are required",
    });

  // validates credentials and return user ID.
  const userId = await authService.login(email, password);

  // get Acess and Refresh tokens.
  const tokens = await authService.getTokens(userId);

  res.cookie("acessToken", tokens.accessToken, {
    httpOnly: true,
    signed: true,
    sameSite: "strict",
    secure: false,
    maxAge: 1440000, // 1h
  });

  res.cookie("refreshToken", tokens.refreshToken, {
    httpOnly: true,
    signed: true,
    secure: false,
    sameSite: "strict",
    maxAge: 604800000, // 7 days
  });

  return res.status(200).json({ message: "Login successfully" });
};

const getAcessToken = async (req, res) => {
  const refreshToken = req.refreshToken;
  const userId = req.userId;

  // return the acess token
  const accessToken = await authService.getAccessToken(refreshToken, userId);

  res.cookie("acessToken", accessToken, {
    httpOnly: true,
    signed: true,
    sameSite: "strict",
    secure: false,
    maxAge: 1440000, // 1h
  });
  return res.status(200).json({ message: "access Token recovered" });
};

const loginByOAuth = async (req, res) => {
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
  }
  // get acess and refresh tokens
  const tokens = await authService.getTokens(user.id);

  res.cookie("acessToken", tokens.accessToken, {
    httpOnly: true,
    signed: true,
    sameSite: "strict",
    secure: false,
    maxAge: 1440000, // 1h
  });

  res.cookie("refreshToken", tokens.refreshToken, {
    httpOnly: true,
    signed: true,
    secure: false,
    sameSite: "strict",
    maxAge: 604800000, // 7 days
  });
  return res.status(200).json({ user: user.data });
};

export { login, getAcessToken, loginByOAuth };
