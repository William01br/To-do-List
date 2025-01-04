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
  const { token } = req.body;
  if (!token)
    return res.status(401).json({ message: "token refresh is required" });

  try {
    const result = await authService.getTokenRefresh(token);
    if (!result)
      return res.status(500).json({ message: "Internal Server Error" });
    return res.status(200).json({ AcessToken: result });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export { login, tokenRefresh };
