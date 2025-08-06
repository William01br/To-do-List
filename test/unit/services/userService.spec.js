// import bcrypt from "bcrypt";

import userService from "../../../src/services/userService.js";
import userRepository from "../../../src/repository/userRepository.js";
import ConflictErrorHttp from "../../../src/errors/ConflicError.js";
import InternalErrorHttp from "../../../src/errors/InternalError.js";
import { createTokenReset } from "../../../src/utils/crypto.js";
import { createMessageEmail } from "../../../src/utils/createMessageEmail.js";
import { transporter } from "../../../src/config/nodemailer.js";

jest.mock("bcrypt", () => ({
  hash: jest.fn(),
}));

jest.mock("../../../src/repository/userRepository.js", () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    findByOauthId: jest.fn(),
    getAllByUserId: jest.fn(),
    insertUserByOAuth: jest.fn(),
    updateAvatar: jest.fn(),
    updateResetPasswords: jest.fn(),
    emailExists: jest.fn(),
    verifyExpirationToken: jest.fn(),
    updatePassword: jest.fn(),
    deleteByUserId: jest.fn(),
    getByEmail: jest.fn(),
  },
}));

jest.mock("../../../src/config/db.js", () => ({
  pool: {
    query: jest.fn(),
  },
}));

jest.mock("../../../src/utils/crypto.js", () => ({
  createTokenReset: jest.fn(),
}));

jest.mock("../../../src/utils/createMessageEmail.js", () => ({
  createMessageEmail: jest.fn(),
}));

jest.mock("../../../src/config/nodemailer.js", () => ({
  transporter: {
    sendMail: jest.fn(),
  },
}));

const avatarUrl =
  "https://static.vecteezy.com/system/resources/thumbnails/009/734/564/small_2x/default-avatar-profile-icon-of-social-media-user-vector.jpg";

describe("userService", () => {
  const mockUser = {
    rows: [
      {
        id: 1,
        username: "john doe",
        email: "john.doe123@example.com",
        avatarUrl: avatarUrl,
        createdAt: Date.now(),
      },
    ],
  };
  describe("register", () => {
    it("should return the user id", async () => {
      // pool.query.mockResolvedValue({ rows: mockUser });
      userRepository.emailExists.mockResolvedValue({
        rows: [],
      });
      userRepository.create.mockResolvedValue(mockUser);

      const result = await userService.register(
        mockUser.rows[0].username,
        mockUser.rows[0].email,
        "PassWord123#"
      );
      expect(result).toBe(mockUser.rows[0].id);
    });
    it("should propagate ConflictErrorHttp when e-mail alredy exists", async () => {
      userRepository.emailExists.mockResolvedValue({
        rows: [{ email: mockUser.rows[0].email }],
      });

      await expect(
        userService.register(
          mockUser.rows[0].username,
          mockUser.rows[0].email,
          "PassWord123#"
        )
      ).rejects.toBeInstanceOf(ConflictErrorHttp);
    });
  });
  describe("update avatar", () => {
    it("should propagate InternalErrorHttp when avatar is not updated", async () => {
      userRepository.updateAvatar.mockResolvedValue({ rowCount: 0 });

      await expect(
        userService.updateAvatar(avatarUrl, 1)
      ).rejects.toBeInstanceOf(InternalErrorHttp);
    });
  });
  describe("send email to reset password", () => {
    it("should propagate ConflictErrorHttp when e-mail alredy exists", async () => {
      userRepository.emailExists.mockResolvedValue({
        rows: [{ email: mockUser.rows[0].email }],
      });

      await expect(
        userService.register(
          mockUser.rows[0].username,
          mockUser.rows[0].email,
          "PassWord123#"
        )
      ).rejects.toBeInstanceOf(ConflictErrorHttp);
    });
    it("should propagate InternalErrorHttp when the token is not updated", async () => {
      userRepository.emailExists.mockResolvedValue({
        rows: [],
      });
      userRepository.updateResetPasswords.mockResolvedValue({ rowCount: 0 });

      await expect(
        userService.sendEmailToResetPassword(mockUser.rows[0].email)
      ).rejects.toBeInstanceOf(InternalErrorHttp);
    });
    it("generate token and calculate expiration date correctly", async () => {
      jest
        .useFakeTimers("modern")
        .setSystemTime(new Date("2025-08-06T10:00:00Z"));
      userRepository.emailExists.mockResolvedValue({ rows: [] });
      createTokenReset.mockResolvedValue("FIXED_TOKEN");
      userRepository.updateResetPasswords.mockResolvedValue({ rowCount: 1 });
      createMessageEmail.mockResolvedValue({});

      await userService.sendEmailToResetPassword(mockUser.rows[0].email);

      const expectedDate = new Date("2025-08-06T11:00:00Z");
      expect(userRepository.updateResetPasswords).toHaveBeenCalledWith(
        "FIXED_TOKEN",
        mockUser.rows[0].email,
        expectedDate
      );
      jest.useRealTimers();
    });
    it("mount and send mailOptions correctly", async () => {
      userRepository.emailExists.mockResolvedValue({ rows: [] });
      createTokenReset.mockResolvedValue("TOKENXYZ");
      userRepository.updateResetPasswords.mockResolvedValue({ rowCount: 1 });

      const fakeMail = {
        to: "user",
        from: "email_user",
        text: "Use this link: localhost:3000/user/reset-password/TOKENXYZ",
      };
      createMessageEmail.mockResolvedValue(fakeMail);

      await userService.sendEmailToResetPassword(mockUser.rows[0].email);

      expect(createMessageEmail).toHaveBeenCalledWith(
        mockUser.rows[0].email,
        "localhost:3000/user/reset-password/TOKENXYZ"
      );
      expect(transporter.sendMail).toHaveBeenCalled();
    });
  });
});
