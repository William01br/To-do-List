import request from "supertest";
import jwt from "jsonwebtoken";
import signature from "cookie-signature";

import app from "../../src/app.js";
import taskService from "../../src/services/taskService.js";
import { pool } from "../../src/config/db.js";

const getSignedCookie = (token) => {
  const signedToken =
    "s:" + signature.sign(token, process.env.COOKIE_PARSER_SECRET); // `s:` indicates signed cookie

  // Create the cookie string manually (simulating an HTTP response cookie)
  return `acessToken=${signedToken}; Path=/; HttpOnly`;
};

describe("GET /lists/:listId/tasks", () => {
  describe("when user tasks are returned successfully", () => {
    describe("when the list has no tasks", () => {
      it("should return status 200 and message 'There are no tasks'", async () => {
        const login = await request(app)
          .get("/auth/google/callback")
          .expect(200);

        const cookies = login.headers["set-cookie"];

        const listId = login.body.user.lists[0].list_id;

        const response = await request(app)
          .get(`/lists/${listId}/tasks`)
          .set("Cookie", cookies);

        expect(response.body).toHaveProperty("message", "There are no tasks");
        expect(response.status).toBe(200);
      });
    });
    describe("when the list has tasks", () => {
      it("should return status 200 and the data", async () => {
        const login = await request(app)
          .get("/auth/google/callback")
          .expect(200);

        const cookies = login.headers["set-cookie"];

        const listId = login.body.user.lists[0].list_id;

        await request(app)
          .post(`/lists/${listId}/tasks`)
          .send({
            nameTask: "read Dune",
            comment: "read the first book",
            dueDate: "2025-03-10T12:00:00Z",
          })
          .set("Cookie", cookies);

        const response = await request(app)
          .get(`/lists/${listId}/tasks`)
          .set("Cookie", cookies);

        expect(response.body).toHaveProperty("data");
        expect(response.status).toBe(200);
      });
    });
  });
  describe("when the list is not found", () => {
    it("should return status 404 and message 'List not found'", async () => {
      const login = await request(app).get("/auth/google/callback").expect(200);

      const cookies = login.headers["set-cookie"];

      const response = await request(app)
        .get(`/lists/${0}/tasks`)
        .set("Cookie", cookies);

      expect(response.body).toHaveProperty("message", "List not found");
      expect(response.status).toBe(404);
    });
  });
  describe("when occurs any erro", () => {
    it("should return status 500 and error message", async () => {
      const login = await request(app).get("/auth/google/callback").expect(200);

      const cookies = login.headers["set-cookie"];

      const listId = login.body.user.lists[0].list_id;

      jest.spyOn(pool, "query").mockRejectedValue(new Error("database error"));

      const response = await request(app)
        .get(`/lists/${listId}/tasks`)
        .set("Cookie", cookies);

      expect(response.body).toHaveProperty("message");
      expect(response.status).toBe(500);
    });
  });
  describe("when the user is not authenticated correctly", () => {
    describe("when the token is not found or expired", () => {
      it("should return status 401 and message 'Unauthorized'", async () => {
        const response = await request(app).get(`/lists/${0}/tasks`);

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
          .get(`/lists/${0}/tasks`)
          .set("Cookie", cookieSigned);

        expect(response.status).toBe(403);
        expect(response.body).toHaveProperty("message", "Invalid signature");
      });
    });
  });
});

