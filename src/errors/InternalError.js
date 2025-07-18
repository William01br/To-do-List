import HttpError from "./HttpError.js";

class InternalErrorHttp extends HttpError {
  constructor(params) {
    const { message, context } = params;
    super(500, message, context);
  }
}

export default InternalErrorHttp;
