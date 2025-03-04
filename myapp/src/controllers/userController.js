/**
 * user Controller
 * Handles all user-related operations, such register, update and delete data.
 */

import userService from "../services/userService.js";
import listService from "../services/listService.js";
import { isPasswordValid } from "../utils/credentials.js";

/**
 * Handles user registration by creating a new user account and a default list for the user.
 * This function uses the `userService` to register the user and the `listService` to create a default list.
 * If the registration is successful, it returns the user's data. If the email is already registered, it returns a conflict error.
 */
const register = async (req, res) => {
  const { username, email, password } = req.credentials;

  try {
    const userId = await registerUser(username, email, password);

    await createDefaultlist(userId);

    const userData = await getUserData(userId);

    return res
      .status(200)
      .json({ message: "successfully registered", data: userData });
  } catch (err) {
    if (err.message === "The email address is already registered")
      return res.status(409).json({ error: "conflict", message: err.message });

    return res.status(500).json({ message: err.message });
  }
};

const registerUser = async (username, email, password) => {
  try {
    const result = await userService.register(username, email, password);

    if (result === 23505)
      throw new Error("The email address is already registered");

    return result.id;
  } catch (err) {
    throw err;
  }
};

const createDefaultlist = async (userId) => {
  try {
    const result = await listService.createListDefault(userId);

    if (!result)
      throw new Error("Internal Server Error at creating default List");
  } catch (err) {
    throw err;
  }
};

const getUserData = async (userId) => {
  try {
    const result = await userService.getAllDataUserByUserId(userId);

    if (!result) throw new Error("Internal Server Error at fetching user data");

    return result;
  } catch (err) {
    throw err;
  }
};

// send the image for the cloudinary and save the image url in database.
const uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "File required" });

    const userId = req.userId;

    // Upload file to cloudinary and return the url of the uploaded file.
    const url = await uploadFile(req.file);
    console.log(url);

    // Update the avatar in the database with the new url.
    await updateImage(url, userId);

    return res
      .status(200)
      .json({ message: "avatar updated sucessfully", url: url });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const uploadFile = async (file) => {
  try {
    const result = await userService.uploadToCloudinary(file);

    if (!result)
      throw new Error("Internal Server Error at upload to Cloudinary");
    return result;
  } catch (err) {
    throw err;
  }
};

const updateImage = async (url, userId) => {
  try {
    const result = await userService.updateAvatar(url, userId);

    if (!result) throw new Error("Internal Server Error while updating image");
  } catch (err) {
    throw err;
  }
};

// checks the e-mail and sends an e-mail to the user with the URL to reset the password.
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email required" });

    const result = await userService.sendEmailToResetPassword(email);
    if (!result) return res.status(400).json({ message: "Email not found" });

    return res.status(200).json({ message: "Email sended" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Handles the reset password request.
 *
 * This function validates the reset token and the new password, updates the user's password,
 * and clears any authentication tokens stored in cookies.
 *
 * @async
 * @function resetPassword
 * @param {Object} req - The request object.
 * @param {Object} req.params - The parameters extracted from the URL.
 * @param {string} req.params.token - The reset token provided in the URL.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.newPassword - The new password provided by the user.
 * @param {Object} res - The response object.
 * @returns {Promise<Object>} A JSON response indicating the result of the operation.
 * @throws {Error} If an error occurs during the process, it is caught and returned as a 500 status response.
 */
const resetPassword = async (req, res) => {
  try {
    const resetToken = req.params.token;
    const { newPassword } = req.body;

    await verifyData(newPassword, resetToken);

    await updatePassword(newPassword, resetToken);

    // Clear any authentication tokens stored in cookies
    res.clearCookie("acessToken");
    res.clearCookie("refreshToken");

    return res.status(200).json({ message: "updated password successfully" });
  } catch (err) {
    if (
      err.message ===
        "password must contain uppercase letters, lowercase letters, numbers and at least 8 characters" ||
      err.message === "Invalid or Expired token" ||
      err.message === "Password are required"
    )
      return res
        .status(400)
        .json({ error: "Bad request", message: err.message });

    return res.status(500).json({ message: err.message });
  }
};

const verifyData = (newPassword) => {
  try {
    if (!newPassword) throw new Error("Password are required");

    if (!isPasswordValid(newPassword))
      throw new Error(
        "password must contain uppercase letters, lowercase letters, numbers and at least 8 characters"
      );
  } catch (err) {
    throw err;
  }
};

const updatePassword = async (newPassword, resetToken) => {
  try {
    const result = await userService.resetPassword(newPassword, resetToken);
    if (!result) throw new Error("Invalid or Expired token");
  } catch (err) {
    throw err;
  }
};

const getUserDataById = async (req, res) => {
  try {
    const userId = req.userId;

    const result = await userService.getAllDataUserByUserId(userId);
    if (!result)
      return res
        .status(400)
        .json({ error: "Bad request", message: "User not found" });

    return res.status(200).json({ data: result });
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
        .json({ error: "Internal Server Error", message: "User not deleted" });

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export {
  register,
  createDefaultlist,
  uploadImage,
  forgotPassword,
  resetPassword,
  getUserDataById,
  deleteAccount,
};
