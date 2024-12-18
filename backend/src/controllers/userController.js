// import userService from "../services/userService.js";

const register = async (req, res) => {
  const { name, username, email, password } = req.credentials;

  try {
    // const result = await userService.register(name, username, email, password);
    // if (!result) {
    //   return res.status(500).json({ message: "Internal Server Error" });
    // }
    // return result.status(200).json({ result: result });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export { register };
