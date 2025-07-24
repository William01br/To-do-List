import BadRequestErrorHttp from "../errors/BadRequestError.js";

// This will allow only numbers between 1 and 999999999 (9 digits)
const regex = /^[1-9][0-9]{0,8}$/;

export const validateId = (...ids) => {
  ids.forEach((id) => {
    if (!regex.test(id))
      throw new BadRequestErrorHttp({
        message: "Invalid Id",
        context: "Allow only valid numbers betwen 1 and 999999999 (9 digits)",
      });
  });
};
