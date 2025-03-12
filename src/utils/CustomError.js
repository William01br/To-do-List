export class CustomError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
    this.name = message;
  }
}
