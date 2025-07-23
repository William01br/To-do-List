import HttpError from "./HttpError.js";

class UnauthorizedErrorHttp extends HttpError {
  constructor(params) {
    const { message, context } = params;
    super(401, message, context);
  }
}

export default UnauthorizedErrorHttp;
