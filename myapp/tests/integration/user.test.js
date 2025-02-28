jest.mock("cloudinary", () => ({
  v2: {
    config: jest.fn().mockImplementation(() => {}),
  },
}));
jest.mock("../../src/config/nodemailer.js", () => ({
  transporter: {
    sendMail: jest.fn(),
  },
}));

jest.mock("../../src/services/cloudinaryService.js", () => ({
  uploadFileToCloudinary: jest.fn(),
  optimizeImage: jest.fn(),
}));

import request from "supertest";
import jwt from "jsonwebtoken";
import { dirname } from "path";
import { fileURLToPath } from "url";
import signature from "cookie-signature";

import app from "../../src/app.js";
import { pool } from "../../src/config/db.js";
import { CustomError } from "../../src/utils/CustomError.js";
import { encrypt } from "../../src/utils/crypto.js";
import {
  uploadFileToCloudinary,
  optimizeImage,
} from "../../src/services/cloudinaryService.js";
import userService from "../../src/services/userService.js";

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);
const avatarUrl =
  "https://static.vecteezy.com/system/resources/thumbnails/009/734/564/small_2x/default-avatar-profile-icon-of-social-media-user-vector.jpg";

const getEncryptedToken = (id) => {
  const token = jwt.sign({ userId: id }, process.env.ACESS_TOKEN_SECRET, {
    expiresIn: "1h",
  });

  return encrypt(token);
};

const getSignedCookie = (encryptedToken) => {
  const signedToken =
    "s:" + signature.sign(encryptedToken, process.env.COOKIE_PARSER_SECRET); // `s:` indicates signed cookie

  // Create the cookie string manually (simulating an HTTP response cookie)
  return `acessToken=${signedToken}; Path=/; HttpOnly`;
};
describe("GET /user/", () => {
  describe("when the user is correctly authenticated", () => {
    describe("if the user exists", () => {
      it("should return status 200 and the user data", async () => {
        // SETUP: insert user in database
        const createUser = await userService.insertUser(
          "william",
          "testexample@gmail.com",
          "hashedPassword",
          avatarUrl
        );

        const encryptedToken = getEncryptedToken(createUser.id);

        const signedCookie = getSignedCookie(encryptedToken);

        const response = await request(app)
          .get("/user/")
          .set("Cookie", signedCookie);

        expect(response.status).toBe(200);
      });
    });
    describe("if the user does not exist", () => {
      it("should return status 400 and error 'Bad request' and message 'User not found'", async () => {
        const encryptedToken = getEncryptedToken(0);

        const signedCookie = getSignedCookie(encryptedToken);

        const response = await request(app)
          .get("/user/")
          .set("Cookie", signedCookie);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error", "Bad request");
        expect(response.body).toHaveProperty("message", "User not found");
      });
    });
  });
  describe("when the user is not correctly authenticated", () => {
    describe("when the token jwt is not found", () => {
      it("should return status 401 and message 'Unauthorized'", async () => {
        const token = "";

        const signedToken =
          "s:" + signature.sign(token, process.env.COOKIE_PARSER_SECRET);
        const signedCookie = `acessToken=${signedToken}; Path=/; HttpOnly`;

        const response = await request(app)
          .post("/user/upload")
          .set("Cookie", signedCookie);

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty(
          "message",
          "Unauthorized: token not found or expired"
        );
      });
    });

    describe("when the token have a invalid signature", () => {
      it("should return status 403 and message 'Invalid signature'", async () => {
        const token = jwt.sign({ userId: 1 }, "invalid Key", {
          expiresIn: "1h",
        });

        const encryptedToken = encrypt(token);

        const signedCookie = getSignedCookie(encryptedToken);

        const response = await request(app)
          .post("/user/upload")
          .set("Cookie", signedCookie);

        expect(response.status).toBe(403);
        expect(response.body).toHaveProperty("message", "Invalid signature");
      });
    });
  });
  describe("when occurs any unexpected error", () => {
    it("should return status 500 and the error message", async () => {
      const encryptedToken = getEncryptedToken(1);
      const signedCookie = getSignedCookie(encryptedToken);

      jest.spyOn(pool, "query").mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .get("/user/")
        .set("Cookie", signedCookie);

      expect(response.body).toHaveProperty(
        "message",
        "Error getting all data user by userId"
      );
      expect(response.status).toBe(500);
    });
  });
});

