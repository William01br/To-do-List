import bcrypt from "bcrypt";

import { pool } from "../../../src/config/database.js";
import userService from "../../../src/services/userService.js";
import { createTokenReset } from "../../../src/utils/crypto.js";
import { transporter } from "../../../src/config/nodemailer.js";

jest.mock("bcrypt", () => ({
  hash: jest.fn(),
}));

jest.mock("../../../src/config/database.js", () => ({
  pool: {
    query: jest.fn(),
  },
}));

jest.mock("../../../src/utils/crypto.js", () => ({
  createTokenReset: jest.fn(),
}));

jest.mock("../../../src/config/nodemailer.js", () => ({
  transporter: {
    sendMail: jest.fn(),
  },
}));

describe("register", () => {
  const avatarUrl =
    "https://static.vecteezy.com/system/resources/thumbnails/009/734/564/small_2x/default-avatar-profile-icon-of-social-media-user-vector.jpg";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should register a user sucessfully", async () => {
    const mockUser = {
      id: 1,
      username: "john.doe",
      email: "john.doe@example.com",
      avatar: avatarUrl,
      created_at: "2000-01-01",
    };

    bcrypt.hash.mockResolvedValue("hashedPassword");
    pool.query.mockResolvedValue({ rows: [mockUser] });

    const result = await userService.register(
      "john.doe",
      "john.doe@example.com",
      "password"
    );

    expect(bcrypt.hash).toBeCalledWith("password", 10);

    expect(result).toBe(mockUser);
  });

  it("should generate an error if the password hashing fails", async () => {
    bcrypt.hash.mockRejectedValue(new Error("Password hashing failed"));

    await expect(
      userService.register("john.doe", "john.doe@example.com", "password")
    ).rejects.toThrow("Failed to register user");
  });

  it("should generate an error if duplicate user error occurs", async () => {
    bcrypt.hash.mockResolvedValue("hashedPassword");

    const duplicateError = new Error("Duplicate value");
    duplicateError.code = "23505";
    pool.query.mockRejectedValue(duplicateError);

    const result = await userService.register(
      "john.doe",
      "john.doe@example.com",
      "password"
    );

    expect(result).toBe(23505);
  });

  it("should generate a error if database fails", async () => {
    pool.query.mockRejectedValue(new Error("unexpected database error"));

    await expect(
      userService.register("john.doe", "john.doe@example.com", "password")
    ).rejects.toThrow("Failed to register user");
  });
});

describe("register by OAuth", () => {
  const fakeData = {
    name: "john.doe",
    email: "john.doe@example.com",
    oauthId: "12345",
    avatar: "avatarUrl",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should register a user by OAuth with sucessfully", async () => {
    const mockUser = {
      id: 1,
      username: "john.doe",
      email: "john.doe@example.com",
      oauthProvider: "google",
      oauthId: "12345",
      avatar: "avatarUrl",
    };

    pool.query.mockResolvedValue({ rows: [mockUser] });

    const result = await userService.registerByOAuth(fakeData);

    expect(result).toBe(mockUser);
  });

  it("should generate error if database fails", () => {
    pool.query.mockRejectedValue(new Error("unexpected database error"));

    expect(userService.registerByOAuth(fakeData)).rejects.toThrow(
      "Error registering user by OAuth"
    );
  });
});

describe("update avatar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update avatar with sucessfully", async () => {
    // rowCount = 1 if there is an updated line
    pool.query.mockResolvedValue({ rowCount: 1 });

    const result = await userService.updateAvatar("newAvatarUrl", 1);
    expect(result).toBe(true);
  });

  it("should return null if avatar is not updated", async () => {
    pool.query.mockResolvedValue({ rowCount: 0 });

    const result = await userService.updateAvatar("newAvatarUrl", 1);

    expect(result).toBe(null);
  });

  it("should generate error if database fails", () => {
    pool.query.mockRejectedValue(new Error("Unexpected database error"));

    expect(userService.updateAvatar("newAvatarUrl", 1)).rejects.toThrow(
      "Error updating avatar in DataBase"
    );
  });
});