describe("GET /lists/:listId/tasks/:taskId", () => {
  describe("when the task is successfully returned", () => {
    it("should return status 200 and the data", async () => {
      const login = await request(app).get("/auth/google/callback").expect(200);

      const cookies = login.headers["set-cookie"];

      const listId = login.body.user.lists[0].list_id;
      const taskId = login.body.user.lists[0].tasks[0].task_id;
      console.log("listId:", listId, "\nTaskId:", taskId);

      const response = await request(app)
        .get(`/lists/${listId}/tasks/${taskId}`)
        .set("Cookie", cookies);

      expect(response.body).toHaveProperty("data");
      expect(response.status).toBe(200);
    });
  });
  describe("when the list is not found", () => {
    it("should status 404 and message 'List not found'", async () => {
      const login = await request(app).get("/auth/google/callback").expect(200);

      const cookies = login.headers["set-cookie"];

      const taskId = login.body.user.lists[0].tasks[0].task_id;

      const response = await request(app)
        .get(`/lists/${0}/tasks/${taskId}`)
        .set("Cookie", cookies);

      expect(response.body).toHaveProperty("message", "List not found");
      expect(response.status).toBe(404);
    });
  });
  describe("when the task is not found", () => {
    it("should return status 404 and message 'Task not found'", async () => {
      const login = await request(app).get("/auth/google/callback").expect(200);

      const cookies = login.headers["set-cookie"];

      const listId = login.body.user.lists[0].list_id;
      const taskId = login.body.user.lists[0].tasks[0].task_id;
      console.log("listId:", listId, "\nTaskId:", taskId);

      const response = await request(app)
        .get(`/lists/${listId}/tasks/${0}`)
        .set("Cookie", cookies);

      expect(response.body).toHaveProperty("message", "Task not found");
      expect(response.status).toBe(404);
    });
  });
  describe("when occurs any error", () => {
    it("should return status 500 and error message", async () => {
      const login = await request(app).get("/auth/google/callback").expect(200);

      const cookies = login.headers["set-cookie"];

      const listId = login.body.user.lists[0].list_id;
      const taskId = login.body.user.lists[0].tasks[0].task_id;

      jest.spyOn(pool, "query").mockRejectedValue(new Error("database error"));

      const response = await request(app)
        .get(`/lists/${listId}/tasks/${taskId}`)
        .set("Cookie", cookies);

      expect(response.body).toHaveProperty("message");
      expect(response.status).toBe(500);
    });
  });
  describe("when the user is not authenticated correctly", () => {
    describe("when the token is not found or expired", () => {
      it("should return status 401 and message 'Unauthorized'", async () => {
        const response = await request(app).get(`/lists/${0}/tasks/${0}`);

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
          .get(`/lists/${0}/tasks/${0}`)
          .set("Cookie", cookieSigned);

        expect(response.status).toBe(403);
        expect(response.body).toHaveProperty("message", "Invalid signature");
      });
    });
  });
});

