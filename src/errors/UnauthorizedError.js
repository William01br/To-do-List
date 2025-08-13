import HttpError from "./HttpError.js";

class UnauthorizedErrorHttp extends HttpError {
  constructor(params) {
    const { message, context } = params;
    super(401, message || "Unauthorized", context || "");
  }
}

export default UnauthorizedErrorHttp;