describe("send email to reset password", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("must send e-mail with the correct data and return true", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ email: "test@example.com" }] });
    createTokenReset.mockReturnValue("resetToken");
    pool.query.mockResolvedValueOnce({ rowCount: 1 });

    const result = await userService.sendEmailToResetPassword(
      "test@example.com"
    );

    expect(result).toBe(true);

    expect(transporter.sendMail).toHaveBeenCalledTimes(1);

    expect(transporter.sendMail).toHaveBeenCalledWith({
      to: "test@example.com",
      from: process.env.EMAIL_USER,
      subject: "Password Reset",
      text: expect.stringContaining(
        "localhost:3000/user/reset-password/resetToken"
      ),
    });
  });

  it("should return null when email not exist in database", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const result = await userService.sendEmailToResetPassword(
      "test@example.com"
    );

    expect(result).toBe(null);
    expect(createTokenReset).not.toHaveBeenCalled();
    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(transporter.sendMail).not.toHaveBeenCalled();
  });

  it("should to throw an error when occurs unexpected error in database (verifyEmailExist)", async () => {
    pool.query.mockRejectedValueOnce(new Error("Unexpected database error"));

    await expect(
      userService.sendEmailToResetPassword("test@example.com")
    ).rejects.toThrow("Error sending email to reset password");
  });

  it("should return null when reset passwords are not updated", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ email: "test@example.com" }] });
    createTokenReset.mockReturnValue("resetToken");
    pool.query.mockResolvedValueOnce({ rowCount: 0 });

    const result = await userService.sendEmailToResetPassword(
      "test@example.com"
    );

    expect(result).toBe(null);
    expect(pool.query).toHaveBeenCalledTimes(2);
    expect(transporter.sendMail).not.toHaveBeenCalled();
  });

  it("must be to throw an error when occurs unexpected error in database (updateResetPasswords)", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ email: "test@example.com" }] });
    createTokenReset.mockReturnValue("resetToken");
    pool.query.mockRejectedValueOnce(new Error("Unexpected database error"));

    await expect(
      userService.sendEmailToResetPassword("user@example.com")
    ).rejects.toThrow("Error sending email to reset password");
    expect(pool.query).toHaveBeenCalledTimes(2);
    expect(createTokenReset).toHaveBeenCalledTimes(1);
    expect(transporter.sendMail).not.toHaveBeenCalled();
  });
});

describe("reset password", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("must reset password and return true", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, email: "user@example.com" }],
    });
    bcrypt.hash.mockResolvedValue("hashedPassword");
    pool.query.mockResolvedValueOnce({ rowCount: 1 });

    const result = await userService.resetPassword("newPassword", "resetToken");

    expect(result).toBe(true);
    expect(bcrypt.hash).toHaveBeenCalledWith("newPassword", 10);
    expect(pool.query).toHaveBeenCalledTimes(2);
  });

  it("should return null when the token has expired", async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const result = await userService.resetPassword("newPassword", "resetToken");

    expect(result).toBe(null);
    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(bcrypt.hash).not.toHaveBeenCalled();
  });

  it("must be to throw an error when occurs unexpected error in database (verifyExpirationToken)", async () => {
    pool.query.mockRejectedValue(new Error("Unexpected database error"));

    await expect(
      userService.resetPassword("newPassword", "resetToken")
    ).rejects.toThrow("Error resetting password");
    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(bcrypt.hash).not.toHaveBeenCalled();
  });

  it("must be to throw an error when occurs unexpected error while hashing password", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, email: "test@example.com" }],
    });
    bcrypt.hash.mockRejectedValue(new Error("Unexpected hash error"));

    await expect(
      userService.resetPassword("newPassword", "resetToken")
    ).rejects.toThrow("Error resetting password");
    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(bcrypt.hash).toHaveBeenCalledWith("newPassword", 10);
  });

  it("should return null when password has not been reset", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, email: "test@example.com" }],
    });
    bcrypt.hash.mockResolvedValue("hashedPassword");
    pool.query.mockResolvedValueOnce({ rowCount: 0 });

    const result = await userService.resetPassword("newPassword", "resetToken");

    expect(result).toBe(null);
    expect(bcrypt.hash).toHaveBeenCalledWith("newPassword", 10);
    expect(pool.query).toHaveBeenCalledTimes(2);
  });

  it("must be to throw an error when occurs unexpected error while resetting password (updateNewPassword)", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, email: "test@example.com" }],
    });
    bcrypt.hash.mockResolvedValue("hashedPassword");
    pool.query.mockRejectedValue(new Error("Unexpected update error"));

    await expect(
      userService.resetPassword("newPassword", "resetToken")
    ).rejects.toThrow("Error resetting password");
    expect(pool.query).toHaveBeenCalledTimes(2);
    expect(bcrypt.hash).toHaveBeenCalledWith("newPassword", 10);
  });
});

describe("Get all data user by user Id", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should get all data user by user id with sucessfully", async () => {
    const mockUser = {
      id: 1,
      username: "john.doe",
      email: "john.doe@example.com",
      oauthProvider: "google",
      oauthId: "12345",
      avatar: "avatarUrl",
    };

    pool.query.mockResolvedValue({ rows: [mockUser] });

    const result = await userService.getAllDataUserByUserId(1);

    expect(result).toBe(mockUser);
  });

  it("should generate error if database fails", () => {
    pool.query.mockRejectedValue(new Error("unexpected database error"));

    expect(userService.getAllDataUserByUserId(1)).rejects.toThrow(
      "Error getting all data user by userId"
    );
  });

  it("should return null if the user does not exist", async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const result = await userService.getAllDataUserByUserId(1);

    expect(result).toBe(null);
  });
});

describe("delete account", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should delete the user with the given id and return true", async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 1 });

    const result = await userService.deleteAccount(1);

    expect(result).toBe(true);
  });

  it("should generate error if database fails", () => {
    pool.query.mockRejectedValue(new Error("unexpected database error"));

    expect(userService.deleteAccount(1)).rejects.toThrow(
      "Error deleting all data user by userId"
    );
  });

  it("should return null if the user does not exist", async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 0 });

    const result = await userService.deleteAccount(1);

    expect(result).toBe(null);
  });
});