describe("POST /lists/:listId/tasks", () => {
  describe("when the task is created successfully", () => {
    it("should return status 200 and the task", async () => {
      const login = await request(app).get("/auth/google/callback").expect(200);

      const cookies = login.headers["set-cookie"];

      const listId = login.body.user.lists[0].list_id;

      const response = await request(app)
        .post(`/lists/${listId}/tasks`)
        .send({
          nameTask: "read Dostoievsky",
          comment: "read 'Crime and Punishment'",
          dueDate: "2025-03-10T12:00:00Z",
        })
        .set("Cookie", cookies);

      expect(response.body).toHaveProperty("data");
      expect(response.status).toBe(200);
    });
  });
  describe("when the task has no data or partial data", () => {
    it("should return status 400 and message 'All fields are required'", async () => {
      const login = await request(app).get("/auth/google/callback").expect(200);

      const cookies = login.headers["set-cookie"];

      const listId = login.body.user.lists[0].list_id;

      const response = await request(app)
        .post(`/lists/${listId}/tasks`)
        .send({
          nameTask: null,
          comment: "read 'Crime and Punishment'",
          dueDate: null,
        })
        .set("Cookie", cookies);

      expect(response.body).toHaveProperty(
        "message",
        "All fields are required"
      );
      expect(response.status).toBe(400);
    });
  });
  describe("when the list not exist", () => {
    it("should return status 404 and message 'List not found'", async () => {
      const login = await request(app).get("/auth/google/callback").expect(200);

      const cookies = login.headers["set-cookie"];

      const response = await request(app)
        .post(`/lists/${0}/tasks`)
        .send({
          nameTask: "read",
          comment: "Crime and Punishment",
          dueDate: "2025-03-10T12:00:00Z",
        })
        .set("Cookie", cookies);

      expect(response.body).toHaveProperty("message", "List not found");
      expect(response.status).toBe(404);
    });
  });
  describe("when the occurs any error", () => {
    it("should return status 500 and error message", async () => {
      const login = await request(app).get("/auth/google/callback").expect(200);

      const cookies = login.headers["set-cookie"];

      const listId = login.body.user.lists[0].list_id;

      jest.spyOn(pool, "query").mockRejectedValue(new Error("database error"));

      const response = await request(app)
        .post(`/lists/${listId}/tasks`)
        .send({
          nameTask: "read Dostoievsky",
          comment: "read 'Crime and Punishment'",
          dueDate: "2025-03-10T12:00:00Z",
        })
        .set("Cookie", cookies);

      expect(response.body).toHaveProperty("message");
      expect(response.status).toBe(500);
    });
  });
  describe("when the user is not authenticated correctly", () => {
    describe("when the token is not found or expired", () => {
      it("should return status 401 and message 'Unauthorized'", async () => {
        const response = await request(app).post(`/lists/${0}/tasks`);

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
          .post(`/lists/${0}/tasks`)
          .set("Cookie", cookieSigned);

        expect(response.status).toBe(403);
        expect(response.body).toHaveProperty("message", "Invalid signature");
      });
    });
  });
});

describe("PATCH /lists/:listId/tasks/:taskId", () => {
  describe("when the task is updated successfully", () => {
    it("shoud return status 200 and the message 'Task updated successfully'", async () => {
      const login = await request(app).get("/auth/google/callback").expect(200);

      const cookies = login.headers["set-cookie"];

      const listId = login.body.user.lists[0].list_id;
      const taskId = login.body.user.lists[0].tasks[0].task_id;

      const response = await request(app)
        .patch(`/lists/${listId}/tasks/${taskId}`)
        .send({
          nameTask: "",
          comment: "",
          dueDate: "",
          completed: true,
        })
        .set("Cookie", cookies);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "message",
        "Task updated successfully"
      );
    });
  });
  describe("when no data is sent in the request", () => {
    it("should return status 400 and the message 'Is required update one field, at least'", async () => {
      const login = await request(app).get("/auth/google/callback").expect(200);

      const cookies = login.headers["set-cookie"];

      const listId = login.body.user.lists[0].list_id;
      const taskId = login.body.user.lists[0].tasks[0].task_id;

      const response = await request(app)
        .patch(`/lists/${listId}/tasks/${taskId}`)
        .send({
          nameTask: "",
          comment: "",
          dueDate: "",
          completed: null,
        })
        .set("Cookie", cookies);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "Is required update one field, at least"
      );
    });
  });
  describe("when the list is not found", () => {
    it("should return status 404 and the message 'List not found'", async () => {
      const login = await request(app).get("/auth/google/callback").expect(200);

      const cookies = login.headers["set-cookie"];

      const taskId = login.body.user.lists[0].tasks[0].task_id;

      const response = await request(app)
        .patch(`/lists/${0}/tasks/${taskId}`)
        .send({
          nameTask: "",
          comment: "",
          dueDate: "",
          completed: true,
        })
        .set("Cookie", cookies);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "List not found");
    });
  });
  describe("when the task is not found", () => {
    it("should return status 404 and message 'Task not found'", async () => {
      const login = await request(app).get("/auth/google/callback").expect(200);

      const cookies = login.headers["set-cookie"];

      const listId = login.body.user.lists[0].list_id;

      const response = await request(app)
        .patch(`/lists/${listId}/tasks/${0}`)
        .send({
          nameTask: "",
          comment: "",
          dueDate: "",
          completed: true,
        })
        .set("Cookie", cookies);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Task not found");
    });
  });
  describe("when occurs any error", () => {
    it("should return status 500 and error message", async () => {
      const login = await request(app).get("/auth/google/callback").expect(200);

      const cookies = login.headers["set-cookie"];

      const listId = login.body.user.lists[0].list_id;
      const taskId = login.body.user.lists[0].tasks[0].task_id;

      jest.spyOn(pool, "query").mockRejectedValue(new Error("database error"));

      const response = await request(app)
        .patch(`/lists/${listId}/tasks/${taskId}`)
        .send({
          nameTask: "",
          comment: "",
          dueDate: "",
          completed: true,
        })
        .set("Cookie", cookies);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("message");
    });
  });
  describe("when the user is not authenticated correctly", () => {
    describe("when the token is not found or expired", () => {
      it("should return status 401 and message 'Unauthorized'", async () => {
        const response = await request(app).patch(`/lists/${0}/tasks/${0}`);

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
          .patch(`/lists/${0}/tasks/${0}`)
          .set("Cookie", cookieSigned);

        expect(response.status).toBe(403);
        expect(response.body).toHaveProperty("message", "Invalid signature");
      });
    });
  });
});

