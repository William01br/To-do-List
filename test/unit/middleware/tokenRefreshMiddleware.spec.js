import jwt from "jsonwebtoken";

import verifyExpirationToken from "../../../src/middleware/tokenRefreshMiddleware.js";
import UnauthorizedErrorHttp from "../../../src/errors/UnauthorizedError.js";

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

describe("Token Refresh middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { signedCookies: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it("should propagate UnauthorizedErrorHttp if token is expired or not found in signed cookies", () => {
    expect(() =>
      verifyExpirationToken(req, res, next).toThrow(UnauthorizedErrorHttp)
    );
    expect(next).not.toHaveBeenCalled();
  });
  it("should call next() if refresh token is valid", () => {
    req.signedCookies.refreshToken = "token";
    jwt.verify.mockReturnValue({ userId: 1 });

    verifyExpirationToken(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(
      "token",
      process.env.REFRESH_TOKEN_SECRET
    );
    expect(req.userId).toBe(1);
    expect(next).toHaveBeenCalled();
  });
});
