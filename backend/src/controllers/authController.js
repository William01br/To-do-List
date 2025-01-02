import authService from "../services/authService.js";

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "email and password are required" });

  try {
    const result = await authService.login(email, password);

    if (!result)
      return res.status(401).json({ message: "Invalid credentials" });
    return res.status(200).json({ token: result });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export default login;
