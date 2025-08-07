import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import authService from "../../../src/services/authService.js";
import authRepository from "../../../src/repository/authRepository.js";
import InternalErrorHttp from "../../../src/errors/InternalError.js";
import userRepository from "../../../src/repository/userRepository.js";
import NotFoundErrorHttp from "../../../src/errors/NotFoundError.js";
import UnauthorizedErrorHttp from "../../../src/errors/UnauthorizedError.js";

jest.mock("bcrypt", () => ({
  __esModule: true,
  default: {
    compare: jest.fn(),
    hash: jest.fn(),
  },
}));

// jest.mock("../../../src/config/db.js", () => ({
//   pool: {
//     query: jest.fn(),
//   },
// }));

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
});

// describe("function Login of authService", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it("should return null if password does not match", async () => {
//     pool.query.mockResolvedValue({ rows: [] });

//     const result = await authService.login(
//       "nonexistent@example.com",
//       "password"
//     );
//     expect(result).toBeNull();
//     expect(pool.query).toHaveBeenCalledWith(
//       "SELECT * FROM users WHERE email = $1",
//       ["nonexistent@example.com"]
//     );
//   });

//   it("should return null if password does not match", async () => {
//     pool.query.mockResolvedValue({
//       rows: [{ id: 1, email: "test@example.com", password: "hashedPassword" }],
//     });

//     bcrypt.compare.mockResolvedValue(false);

//     const result = await authService.login("test@example.com", "wrongpassword");

//     expect(result).toBeNull();
//     expect(bcrypt.compare).toHaveBeenCalledWith(
//       "wrongpassword",
//       "hashedPassword"
//     );
//   });

//   it("should return user id if email and password are correct", async () => {
//     pool.query.mockResolvedValue({
//       rows: [{ id: 1, email: "test@example.com", password: "hashedPassword" }],
//     });

//     bcrypt.compare.mockResolvedValue(true);

//     const result = await authService.login(
//       "test@example.com",
//       "correctPassword"
//     );

//     expect(result).toBe(1);
//     expect(bcrypt.compare).toHaveBeenCalledWith(
//       "correctPassword",
//       "hashedPassword"
//     );
//   });

//   it("should throw an error if getUserByEmail fails", async () => {
//     pool.query.mockRejectedValue(new Error("Database error"));

//     await expect(
//       authService.login("test@example.com", "password")
//     ).rejects.toThrow("Error when logging in user");
//   });
// });

// describe("function getAcessToken of authService", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it("should return null if no token is available", async () => {
//     pool.query.mockResolvedValue({ rows: [] });

//     const result = await authService.getAcessToken("revokedRefreshToken", 1);
//     expect(result).toBeNull();
//     expect(pool.query).toHaveBeenCalledWith(
//       "SELECT refresh_token FROM refresh_tokens WHERE user_id = $1 AND revoked = false LIMIT 1",
//       [1]
//     );
//   });

//   it("should return null if refresh token does not match", async () => {
//     pool.query.mockResolvedValue({
//       rows: [{ refresh_token: "hashRefreshToken", user_id: 1 }],
//     });

//     bcrypt.compare.mockResolvedValue(false);

//     const result = await authService.getAcessToken("invalidRefreshToken", 1);

//     expect(result).toBeNull();
//     expect(bcrypt.compare).toHaveBeenCalledWith(
//       "invalidRefreshToken",
//       "hashRefreshToken"
//     );
//   });

//   it("should return acess token if the refresh token matches", async () => {
//     pool.query.mockResolvedValue({
//       rows: [
//         {
//           refresh_token: "hashRefreshToken",
//           user_id: 1,
//         },
//       ],
//     });

//     bcrypt.compare.mockResolvedValue(true);

//     jwt.sign.mockResolvedValue("acess token");

//     const result = await authService.getAcessToken("refreshToken", 1);

//     expect(pool.query).toHaveBeenCalledWith(
//       "SELECT refresh_token FROM refresh_tokens WHERE user_id = $1 AND revoked = false LIMIT 1",
//       [1]
//     );
//     expect(bcrypt.compare).toHaveBeenCalledWith(
//       "refreshToken",
//       "hashRefreshToken"
//     );
//     expect(jwt.sign).toHaveBeenCalledWith(
//       { userId: 1 },
//       process.env.ACESS_TOKEN_SECRET,
//       { expiresIn: "1h" }
//     );
//     expect(result).toBe("acess token");
//   });

//   it("should throw an error if getRefreshTokenByUserId fails", async () => {
//     pool.query.mockRejectedValue(new Error("Database error"));

//     await expect(
//       authService.getAcessToken("invalidRefreshToken", 1)
//     ).rejects.toThrow("Error getting acess token");
//   });
// });
