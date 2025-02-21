import request from "supertest";
import jwt from "jsonwebtoken";

import { app } from "../../src/app.js";
import { pool } from "../../src/config/db.js";

describe("POST /user/register", () => {
  describe("when the data is valid", () => {
    "should create a new user and return status 200 and the user's data",
      async () => {
        const response = await request(app)
          .post("/user/register")
          .send({
            username: "William",
            email: "william123@gmail.com",
            password: "Test123example",
          });
      };
  });
});