describe("DELETE /lists/:listId/tasks/:taskId", () => {
  describe("when the task is deleted successfully", () => {
    it("should return status 200 and message 'Task deleted successfully'", async () => {
      const login = await request(app).get("/auth/google/callback").expect(200);

      const cookies = login.headers["set-cookie"];

      const listId = login.body.user.lists[0].list_id;
      const taskId = login.body.user.lists[0].tasks[0].task_id;

      const response = await request(app)
        .delete(`/lists/${listId}/tasks/${taskId}`)
        .set("Cookie", cookies);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "message",
        "Task deleted successfully"
      );
    });
  });
  describe("when the list is not found", () => {
    it("should return status 404 and message 'List not found'", async () => {
      const login = await request(app).get("/auth/google/callback").expect(200);

      const cookies = login.headers["set-cookie"];

      const taskId = login.body.user.lists[0].tasks[0].task_id;

      const response = await request(app)
        .delete(`/lists/${0}/tasks/${taskId}`)
        .set("Cookie", cookies);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "List not found");
    });
  });
  describe("when the task is not found", () => {
    it("should return status 404 and message 'Task not found. Nothing was deleted'", async () => {
      const login = await request(app).get("/auth/google/callback").expect(200);

      const cookies = login.headers["set-cookie"];

      const listId = login.body.user.lists[0].list_id;

      const response = await request(app)
        .delete(`/lists/${listId}/tasks/${0}`)
        .set("Cookie", cookies);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty(
        "message",
        "Task not found. Nothing was deleted"
      );
    });
  });
  describe("when occurs any error", () => {
    it("should return status 500 and error message", async () => {
      const login = await request(app).get("/auth/google/callback").expect(200);

      const cookies = login.headers["set-cookie"];

      const listId = login.body.user.lists[0].list_id;
      const taskId = login.body.user.lists[0].tasks[0].task_id;

      jest.spyOn(pool, "query").mockRejectedValue(new Error("database error"));

      const response = await request(app)
        .delete(`/lists/${listId}/tasks/${taskId}`)
        .set("Cookie", cookies);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("message");
    });
  });
  describe("when the user is not authenticated correctly", () => {
    describe("when the token is not found or expired", () => {
      it("should return status 401 and message 'Unauthorized'", async () => {
        const response = await request(app).delete(`/lists/${0}/tasks/${0}`);

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
          .delete(`/lists/${0}/tasks/${0}`)
          .set("Cookie", cookieSigned);

        expect(response.status).toBe(403);
        expect(response.body).toHaveProperty("message", "Invalid signature");
      });
    });
  });
});
