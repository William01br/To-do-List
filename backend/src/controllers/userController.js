import userService from "../services/userService.js";

const register = async (req, res) => {
  const { name, username, email, password } = req.credentials;

  try {
    const result = await userService.register(name, username, email, password);

    if (result === 23505)
      return res
        .status(400)
        .json({ message: "username or email alredy registered" });
    if (!result) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const update = async (req, res) => {};

export { register };
