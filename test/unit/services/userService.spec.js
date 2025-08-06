// import bcrypt from "bcrypt";

import { pool } from "../../../src/config/db.js";
import userService from "../../../src/services/userService.js";
import userRepository from "../../../src/repository/userRepository.js";
import ConflictErrorHttp from "../../../src/errors/ConflicError.js";
// import { createTokenReset } from "../../../src/utils/crypto.js";
// import { transporter } from "../../../src/config/nodemailer.js";

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
});
