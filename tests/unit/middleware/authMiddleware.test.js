import jwt from "jsonwebtoken";

import authenticateToken from "../../../src/middleware/authMiddleware";

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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if token is not found in signed cookies", () => {
    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Unauthorized: token not found or expired",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 403 if token is invalid", () => {
    req.signedCookies.acessToken = "token";
    jwt.verify.mockImplementation(() => {
      throw new jwt.JsonWebTokenError("invalid token");
    });

    authenticateToken(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(
      "token",
      process.env.ACESS_TOKEN_SECRET
    );
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid signature" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 500 if an unexpected error occurs", () => {
    req.signedCookies.acessToken = "token";
    jwt.verify.mockImplementation(() => {
      throw new Error("Unexpected error");
    });

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Unexpected error",
    });
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
