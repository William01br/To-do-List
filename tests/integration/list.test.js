import request from "supertest";
import jwt from "jsonwebtoken";
import signature from "cookie-signature";

import "../../src/config/passport.js";
import app from "../../src/app.js";
import listService from "../../src/services/listService.js";
import { pool } from "../../src/config/db.js";

const getSignedCookie = (token) => {
  const signedToken =
    "s:" + signature.sign(token, process.env.COOKIE_PARSER_SECRET); // `s:` indicates signed cookie

  // Create the cookie string manually (simulating an HTTP response cookie)
  return `acessToken=${signedToken}; Path=/; HttpOnly`;
};

describe("GET /lists/", () => {
  describe("when the lists are returned successfully", () => {
    it("should return status 200 and lists data", async () => {
      const login = await request(app).get("/auth/google/callback").expect(200);

      const cookies = login.headers["set-cookie"];

      const response = await request(app).get("/lists/").set("Cookie", cookies);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("data");
    });
  });
  describe("when the user is not found", () => {
    it("should return status 404 and message 'user not found'", async () => {
      const login = await request(app).get("/auth/google/callback").expect(200);

      const cookies = login.headers["set-cookie"];

      jest.spyOn(listService, "getAllListsByUserId").mockResolvedValue(null);

      const response = await request(app).get("/lists/").set("Cookie", cookies);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "user not found");
    });
  });
  describe("when occurs any unexpected error", () => {
    it("should return status 500 and error message", async () => {
      const login = await request(app).get("/auth/google/callback").expect(200);

      const cookies = login.headers["set-cookie"];

      jest.spyOn(pool, "query").mockRejectedValue(new Error("database error"));

      const response = await request(app).get("/lists/").set("Cookie", cookies);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("message");
    });
  });
  describe("when the user is not authenticated correctly", () => {
    describe("when the token is not found or expired", () => {
      it("should return status 401 and message 'Unauthorized'", async () => {
        await request(app).get("/auth/google/callback").expect(200);

        const response = await request(app).get("/lists/");

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty(
          "message",
          "Unauthorized: token not found or expired"
        );
      });
    });
    describe("when the signature of token is invalid", () => {
      it("should return status 403 and message 'Invalid signature'", async () => {
        const token = jwt.sign({ userId: 0 }, "keyInvalid", {
          expiresIn: "1h",
        });
        const cookieSigned = getSignedCookie(token);

        const response = await request(app)
          .get("/lists/")
          .set("Cookie", cookieSigned);

        expect(response.status).toBe(403);
        expect(response.body).toHaveProperty("message", "Invalid signature");
      });
    });
  });
});

describe("GET /lists/:listId", () => {
  describe("when the specific list is returned successfully", () => {
    it("should return status 200 and list data", async () => {
      const login = await request(app).get("/auth/google/callback").expect(200);

      const cookies = login.headers["set-cookie"];

      const lists = await request(app).get("/lists/").set("Cookie", cookies);
      const listId = lists.body.data[0].id;

      const response = await request(app)
        .get(`/lists/${listId}`)
        .set("Cookie", cookies);

      expect(response.body).toHaveProperty("data");
      expect(response.status).toBe(200);
    });
  });
  describe("when the list is not found", () => {
    it("should return status 404 and message 'List not found'", async () => {
      const login = await request(app).get("/auth/google/callback").expect(200);

      const cookies = login.headers["set-cookie"];

      const response = await request(app)
        .get(`/lists/${0}`)
        .set("Cookie", cookies);

      //   console.log("status:", response.status);
      //   console.log("body:", response.body);
      //   console.log("headers:", response.headers);

      expect(response.body).toHaveProperty("message", "List not found");
      expect(response.status).toBe(404);
    });
  });
  describe("when occurs any error", () => {
    it("should return status 500 and error message", async () => {
      const login = await request(app).get("/auth/google/callback").expect(200);

      const cookies = login.headers["set-cookie"];

      const listId = 1;

      jest.spyOn(pool, "query").mockRejectedValue(new Error("database error"));

      const response = await request(app)
        .get(`/lists/${listId}`)
        .set("Cookie", cookies);

      expect(response.body).toHaveProperty("message");
      expect(response.status).toBe(500);
    });
  });
  describe("when the user is not authenticated correctly", () => {
    describe("when the token is not found or expired", () => {
      it("should return status 401 and message 'Unauthorized'", async () => {
        const response = await request(app).get(`/lists/${0}`);

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty(
          "message",
          "Unauthorized: token not found or expired"
        );
      });
    });
    describe("when the signature of token is invalid", () => {
      it("should return status 403 and message 'Invalid signature'", async () => {
        const token = jwt.sign({ userId: 0 }, "keyInvalid", {
          expiresIn: "1h",
        });
        const cookieSigned = getSignedCookie(token);

        const response = await request(app)
          .get(`/lists/${0}`)
          .set("Cookie", cookieSigned);

        expect(response.status).toBe(403);
        expect(response.body).toHaveProperty("message", "Invalid signature");
      });
    });
  });
});

