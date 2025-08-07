import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import authService from "../../../src/services/authService.js";
import authRepository from "../../../src/repository/authRepository.js";
import InternalErrorHttp from "../../../src/errors/InternalError.js";
import userRepository from "../../../src/repository/userRepository.js";
import NotFoundErrorHttp from "../../../src/errors/NotFoundError.js";
import UnauthorizedErrorHttp from "../../../src/errors/UnauthorizedError.js";
import BadRequestErrorHttp from "../../../src/errors/BadRequestError.js";

jest.mock("bcrypt", () => ({
  __esModule: true,
  default: {
    compare: jest.fn(),
    hash: jest.fn(),
  },
}));

jest.mock("jsonwebtoken", () => ({
  __esModule: true,
  default: {
    sign: jest.fn(),
  },
}));

jest.mock("../../../src/repository/authRepository.js", () => ({
  create: jest.fn(),
  findRefreshTokenByUserId: jest.fn(),
  deleteByUserId: jest.fn(),
}));

jest.mock("../../../src/repository/userRepository.js", () => ({
  __esModule: true,
  default: {
    getByEmail: jest.fn(),
  },
}));

const mockUser = {
  id: 1,
  username: "john doe",
  email: "john.doe123@example.com",
  avatarUrl: "avatarUrl.png",
  password: "hashPassword",
  createdAt: "2025-08-06T10:00:00Z",
};

describe("auth service", () => {
  describe("get tokens", () => {
    it("should propagate InternalErrrorHttp when the tokens are not genereted", async () => {
      authRepository.deleteByUserId.mockResolvedValue();
      jwt.sign.mockReturnValueOnce("access token").mockReturnValueOnce(null);

      await expect(authService.getTokens(1)).rejects.toBeInstanceOf(
        InternalErrorHttp
      );
    });
    it("should generate, hash, and storage the tokens successfully", async () => {
      authRepository.deleteByUserId.mockResolvedValue();
      jwt.sign
        .mockReturnValueOnce("access token")
        .mockReturnValueOnce("refresh token");
      bcrypt.hash.mockReturnValueOnce("hashRefreshToken");
      authRepository.create.mockResolvedValue();

      const result = await authService.getTokens(1);

      expect(result).toStrictEqual({
        accessToken: "access token",
        refreshToken: "refresh token",
      });
    });
  });
  describe("login", () => {
    it("should propagate NotFoundErrorHttp when the e-mail is not found", async () => {
      userRepository.getByEmail.mockResolvedValue({ rows: [] });

      await expect(
        authService.login("example123@example.com", "passWord123#")
      ).rejects.toBeInstanceOf(NotFoundErrorHttp);
    });
    it("should propagate UnauthorizedErrorHttp when the credentials are invalid", async () => {
      userRepository.getByEmail.mockResolvedValue({ rows: [mockUser] });
      bcrypt.compare.mockReturnValueOnce(false);

      await expect(
        authService.login(mockUser.email, "passWord123#")
      ).rejects.toBeInstanceOf(UnauthorizedErrorHttp);
    });
    it("should return user id when the credentials are valid", async () => {
      userRepository.getByEmail.mockResolvedValue({ rows: [mockUser] });
      bcrypt.compare.mockReturnValueOnce(true);

      const result = await authService.login(
        mockUser.email,
        "correctPassword123#"
      );

      expect(bcrypt.compare).toHaveBeenCalledWith(
        "correctPassword123#",
        mockUser.password
      );
      expect(result).toBe(mockUser.id);
    });
  });
  describe("get access token", () => {
    it("should propagate NotFoundErrorHttp when the refresh token was not found or expired", async () => {
      authRepository.findRefreshTokenByUserId.mockResolvedValue({ rows: [] });

      await expect(
        authService.getAccessToken("invalidRefreshToken", 1)
      ).rejects.toBeInstanceOf(NotFoundErrorHttp);
    });
    it("should propagate BadRequestErrorHttp when the refresh token is invalid", async () => {
      authRepository.findRefreshTokenByUserId.mockResolvedValue({
        rows: [{ refresh_token: "hashRefreshToken" }],
      });
      bcrypt.compare.mockReturnValueOnce(false);

      await expect(
        authService.getAccessToken("invalidRefreshToken", 1)
      ).rejects.toBeInstanceOf(BadRequestErrorHttp);
    });
    it("should return the access token when the refresh token is valid", async () => {
      authRepository.findRefreshTokenByUserId.mockResolvedValue({
        rows: [{ refresh_token: "hashRefreshToken" }],
      });
      bcrypt.compare.mockReturnValueOnce(true);
      jwt.sign.mockReturnValueOnce("newAccessToken");

      const result = await authService.getAccessToken("validRefreshToken", 1);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        "validRefreshToken",
        "hashRefreshToken"
      );
      expect(result).toBe("newAccessToken");
    });
  });
});
