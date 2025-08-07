import { pool } from "../../../src/config/db.js";
import taskService from "../../../src/services/taskService.js";
import taskRepository from "../../../src/repository/taskRepository.js";
import NotFoundErrorHttp from "../../../src/errors/NotFoundError.js";

jest.mock("../../../src/config/db.js", () => ({
  pool: {
    query: jest.fn(),
  },
}));

jest.mock("../../../src/repository/taskRepository.js", () => ({
  __esModule: true,
  default: {
    countTasksByListId: jest.fn(),
    getAllByListId: jest.fn(),
    create: jest.fn(),
    getByTaskId: jest.fn(),
    updateByTaskId: jest.fn(),
    deleteByTaskId: jest.fn(),
    setCompleted: jest.fn(),
  },
}));

describe("task service", () => {
  describe("get count task", () => {
    it("should count the amount of task in a list", async () => {
      taskRepository.countTasksByListId.mockResolvedValue({
        rows: [{ count: "1" }],
      });

      const result = await taskService.getCountTasksByListId(1);

      expect(result).toBe(1);
    });
  });
});

// describe("verify List exist", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it("should return true if the list exists", async () => {
//     pool.query.mockResolvedValue({ rows: [{ exists: true }] });

//     const result = await taskService.verifyListExist(1, 1);

//     expect(result).toBeTruthy();
//     expect(pool.query).toHaveBeenCalledTimes(1);
//     expect(pool.query).toHaveBeenCalledWith(
//       `SELECT EXISTS (SELECT 1 FROM lists WHERE id = $1 AND user_id = $2)`,
//       [1, 1]
//     );
//   });

//   it("should return false if the list does not exist", async () => {
//     pool.query.mockResolvedValueOnce({ rows: [{ exists: false }] });

//     const result = await taskService.verifyListExist(1, 1);

//     expect(result).toBeFalsy();
//     expect(pool.query).toHaveBeenCalledTimes(1);
//     expect(pool.query).toHaveBeenCalledWith(
//       `SELECT EXISTS (SELECT 1 FROM lists WHERE id = $1 AND user_id = $2)`,
//       [1, 1]
//     );
//   });

//   it("must be to throw an unexpected error occurs in database", async () => {
//     pool.query.mockRejectedValue(new Error("Unexpected database error"));

//     await expect(taskService.verifyListExist(1, 1)).rejects.toThrow(
//       "Unexpected database error"
//     );
//     expect(pool.query).toHaveBeenCalledTimes(1);
//     expect(pool.query).toHaveBeenCalledWith(
//       `SELECT EXISTS (SELECT 1 FROM lists WHERE id = $1 AND user_id = $2)`,
//       [1, 1]
//     );
//   });
// });

// describe("get all tasks by list Id", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it("should return all tasks", async () => {
//     const mockTasks = [
//       {
//         id: 2,
//         name_task: "Task 2",
//         comment: "Task 2 comment",
//         due_date: "2023-01-01",
//         completed: true,
//       },
//       {
//         id: 1,
//         name_task: "Task 1",
//         comment: "Task 1 comment",
//         due_date: "2022-12-31",
//         completed: false,
//       },
//     ];
//     pool.query.mockResolvedValueOnce({ rows: [{ exists: true }] });
//     pool.query.mockResolvedValueOnce({ rows: mockTasks });

//     const result = await taskService.getAllTasksByListId(1, 1, 10, 0);

//     expect(result).toBe(mockTasks);
//     expect(pool.query).toHaveBeenCalledTimes(2);
//     expect(pool.query).toHaveBeenNthCalledWith(
//       1,
//       "SELECT EXISTS (SELECT 1 FROM lists WHERE id = $1 AND user_id = $2)",
//       [1, 1]
//     );
//   });

//   it("should return null if the list not exists", async () => {
//     pool.query.mockResolvedValue({ rows: [{ exists: false }] });

//     const result = await taskService.getAllTasksByListId(1, 1);

//     expect(result).toBe(null);
//     expect(pool.query).toHaveBeenCalledTimes(1);
//   });

