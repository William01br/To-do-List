import HttpError from "./HttpError.js";

class NotFoundErrorHttp extends HttpError {
  constructor(params) {
    const { message, context } = params;
    super(404, message, context || "");
  }
}

export default NotFoundErrorHttp;
