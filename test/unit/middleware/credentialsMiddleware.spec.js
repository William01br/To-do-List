import BadRequestErrorHttp from "../../../src/errors/BadRequestError.js";
import { credentialsIsValid } from "../../../src/middleware/credentialsMiddleware.js";
import {
  isEmailValid,
  isPasswordValid,
} from "../../../src/utils/credentials.js";

jest.mock("../../../src/utils/credentials.js", () => ({
  isEmailValid: jest.fn(),
  isPasswordValid: jest.fn(),
}));

describe("credentialsMiddleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it("should call next() if all fields are valid", () => {
    req.body = {
      username: "john.doe",
      email: "john.doe@example.com",
      password: "Password123!",
    };

    isEmailValid.mockReturnValue(true);
    isPasswordValid.mockReturnValue(true);

    credentialsIsValid(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.credentials).toEqual({
      username: "john.doe",
      email: "john.doe@example.com",
      password: "Password123!",
    });
  });
  it("should propaate BadRequestErrorHttp if all fields are empty", () => {
    expect(() => credentialsIsValid(req, res, next)).toThrow(
      BadRequestErrorHttp
    );
    expect(next).not.toHaveBeenCalled();
  });
  it("should propagate BadRequestErrorHttp if email is invalid", () => {
    req.body = {
      username: "john.doe",
      email: "invalidEmailexample.com",
      password: "Password123!",
    };

    isEmailValid.mockReturnValueOnce(false);
    // isPasswordValid.mockReturnValueOnce(true);

    expect(() => credentialsIsValid(req, res, next)).toThrow(
      BadRequestErrorHttp
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("should propagate BadRequestErrorHttp if password is invalid", async () => {
    req.body = {
      username: "john.doe",
      email: "john.doe@example.com",
      password: "password123",
    };

    isEmailValid.mockReturnValueOnce(true);
    isPasswordValid.mockReturnValueOnce(false);

    await expect(() => credentialsIsValid(req, res, next)).toThrow(
      BadRequestErrorHttp
    );
    expect(next).not.toHaveBeenCalled();
  });
});
