/**
 * user Controller
 * Handles all user-related operations, such register, update and delete data.
 */

import userService from "../services/userService.js";
import listService from "../services/listService.js";

const register = async (req, res) => {
  const { username, email, password } = req.credentials;

  try {
    const result = await userService.register(username, email, password);

    if (result === 23505)
      return res.status(409).json({
        error: "Conflict",
        message:
          "The email address is already registered. Please use a different email.",
      });
    if (!result) {
      return res
        .status(500)
        .json({ message: "Internal Server Error at registering User" });
    }

    const resultListDefault = await listService.createListDefault(result.id);
    if (!resultListDefault)
      return res
        .status(500)
        .json({ message: "Internal Server Error at creating default List" });

    const userData = await userService.getAllDataUserByUserId(result.id);

    return res.status(200).json(userData);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

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

    // Update the avatar in the database with the new url.
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

const verifyPassword = async (req, res) => {
  try {
    const userId = req.userId;
    const { password } = req.body;

    if (!password)
      return res.status(400).json({ message: "Password required" });

    const result = await userService.verifyPassword(userId, password);
    if (!result) return res.status(400).json({ message: "Wrong password" });

    return res
      .status(200)
      .json({ message: "Verified Password", temporaryToken: result });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const updatePassword = async (req, res) => {
  try {
    const userId = req.userId;
    const { newPassword } = req.body;

    if (!newPassword)
      return res.status(400).json({ message: "Password required" });

    const result = await userService.updatePassword(userId, newPassword);
    if (!result)
      return res.status(500).json({ message: "Internal Server Error" });

    return res.status(200).json({ message: "updated password sucessfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getUserDataById = async (req, res) => {
  try {
    const userId = req.userId;
    const result = await userService.getAllDataUserByUserId(userId);
    if (!result)
      return res.status(500).json({ message: "Internal Server Error" });

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.userId;

    const result = await userService.deleteAccount(userId);
    if (!result)
      return res
        .status(500)
        .json({ message: "User not deleted", error: "Internal Server Error" });

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export {
  register,
  uploadImage,
  verifyPassword,
  updatePassword,
  getUserDataById,
  deleteAccount,
};
