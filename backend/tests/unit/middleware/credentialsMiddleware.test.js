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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should call next() if all fields are valid", async () => {
    req.body = {
      username: "john.doe",
      email: "john.doe@example.com",
      password: "Password123!",
    };

    isEmailValid.mockReturnValue(true);
    isPasswordValid.mockReturnValue(true);

    await credentialsIsValid(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
    expect(req.credentials).toEqual({
      username: "john.doe",
      email: "john.doe@example.com",
      password: "Password123!",
    });
  });

  it("should return 400 if email is invalid", async () => {
    req.body = {
      username: "john.doe",
      email: "invalidEmailexample.com",
      password: "Password123!",
    };

    isEmailValid.mockReturnValue(false);
    isPasswordValid.mockReturnValue(true);

    await credentialsIsValid(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid email format" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 400 if password is invalid", async () => {
    req.body = {
      username: "john.doe",
      email: "john.doe@example.com",
      password: "password123",
    };

    isEmailValid.mockReturnValue(true);
    isPasswordValid.mockReturnValue(false);

    await credentialsIsValid(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message:
        "password must contain uppercase letters, lowercase letters, numbers and at least 8 characters",
    });
    expect(next).not.toHaveBeenCalled();
  });
});