//   it("an error should be thrown if an unexpected event occurs in the database", async () => {
//     pool.query.mockResolvedValueOnce({ rows: [{ exists: true }] });
//     pool.query.mockRejectedValueOnce(new Error("database error"));

//     await expect(taskService.getAllTasksByListId(1, 1, 10, 0)).rejects.toThrow(
//       "Failed to get tasks by listId"
//     );
//     expect(pool.query).toHaveBeenCalledTimes(2);
//     expect(pool.query).toHaveBeenNthCalledWith(
//       1,
//       "SELECT EXISTS (SELECT 1 FROM lists WHERE id = $1 AND user_id = $2)",
//       [1, 1]
//     );
//   });
// });

// describe("create task", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it("should create a new task and return the task", async () => {
//     const mockTask = {
//       id: 1,
//       name_task: "Task 1",
//       comment: "Task 1 comment",
//       due_date: "2022-12-31",
//       completed: false,
//     };
//     pool.query.mockResolvedValueOnce({ rows: [{ exists: true }] });
//     pool.query.mockResolvedValueOnce({ rows: [mockTask] });

//     const result = await taskService.createTask(
//       "Task 1",
//       "Task 1 comment",
//       "2022-12-31",
//       1,
//       1
//     );

//     expect(result).toBe(mockTask);
//     expect(pool.query).toHaveBeenCalledTimes(2);
//     expect(pool.query).toHaveBeenCalledWith(
//       `INSERT INTO tasks (name_task, comment, due_date, list_id) VALUES ($1, $2, $3, $4) RETURNING *`,
//       ["Task 1", "Task 1 comment", "2022-12-31", 1]
//     );
//   });

//   it("should return null if the list not exists", async () => {
//     pool.query.mockResolvedValue({ rows: [{ exists: false }] });

//     const result = await taskService.createTask(1, 1);

//     expect(result).toBe(null);
//     expect(pool.query).toHaveBeenCalledTimes(1);
//   });

//   it("an error should be thrown if an unexpected event occurs in the database", async () => {
//     pool.query.mockResolvedValueOnce({ rows: [{ exists: true }] });
//     pool.query.mockRejectedValueOnce(new Error("database error"));

//     await expect(
//       taskService.createTask("Task 1", "Task 1 comment", "2022-12-31", 1, 1)
//     ).rejects.toThrow("Failed to create task");

//     expect(pool.query).toHaveBeenCalledTimes(2);
//     expect(pool.query).toHaveBeenCalledWith(
//       `INSERT INTO tasks (name_task, comment, due_date, list_id) VALUES ($1, $2, $3, $4) RETURNING *`,
//       ["Task 1", "Task 1 comment", "2022-12-31", 1]
//     );
//   });
// });

// describe("get task by id", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it("should return a task", async () => {
//     const mockTask = [
//       {
//         id: 1,
//         name_task: "Task 1",
//         comment: "Task 1 comment",
//         due_date: "2022-12-31",
//         completed: false,
//       },
//     ];
//     pool.query.mockResolvedValueOnce({ rows: [{ exists: true }] });
//     pool.query.mockResolvedValueOnce({ rows: mockTask });

//     const result = await taskService.getTaskByTaskId(1, 1);

//     expect(result).toBe(mockTask);
//     expect(pool.query).toHaveBeenCalledTimes(2);
//     expect(pool.query).toHaveBeenCalledWith(
//       `SELECT * FROM tasks WHERE list_id = $1 AND id = $2`,
//       [1, 1]
//     );
//   });

//   it("should return null if list not exists", async () => {
//     pool.query.mockResolvedValue({ rows: [{ exists: false }] });

//     const result = await taskService.getTaskByTaskId(1, 1);

//     expect(result).toBe(null);
//     expect(pool.query).toHaveBeenCalledTimes(1);
//   });

//   it("an error should be thrown if an unexpected event occurs in the database", async () => {
//     pool.query.mockResolvedValueOnce({ rows: [{ exists: true }] });
//     pool.query.mockRejectedValueOnce(new Error("database error"));

//     await expect(taskService.getTaskByTaskId(1, 1)).rejects.toThrow(
//       "Failed to get task by taskId"
//     );

