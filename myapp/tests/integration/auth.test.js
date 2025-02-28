import request from "supertest";

import "../../src/config/passport.js";
import app from "../../src/app.js";
import { pool } from "../../src/config/db.js";
import authService from "../../src/services/authService.js";

describe("POST /auth/login", () => {
  describe("when login is successful", () => {
    it("should return status 200 and the message 'Login successfully'", async () => {
      await request(app).post("/user/register").send({
        username: "william",
        email: "teste1@example.com",
        password: "passwordHash123",
      });

      const response = await request(app).post("/auth/login").send({
        email: "teste1@example.com",
        password: "passwordHash123",
      });

      expect(response.body).toHaveProperty("message", "Login successfully");
      expect(response.status).toBe(200);
    });
  });
  describe("when the e-mail or password is wrong", () => {
    it("should return status 401 and the message 'invalid credentials'", async () => {
      const response = await request(app).post("/auth/login").send({
        email: "invalid123@example.com",
        password: "teste123Example",
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Invalid credentials");
    });
  });
  describe("when the e-mail or password is not sent", () => {
    it("should return status 400 and the message 'email and password are required'", async () => {
      const response = await request(app).post("/auth/login").send({
        email: "invalid123@example.com",
        password: null,
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "email and password are required"
      );
    });
  });
  describe("when the tokens is not sent", () => {
    it("should return status 500 and message ''tokens not sent", async () => {
      jest.spyOn(authService, "getTokens").mockResolvedValue({
        accessToken: null,
        refreshToken: null,
      });
      await request(app).post("/user/register").send({
        username: "william",
        email: "teste@example.com",
        password: "passwordHash123",
      });

      const response = await request(app).post("/auth/login").send({
        email: "teste@example.com",
        password: "passwordHash123",
      });

      expect(response.body).toHaveProperty("message", "tokens not sent");
      expect(response.status).toBe(500);
    });
  });
  describe("when occurs any unexpected error", () => {
    it("should return status 500 and the error message", async () => {
      await request(app).post("/user/register").send({
        username: "william",
        email: "teste123@example.com",
        password: "passwordHash123",
      });

      jest
        .spyOn(pool, "query")
        .mockRejectedValue(new Error("unexpected database error"));

      const response = await request(app).post("/auth/login").send({
        email: "teste123@example.com",
        password: "passwordHash123",
      });

      expect(response.body).toHaveProperty("error");
      expect(response.status).toBe(500);
    });
  });
});

describe("POST /auth/refresh-token", () => {
  describe("when the refresh token is valid and sent correctly", () => {
    it("should return status 200 and the message 'acess Token recovered'", async () => {
      await request(app)
        .post("/user/register")
        .send({
          username: "william",
          email: "williamtest@example.com",
          password: "teste123Example",
        })
        .expect(200);

      const loginResponse = await request(app)
        .post("/auth/login")
        .send({
          email: "williamtest@example.com",
          password: "teste123Example",
        })
        .expect(200);

      const cookies = loginResponse.headers["set-cookie"];

      const response = await request(app)
        .post("/auth/refresh-token")
        .set("Cookie", cookies);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message", "acess Token recovered");
    });
  });
  describe("when the refresh token has expired or has not been sent", () => {
    it("should return status 401 and message 'refresh token not found or expired'", async () => {
      const response = await request(app).post("/auth/refresh-token");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty(
        "message",
        "refresh token not found or expired"
      );
    });
  });
  describe("when the access token is not created", () => {
    it("should return status 500 and message 'access token not created'", async () => {
      await request(app)
        .post("/user/register")
        .send({
          username: "william",
          email: "test001@example.com",
          password: "teste123Example",
        })
        .expect(200);

      const loginResponse = await request(app)
        .post("/auth/login")
        .send({
          email: "test001@example.com",
          password: "teste123Example",
        })
        .expect(200);

      const cookies = loginResponse.headers["set-cookie"];

      jest.spyOn(authService, "getAcessToken").mockResolvedValue(null);

      const response = await request(app)
        .post("/auth/refresh-token")
        .set("Cookie", cookies);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty(
        "message",
        "access token not created"
      );
    });
  });
  describe("when occurs any unexpected error", () => {
    it("should return status 500 and error message", async () => {
      await request(app)
        .post("/user/register")
        .send({
          username: "william",
          email: "test002@example.com",
          password: "teste123Example",
        })
        .expect(200);

      const loginResponse = await request(app)
        .post("/auth/login")
        .send({
          email: "test002@example.com",
          password: "teste123Example",
        })
        .expect(200);

      const cookies = loginResponse.headers["set-cookie"];

      jest
        .spyOn(pool, "query")
        .mockRejectedValue(new Error("unexpected database error"));

      const response = await request(app)
        .post("/auth/refresh-token")
        .set("Cookie", cookies);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error");
    });
  });
});

describe("OAuth with Passport (Google)", () => {
  describe("when login is successful", () => {
    it("should authenticate by callback, return user data and access a protected route", async () => {
      const callbackRes = await request(app).get("/auth/google/callback");

      expect(callbackRes.status).toBe(200);
      expect(callbackRes.body).toHaveProperty("user");

      const cookies = callbackRes.headers["set-cookie"];

      // use the cookies for access protected route
      const response = await request(app)
        .post("/auth/refresh-token")
        .set("Cookie", cookies);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message", "acess Token recovered");
    });
  });

  describe("when occurs any error", () => {
    it("should return status 500 and error message", async () => {
      jest
        .spyOn(pool, "query")
        .mockRejectedValue(new Error("unexpected database error"));

      const response = await request(app).get("/auth/google/callback");

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error");
    });
  });
});