describe("POST /lists/create", () => {
  describe("when the list is created successfully", () => {
    it("should return status 200 and list data", async () => {
      const login = await request(app).get("/auth/google/callback").expect(200);

      const cookies = login.headers["set-cookie"];

      const response = await request(app)
        .post("/lists/create")
        .send({
          listName: "Books 2025",
        })
        .set("Cookie", cookies);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("data");
    });
  });
  describe("when the name list is not sent", () => {
    it("should return status 400 and message 'List name is required'", async () => {
      const login = await request(app).get("/auth/google/callback").expect(200);

      const cookies = login.headers["set-cookie"];

      const response = await request(app)
        .post("/lists/create")
        .send({
          listName: null,
        })
        .set("Cookie", cookies);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "List name is required");
    });
  });
  describe("when the list is not created", () => {
    it("should return status 500 and message 'List not created'", async () => {
      const login = await request(app).get("/auth/google/callback").expect(200);

      const cookies = login.headers["set-cookie"];

      jest.spyOn(listService, "createList").mockResolvedValue(null);

      const response = await request(app)
        .post("/lists/create")
        .send({
          listName: "Books",
        })
        .set("Cookie", cookies);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("message", "List not created");
    });
  });
  describe("when occurs any error", () => {
    it("should return status 500 and error message", async () => {
      const login = await request(app).get("/auth/google/callback").expect(200);

      const cookies = login.headers["set-cookie"];

      jest.spyOn(pool, "query").mockRejectedValue(new Error("database error"));

      const response = await request(app)
        .post("/lists/create")
        .send({
          listName: "Books",
        })
        .set("Cookie", cookies);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("message");
    });
  });
  describe("when the user is not authenticated correctly", () => {
    describe("when the token is not found or expired", () => {
      it("should return status 401 and message 'Unauthorized'", async () => {
        const response = await request(app)
          .post(`/lists/create`)
          .send({ listName: "Books" });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty(
          "message",
          "Unauthorized: token not found or expired"
        );
      });
    });
    describe("when the signature of token is invalid", () => {
      it("should return status 403 and message 'Invalid signature'", async () => {
        const token = jwt.sign({ userId: 0 }, "keyInvalid", {
          expiresIn: "1h",
        });
        const cookieSigned = getSignedCookie(token);

        const response = await request(app)
          .post(`/lists/create`)
          .send({ listName: "Books" })
          .set("Cookie", cookieSigned);

        expect(response.status).toBe(403);
        expect(response.body).toHaveProperty("message", "Invalid signature");
      });
    });
  });
});

