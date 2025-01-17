/**
 * auth Controller
 * Handles all auth-related operations, such login and creation of acess and refresh tokens
 */

import authService from "../services/authService.js";

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
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const tokenRefresh = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken)
    return res.status(401).json({ message: "token refresh is required" });

  try {
    const userId = req.userId;

    const result = await authService.getTokenRefresh(refreshToken, userId);
    if (!result)
      return res.status(500).json({ message: "Internal Server Error" });
    return res.status(200).json({ AcessToken: result });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export { login, tokenRefresh };
