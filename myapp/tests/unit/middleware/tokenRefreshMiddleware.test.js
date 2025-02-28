import jwt from "jsonwebtoken";

import verifyExpirationToken from "../../../src/middleware/tokenRefreshMiddleware.js";
import { decrypt } from "../../../src/utils/crypto.js";

jest.mock("../../../src/utils/crypto.js", () => ({
  decrypt: jest.fn(),
}));
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if token is expired or not found in signed cookies", async () => {
    await verifyExpirationToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "refresh token not found or expired",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 500 if an unexpected error occurs", async () => {
    req.signedCookies.refreshToken = "encrypted-token";
    decrypt.mockImplementation(() => {
      throw new Error("Unexpected error");
    });

    await verifyExpirationToken(req, res, next);

    expect(decrypt).toHaveBeenCalledWith("encrypted-token");
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unexpected error",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next() if refresh token is valid", async () => {
    req.signedCookies.refreshToken = "encrypted-token";
    decrypt.mockReturnValue("decrypted-token");
    jwt.verify.mockReturnValue({ userId: 1 });

    await verifyExpirationToken(req, res, next);

    expect(decrypt).toHaveBeenCalledWith("encrypted-token");
    expect(jwt.verify).toHaveBeenCalledWith(
      "decrypted-token",
      process.env.REFRESH_TOKEN_SECRET
    );
    expect(req.userId).toBe(1);
    expect(next).toHaveBeenCalled();
  });
});
