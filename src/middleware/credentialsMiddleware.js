import BadRequestErrorHttp from "../errors/BadRequestError.js";
import { isEmailValid, isPasswordValid } from "../utils/credentials.js";

export const credentialsIsValid = (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password)
    throw new BadRequestErrorHttp({
      message: "All fields are required",
      context: "fields: username, email, password",
    });
  if (!isEmailValid(email))
    throw new BadRequestErrorHttp({
      message: " Invalid e-mail format",
    });
  if (!isPasswordValid(password))
    throw new BadRequestErrorHttp({
      message: "Password invalid",
      context:
        "password must contain uppercase letters, lowercase letters, numbers and at least 8 characters",
    });

  req.credentials = { username, email, password };
  next();
};