//     expect(pool.query).toHaveBeenCalledTimes(2);
//     expect(pool.query).toHaveBeenCalledWith(
//       `SELECT * FROM tasks WHERE list_id = $1 AND id = $2`,
//       [1, 1]
//     );
//   });
// });

// describe("update task by id", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it("should update task and return the amount of rows affected", async () => {
//     pool.query.mockResolvedValueOnce({ rows: [{ exists: true }] });
//     pool.query.mockResolvedValueOnce({ rowCount: 1 });

//     const result = await taskService.updateTaskByTaskId(
//       1,
//       1,
//       "Updated Task 1",
//       "Updated Task 1 comment",
//       "2023-01-01",
//       false,
//       1
//     );

//     expect(result).toBe(1);
//     expect(pool.query).toHaveBeenCalledTimes(2);
//     expect(pool.query).toHaveBeenNthCalledWith(
//       1,
//       `SELECT EXISTS (SELECT 1 FROM lists WHERE id = $1 AND user_id = $2)`,
//       [1, 1]
//     );
//     expect(pool.query).toHaveBeenNthCalledWith(
//       2,
//       expect.stringContaining("UPDATE tasks"),
//       ["Updated Task 1", "Updated Task 1 comment", "2023-01-01", false, 1, 1]
//     );
//   });

//   it("shoul return null if the list not exists", async () => {
//     pool.query.mockResolvedValue({ rows: [{ exists: false }] });

//     const result = await taskService.updateTaskByTaskId(
//       1,
//       1,
//       "Updated Task 1",
//       "Updated Task 1 comment",
//       "2023-01-01",
//       false,
//       1
//     );

//     expect(result).toBe(null);
//     expect(pool.query).toHaveBeenCalledTimes(1);
//   });

//   it("an error should be thrown if an unexpected event occurs in the database", async () => {
//     pool.query.mockResolvedValueOnce({ rows: [{ exists: true }] });
//     pool.query.mockRejectedValueOnce(new Error("database error"));

//     await expect(
//       taskService.updateTaskByTaskId(
//         1,
//         1,
//         "Updated Task 1",
//         "Updated Task 1 comment",
//         "2023-01-01",
//         false,
//         1
//       )
//     ).rejects.toThrow("Failed to update task by taskId");

//     expect(pool.query).toHaveBeenCalledTimes(2);
//     expect(pool.query).toHaveBeenNthCalledWith(
//       2,
//       expect.stringContaining("UPDATE tasks"),
//       ["Updated Task 1", "Updated Task 1 comment", "2023-01-01", false, 1, 1]
//     );
//   });
// });

// describe("delete task by id", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it("should delete task and return the amount of rows affected", async () => {
//     pool.query.mockResolvedValueOnce({ rows: [{ exists: true }] });
//     pool.query.mockResolvedValueOnce({ rowCount: 1 });

//     const result = await taskService.deleteTaskByTaskId(1, 1);

//     expect(result).toBe(1);
//     expect(pool.query).toHaveBeenCalledTimes(2);
//     expect(pool.query).toHaveBeenNthCalledWith(
//       2,
//       `DELETE FROM tasks WHERE list_id = $1 AND id = $2`,
//       [1, 1]
//     );
//   });

//   it("should return null if the list not exists", async () => {
//     pool.query.mockResolvedValue({ rows: [{ exists: false }] });

//     const result = await taskService.deleteTaskByTaskId(1, 1);

//     expect(result).toBe(null);
//     expect(pool.query).toHaveBeenCalledTimes(1);
//   });

//   it("an error should be thrown if an unexpected event occurs in the database", async () => {
//     pool.query.mockResolvedValueOnce({ rows: [{ exists: true }] });
//     pool.query.mockRejectedValueOnce(new Error("database error"));

//     await expect(taskService.deleteTaskByTaskId(1, 1)).rejects.toThrow(
//       "Failed to delete task by taskId"
//     );

//     expect(pool.query).toHaveBeenCalledTimes(2);
//     expect(pool.query).toHaveBeenNthCalledWith(
//       2,
//       `DELETE FROM tasks WHERE list_id = $1 AND id = $2`,
//       [1, 1]
//     );
//   });
// });
