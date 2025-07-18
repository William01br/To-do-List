import HttpError from "./HttpError.js";

class ConflictErrorHttp extends HttpError {
  constructor(params) {
    const { message, context } = params;
    super(409, message, context);
  }
}

export default ConflictErrorHttp;
