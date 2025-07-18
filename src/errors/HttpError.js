class HttpError extends Error {
  constructor(statusCode, message, context) {
    super(message);

    this.context = context;
    this.statusCode = statusCode;
  }

  getBody() {
    return {
      message: this.message,
      errorCode: this.errorCode,
    };
  }
}

export default HttpError;