describe("POST /user/register", () => {
  describe("when the data is valid", () => {
    it("should create a new user and return status 200 and the user's data", async () => {
      const response = await request(app).post("/user/register").send({
        username: "William",
        email: "william001@gmail.com",
        password: "Test123example",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "message",
        "successfully registered"
      );
      expect(response.body.data.email).toBe("william001@gmail.com");
    });
  });

  describe("when the data is invalid", () => {
    it("should return status 400 and message wich the all fields are required", async () => {
      const response = await request(app).post("/user/register").send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "All fields needed be completed"
      );
    });

    it("should return status 400 and message about invalid email", async () => {
      const response = await request(app).post("/user/register").send({
        username: "William",
        email: "invalidEmail",
        password: "Test123example",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Invalid email format");
    });

    it("should return status 400 and message about invalid password", async () => {
      const response = await request(app).post("/user/register").send({
        username: "William",
        email: "william001@gmail.com",
        password: "test123",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "password must contain uppercase letters, lowercase letters, numbers and at least 8 characters"
      );
    });

    it("should return status 409 and the message about duplicate e-mail", async () => {
      // error code for unique duplicate key in pg
      jest
        .spyOn(pool, "query")
        .mockRejectedValue(new CustomError("unique duplicate key", "23505"));

      const response = await request(app).post("/user/register").send({
        username: "William",
        email: "william002@gmail.com",
        password: "Test123example",
      });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty("error", "conflict");
      expect(response.body).toHaveProperty(
        "message",
        "The email address is already registered"
      );
    });
  });

  describe("when occurs any unexpected error", () => {
    it("should return status 500 and the error message", async () => {
      jest
        .spyOn(pool, "query")
        .mockRejectedValue(new Error("unexpected database error"));

      const response = await request(app).post("/user/register").send({
        username: "William",
        email: "william003@gmail.com",
        password: "Test123example",
      });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty(
        "message",
        "Failed to register user"
      );
    });
  });
});

describe("POST /user/upload", () => {
  const filePath = _dirname + "/fixtures/deadpool.png";

  describe("when the user is correctly authenticated and the file was send correctly", () => {
    it("should return status 200 and the URL of the file uploaded to the server", async () => {
      // SETUP: insert user in Database.
      const createUser = await userService.insertUser(
        "william",
        "test123example@gmail.com",
        "hashedPassword",
        avatarUrl
      );

      const encryptedToken = getEncryptedToken(createUser.id);

      const signedCookie = getSignedCookie(encryptedToken);

      uploadFileToCloudinary.mockResolvedValue({
        secure_url: "https://cloudinary.test/uploaded.jpg",
      });
      optimizeImage.mockReturnValue("https://cloudinary.test/uploaded.jpg");

      const response = await request(app)
        .post("/user/upload")
        .set("Cookie", signedCookie)
        .attach("file", filePath);

      expect(response.body).toHaveProperty(
        "url",
        "https://cloudinary.test/uploaded.jpg"
      );
      expect(response.status).toBe(200);
    });
  });
  describe("when the user is not authenticated correctly", () => {
    describe("when the token jwt is not found", () => {
      it("should return status 401 and message 'Unauthorized'", async () => {
        const token = "";

        const signedCookie = getSignedCookie(token);

        const response = await request(app)
          .post("/user/upload")
          .set("Cookie", signedCookie);

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty(
          "message",
          "Unauthorized: token not found or expired"
        );
      });
    });

    describe("when the token have a invalid signature", () => {
      it("should return status 403 and message 'Invalid signature'", async () => {
        const token = jwt.sign({ userId: 1 }, "invalid Key", {
          expiresIn: "1h",
        });

        const encryptedToken = encrypt(token);

        const signedCookie = getSignedCookie(encryptedToken);

        const response = await request(app)
          .post("/user/upload")
          .set("Cookie", signedCookie);

        expect(response.status).toBe(403);
        expect(response.body).toHaveProperty("message", "Invalid signature");
      });
    });
  });

  describe("when the user don't send the file", () => {
    it("should return status 400 and message 'File required'", async () => {
      const encryptedToken = getEncryptedToken(1);

      const signedCookie = getSignedCookie(encryptedToken);

      const response = await request(app)
        .post("/user/upload")
        .set("Cookie", signedCookie)
        .attach("file", null);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "File required");
    });
  });

  describe("when occurs any unexpected error", () => {
    it("should return status 500 and message with the error", async () => {
      const encryptedToken = getEncryptedToken(1);

      const signedCookie = getSignedCookie(encryptedToken);

      jest
        .spyOn(pool, "query")
        .mockRejectedValue(new Error("unexpected database error"));

      const response = await request(app)
        .post("/user/upload")
        .set("Cookie", signedCookie)
        .attach("file", filePath);

      expect(response.body).toHaveProperty(
        "message",
        "Error updating avatar in DataBase"
      );
      expect(response.status).toBe(500);
    });
  });
});

describe("POST /user/forgot-password", () => {
  describe("when the email provided is valid and the email is send", () => {
    it("should return status 200 and the message 'Email sended'", async () => {
      await userService.insertUser(
        "william",
        "email@example.com",
        "hashPassword123",
        avatarUrl
      );

      const response = await request(app).post("/user/forgot-password").send({
        email: "email@example.com",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message", "Email sended");
    });
  });
  describe("when the email not is provided", () => {
    it("should return status 400 and the message 'Email required'", async () => {
      const response = await request(app)
        .post("/user/forgot-password")
        .send({ email: null });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Email required");
    });
  });
  describe("when the email provided is not found", () => {
    it("should return status 400 and the message 'Email not found'", async () => {
      const response = await request(app)
        .post("/user/forgot-password")
        .send({ email: "invalidEmail@example.com" });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Email not found");
    });
  });
  describe("when occurs any unexpected error", () => {
    it("should return status 500 and error message", async () => {
      jest
        .spyOn(pool, "query")
        .mockRejectedValue(new Error("Unexpected database error"));

      const response = await request(app)
        .post("/user/forgot-password")
        .send({ email: "teste@example.com" });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty(
        "message",
        "Error sending email to reset password"
      );
    });
  });
});

describe("POST /user/reset-password/:token", () => {
  describe("when the token and password provided are valid", () => {
    it("should return the status 200 and the message 'updated password successfully'", async () => {
      const resetToken = "tokenExample";

      await userService.insertUser(
        "william",
        "example@test.com",
        "hash123Password",
        avatarUrl
      );
      await userService.updateResetPasswords(resetToken, "example@test.com");

      const response = await request(app)
        .post(`/user/reset-password/${resetToken}`)
        .send({
          newPassword: "StrongPassword123",
        });

      expect(response.body).toHaveProperty(
        "message",
        "updated password successfully"
      );
      expect(response.status).toBe(200);
    });
  });
  describe("when the password is not sent or the password is weak or the token is invalid", () => {
    describe("when the password is not sent", () => {
      it("should return status 400 and message 'Both token and password are required'", async () => {
        const response = await request(app)
          .post(`/user/reset-password/${"resetToken"}`)
          .send({ newPassword: null });

        expect(response.body).toHaveProperty(
          "message",
          "Password are required"
        );
        expect(response.status).toBe(400);
      });
    });
    describe("when the token is invalid", () => {
      it("should return status 400 and the error message", async () => {
        const response = await request(app)
          .post(`/user/reset-password/${"test"}`)
          .send({ newPassword: "StrongPassword123" });

        expect(response.body).toHaveProperty(
          "message",
          "Invalid or Expired token"
        );
        expect(response.status).toBe(400);
      });
    });
    describe("when the password is weak", () => {
      it("should return status 400 and error message", async () => {
        const response = await request(app)
          .post(`/user/reset-password/${"test"}`)
          .send({ newPassword: "weakPassword" });

        expect(response.body).toHaveProperty(
          "message",
          "password must contain uppercase letters, lowercase letters, numbers and at least 8 characters"
        );
        expect(response.status).toBe(400);
      });
    });
  });
  describe("when occurs any unexpected error", () => {
    it("should return status 500 and error message", async () => {
      const resetToken = "tokenExample";

      await userService.insertUser(
        "william",
        "example123098@test.com",
        "hash123Password",
        avatarUrl
      );
      await userService.updateResetPasswords(
        resetToken,
        "example123098@test.com"
      );

      jest
        .spyOn(pool, "query")
        .mockRejectedValue(new Error("Unexpected database error"));

      const response = await request(app)
        .post(`/user/reset-password/${resetToken}`)
        .send({
          newPassword: "StrongPassword123",
        });

      expect(response.body).toHaveProperty(
        "message",
        "Error resetting password"
      );
      expect(response.status).toBe(500);
    });
  });
});

describe("DELETE /user/remove-account", () => {
  describe("when the user delete the account with successfully", () => {
    it("should return status 200 and message 'User deleted successfully'", async () => {
      const user = await userService.insertUser(
        "william",
        "emailexample@test.com",
        "hashPassword",
        avatarUrl
      );
      console.log(user.id);

      const encryptedToken = getEncryptedToken(user.id);
      const signedCookie = getSignedCookie(encryptedToken);

      const response = await request(app)
        .delete("/user/remove-account")
        .set("Cookie", signedCookie);

      expect(response.body).toHaveProperty(
        "message",
        "User deleted successfully"
      );
      expect(response.status).toBe(200);
    });
  });
  describe("when the user is not deleted", () => {
    it("should return status 500 and message 'User not deleted'", async () => {
      const encryptedToken = getEncryptedToken(0);
      const signedCookie = getSignedCookie(encryptedToken);

      const response = await request(app)
        .delete("/user/remove-account")
        .set("Cookie", signedCookie);

      expect(response.body).toHaveProperty("message", "User not deleted");
      expect(response.status).toBe(500);
    });
  });
  describe("when occurs any unexpected error", () => {
    it("should return status 500 and error message", async () => {
      const user = await userService.insertUser(
        "william",
        "123example@test.com",
        "hashPassword",
        avatarUrl
      );

      const encryptedToken = getEncryptedToken(user.id);
      const signedCookie = getSignedCookie(encryptedToken);

      jest
        .spyOn(pool, "query")
        .mockRejectedValue(new Error("unexpected database error"));

      const response = await request(app)
        .delete("/user/remove-account")
        .set("Cookie", signedCookie);

      expect(response.body).toHaveProperty(
        "message",
        "Error deleting all data user by userId"
      );
      expect(response.status).toBe(500);
    });
  });
});
