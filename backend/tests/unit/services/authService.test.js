import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { pool } from "../../../src/config/database.js";
import authService from "../../../src/services/authService.js";

jest.mock("bcrypt", () => ({
  compare: jest.fn(),
}));

jest.mock("../../../src/config/database.js", () => ({
  pool: {
    query: jest.fn(),
  },
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

describe("function Login of authService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return null if password does not match", async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const result = await authService.login(
      "nonexistent@example.com",
      "password"
    );
    expect(result).toBeNull();
    expect(pool.query).toHaveBeenCalledWith(
      "SELECT * FROM users WHERE email = $1",
      ["nonexistent@example.com"]
    );
  });

  it("should return null if password does not match", async () => {
    pool.query.mockResolvedValue({
      rows: [{ id: 1, email: "test@example.com", password: "hashedPassword" }],
    });

    bcrypt.compare.mockResolvedValue(false);

    const result = await authService.login("test@example.com", "wrongpassword");

    expect(result).toBeNull();
    expect(bcrypt.compare).toHaveBeenCalledWith(
      "wrongpassword",
      "hashedPassword"
    );
  });

  it("should return user id if email and password are correct", async () => {
    pool.query.mockResolvedValue({
      rows: [{ id: 1, email: "test@example.com", password: "hashedPassword" }],
    });

    bcrypt.compare.mockResolvedValue(true);

    const result = await authService.login(
      "test@example.com",
      "correctPassword"
    );

    expect(result).toBe(1);
    expect(bcrypt.compare).toHaveBeenCalledWith(
      "correctPassword",
      "hashedPassword"
    );
  });

  it("should throw an error if getUserByEmail fails", async () => {
    pool.query.mockRejectedValue(new Error("Database error"));

    await expect(
      authService.getUserByEmail("test@example.com")
    ).rejects.toThrow("Error getting user data by email");
  });
});

describe("function getAcessToken of authService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return null if no token is available", async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const result = await authService.getAcessToken("revokedRefreshToken", 1);
    expect(result).toBeNull();
    expect(pool.query).toHaveBeenCalledWith(
      "SELECT refresh_token FROM refresh_tokens WHERE user_id = $1 AND revoked = false LIMIT 1",
      [1]
    );
  });

  it("should return null if refresh token does not match", async () => {
    pool.query.mockResolvedValue({
      rows: [{ refresh_token: "hashRefreshToken", user_id: 1 }],
    });

    bcrypt.compare.mockResolvedValue(false);

    const result = await authService.getAcessToken("invalidRefreshToken", 1);

    expect(result).toBeNull();
    expect(bcrypt.compare).toHaveBeenCalledWith(
      "invalidRefreshToken",
      "hashRefreshToken"
    );
  });

  it("should return acess token if the refresh token matches", async () => {
    pool.query.mockResolvedValue({
      rows: [
        {
          refresh_token: "hashRefreshToken",
          user_id: 1,
        },
      ],
    });

    bcrypt.compare.mockResolvedValue(true);

    jwt.sign.mockResolvedValue("acess token");

    const result = await authService.getAcessToken("refreshToken", 1);

    expect(pool.query).toHaveBeenCalledWith(
      "SELECT refresh_token FROM refresh_tokens WHERE user_id = $1 AND revoked = false LIMIT 1",
      [1]
    );
    expect(bcrypt.compare).toHaveBeenCalledWith(
      "refreshToken",
      "hashRefreshToken"
    );
    expect(jwt.sign).toHaveBeenCalledWith(
      { userId: 1 },
      process.env.ACESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );
    expect(result).toBe("acess token");
  });

  it("should throw an error if getRefreshTokenByUserId fails", async () => {
    pool.query.mockRejectedValue(new Error("Database error"));

    await expect(
      authService.getRefreshTokenByUserId("invalidRefreshToken")
    ).rejects.toThrow("Error getting refresh token by userId");
  });
});
