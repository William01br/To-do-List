/**
 * user Controller
 * Handles all user-related operations, such register, update and delete data.
 */

import userService from "../services/userService.js";
import listService from "../services/listService.js";
import { isPasswordValid } from "../utils/credentials.js";

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

// forgot-password Endpoint
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email);

    if (!email) return res.status(400).json({ message: "Email required" });

    const result = await userService.sendEmailToResetPassword(email);
    if (!result) return res.status(400).json({ message: "Email not found" });

    return res.status(200).json({ message: "Email sended" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const resetToken = req.params.token;
    console.log(resetToken);
    const { newPassword } = req.body;

    if (!newPassword || !resetToken)
      return res
        .status(400)
        .json({ message: "Both token and password are required" });

    // verify if password is strong enough.
    if (!isPasswordValid(newPassword))
      return res.status(400).json({
        message:
          "password must contain uppercase letters, lowercase letters, numbers and at least 8 characters",
      });

    const result = await userService.resetPassword(newPassword, resetToken);
    if (!result)
      return res.status(500).json({ message: "Invalid or Expired token" });

    // clean any cookie with tokens after the password change
    res.clearCookie("acessToken");
    res.clearCookie("refreshToken");

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
  forgotPassword,
  resetPassword,
  getUserDataById,
  deleteAccount,
};
