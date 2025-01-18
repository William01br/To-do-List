/**
 * user Controller
 * Handles all user-related operations, such register, update and delete data.
 */

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

const uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "File required" });
    console.log(req.file);
    console.log(req.file.buffer);

    const fileData = req.file;
    const userId = req.userId;

    // Upload file to cloudinary and return the url of the uploaded file.
    const result = await userService.uploadToCloudinary(fileData);
    console.log(result);
    if (!result)
      return res.status(500).json({ message: "Internal Server Error" });

    const resultDB = await userService.updateAvatar(result, userId);
    if (!resultDB)
      return res.status(500).json({ message: "Internal Server Error" });

    return res
      .status(200)
      .json({ message: "avatar updated sucessfully", url: result });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export { register, uploadImage };
