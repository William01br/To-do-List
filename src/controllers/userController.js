import userService from "../services/userService.js";
import listService from "../services/listService.js";
import { isPasswordValid } from "../utils/credentials.js";
import BadRequestErrorHttp from "../errors/BadRequestError.js";

const register = async (req, res) => {
  const { username, email, password } = req.credentials;

  const userId = await userService.register(username, email, password);

  await listService.createListDefault(userId);

  const userData = await userService.getAllDataUserByUserId(userId);

  return res
    .status(200)
    .json({ message: "successfully registered", data: userData });
};

// send the image for the cloudinary and save the image url in database.
const uploadImage = async (req, res) => {
  if (!req.file)
    throw new BadRequestErrorHttp({
      message: "File required",
    });

  const userId = req.userId;

  // Upload file to cloudinary and return the url of the uploaded file.
  const url = await userService.uploadToCloudinary(req.file);
  console.log(url);

  // Update the avatar in the database with the new url.
  await userService.updateAvatar(url, userId);

  return res
    .status(200)
    .json({ message: "avatar updated sucessfully", url: url });
};

// checks the e-mail and sends an e-mail to the user with the URL to reset the password.
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email)
    throw new BadRequestErrorHttp({
      message: "Email required",
    });

  await userService.sendEmailToResetPassword(email);

  return res.status(200).json({ message: "Email sended" });
};

const resetPassword = async (req, res) => {
  const resetToken = req.params.token;
  const { newPassword } = req.body;

  if (!newPassword)
    throw new BadRequestErrorHttp({
      message: "Password are required",
    });

  if (!isPasswordValid(newPassword))
    throw new BadRequestErrorHttp({
      message:
        "password must contain uppercase letters, lowercase letters, numbers and at least 8 characters",
    });

  await userService.resetPassword(newPassword, resetToken);

  // Clear any authentication tokens stored in cookies
  res.clearCookie("acessToken");
  res.clearCookie("refreshToken");

  return res.status(200).json({ message: "updated password successfully" });
};

const getUserDataById = async (req, res) => {
  const userId = req.userId;

  const result = await userService.getAllDataUserByUserId(userId);

  return res.status(200).json({ data: result });
};

const deleteAccount = async (req, res) => {
  const userId = req.userId;

  await userService.deleteAccount(userId);

  return res.status(204).send();
};

export {
  register,
  uploadImage,
  forgotPassword,
  resetPassword,
  getUserDataById,
  deleteAccount,
};
