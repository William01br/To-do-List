import HttpError from "./HttpError.js";

class BadRequestErrorHttp extends HttpError {
  constructor(params) {
    const { message, context } = params;
    super(400, message, context || "");
  }
}

export default BadRequestErrorHttp;