describe("PATCH /lists/update/:listId", () => {
  describe("when the list is updated successfully", () => {
    it("should return status 200 and message 'List updated sucessfuly'", async () => {
      const login = await request(app).get("/auth/google/callback").expect(200);

      const cookies = login.headers["set-cookie"];

      const lists = await request(app).get("/lists/").set("Cookie", cookies);
      const listId = lists.body.data[0].id;

      const response = await request(app)
        .patch(`/lists/update/${listId}`)
        .send({
          listName: "Movies",
        })
        .set("Cookie", cookies);

      expect(response.body).toHaveProperty(
        "message",
        "List updated sucessfuly"
      );
      expect(response.status).toBe(200);
    });
  });
  describe("when the name list is not sent", () => {
    it("should return status 400 and message 'Name list is required'", async () => {
      const login = await request(app).get("/auth/google/callback").expect(200);

      const cookies = login.headers["set-cookie"];

      const lists = await request(app).get("/lists/").set("Cookie", cookies);
      const listId = lists.body.data[1].list_id;

      const response = await request(app)
        .patch(`/lists/update/${listId}`)
        .send({
          listName: null,
        })
        .set("Cookie", cookies);

      expect(response.body).toHaveProperty("message", "Name list is required");
      expect(response.status).toBe(400);
    });
  });
  describe("when the list is not found", () => {
    it("should return status 404 and message 'List not found. Nothing was updated'", async () => {
      const login = await request(app).get("/auth/google/callback").expect(200);

      const cookies = login.headers["set-cookie"];

      const response = await request(app)
        .patch(`/lists/update/${343}`)
        .send({
          listName: "TV Shows",
        })
        .set("Cookie", cookies);

      expect(response.body).toHaveProperty(
        "message",
        "List not found. Nothing was updated"
      );
      expect(response.status).toBe(404);
    });
  });
  describe("when occurs any error", () => {
    it("should return status 500 and error message", async () => {
      const login = await request(app).get("/auth/google/callback").expect(200);

      const cookies = login.headers["set-cookie"];

      const lists = await request(app).get("/lists/").set("Cookie", cookies);
      const listId = lists.body.data[1].list_id;

      jest.spyOn(pool, "query").mockRejectedValue(new Error("database error"));

      const response = await request(app)
        .patch(`/lists/update/${listId}`)
        .send({
          listName: "Mangás",
        })
        .set("Cookie", cookies);

      expect(response.body).toHaveProperty("message");
      expect(response.status).toBe(500);
    });
  });
  describe("when the user is not authenticated correctly", () => {
    describe("when the token is not found or expired", () => {
      it("should return status 401 and message 'Unauthorized'", async () => {
        const response = await request(app)
          .patch(`/lists/update/${0}`)
          .send({ listName: "Books" });

        expect(response.body).toHaveProperty(
          "message",
          "Unauthorized: token not found or expired"
        );
        expect(response.status).toBe(401);
      });
    });
    describe("when the signature of token is invalid", () => {
      it("should return status 403 and message 'Invalid signature'", async () => {
        const token = jwt.sign({ userId: 0 }, "keyInvalid", {
          expiresIn: "1h",
        });
        const cookieSigned = getSignedCookie(token);

        const response = await request(app)
          .patch(`/lists/update/${0}`)
          .send({ listName: "Books" })
          .set("Cookie", cookieSigned);

        expect(response.status).toBe(403);
        expect(response.body).toHaveProperty("message", "Invalid signature");
      });
    });
  });
});

describe("DELETE /lists/remove/:listId", () => {
  describe("when occurs any error", () => {
    it("should status 500 and error message", async () => {
      const login = await request(app).get("/auth/google/callback").expect(200);

      const cookies = login.headers["set-cookie"];

      const lists = await request(app).get("/lists/").set("Cookie", cookies);
      console.log(lists.body);
      const listId = lists.body.data[1].list_id;

      jest.spyOn(pool, "query").mockRejectedValue(new Error("database error"));

      const response = await request(app)
        .delete(`/lists/remove/${listId}`)
        .set("Cookie", cookies);

      expect(response.body).toHaveProperty("message");
      expect(response.status).toBe(500);
    });
  });
  describe("when the list is deleted successfully", () => {
    it("should return status 200 and message 'List deleted successfully'", async () => {
      const login = await request(app).get("/auth/google/callback").expect(200);

      const cookies = login.headers["set-cookie"];

      const lists = await request(app).get("/lists/").set("Cookie", cookies);
      const listId = lists.body.data[0].id;

      const response = await request(app)
        .delete(`/lists/remove/${listId}`)
        .set("Cookie", cookies);

      expect(response.body).toHaveProperty(
        "message",
        "List deleted successfully"
      );
      expect(response.status).toBe(200);
    });
  });
  describe("when the list is not found", () => {
    it("should return status 404 and message 'List not found. Nothing was deleted'", async () => {
      const login = await request(app).get("/auth/google/callback").expect(200);

      const cookies = login.headers["set-cookie"];

      const response = await request(app)
        .delete(`/lists/remove/${0}`)
        .set("Cookie", cookies);

      expect(response.body).toHaveProperty(
        "message",
        "List not found. Nothing was deleted"
      );
      expect(response.status).toBe(404);
    });
  });
  describe("when the user is not authenticated correctly", () => {
    describe("when the token is not found or expired", () => {
      it("should return status 401 and message 'Unauthorized'", async () => {
        const response = await request(app).delete(`/lists/remove/${0}`);

        expect(response.body).toHaveProperty(
          "message",
          "Unauthorized: token not found or expired"
        );
        expect(response.status).toBe(401);
      });
    });
    describe("when the signature of token is invalid", () => {
      it("should return status 403 and message 'Invalid signature'", async () => {
        const token = jwt.sign({ userId: 0 }, "keyInvalid", {
          expiresIn: "1h",
        });
        const cookieSigned = getSignedCookie(token);

        const response = await request(app)
          .delete(`/lists/remove/${0}`)
          .set("Cookie", cookieSigned);

        expect(response.status).toBe(403);
        expect(response.body).toHaveProperty("message", "Invalid signature");
      });
    });
  });
});
