import jwt from "jsonwebtoken";

import authenticateToken from "../../../src/middleware/authMiddleware";
import UnauthorizedErrorHttp from "../../../src/errors/UnauthorizedError";

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
  JsonWebTokenError: jest.requireActual("jsonwebtoken").JsonWebTokenError,
}));

describe("Authentication middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { signedCookies: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });
  it("should propagate UnauthorizedErrorHttp if token is not found in signed cookies", () => {
    expect(() => authenticateToken(req, res, next)).toThrow(
      UnauthorizedErrorHttp
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 400 if token is invalid", () => {
    req.signedCookies.acessToken = "invalidToken";
    jwt.verify.mockImplementation(() => {
      throw new jwt.JsonWebTokenError("invalid token");
    });

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "JWT invalid" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next() if token is valid", () => {
    req.signedCookies.acessToken = "token";
    jwt.verify.mockReturnValue({ userId: 1 });

    authenticateToken(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(
      "token",
      process.env.ACESS_TOKEN_SECRET
    );
    expect(req.userId).toBe(1);
    expect(next).toHaveBeenCalled();
  });
});
