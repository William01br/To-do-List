import { pool } from "../../../src/config/db.js";
import taskService from "../../../src/services/taskService.js";
import taskRepository from "../../../src/repository/taskRepository.js";
import NotFoundErrorHttp from "../../../src/errors/NotFoundError.js";
import listRepository from "../../../src/repository/listRepository.js";
import { mockUser } from "passport-mock-strategy";

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

jest.mock("../../../src/repository/listRepository.js", () => ({
  __esModule: true,
  default: {
    listExists: jest.fn(),
  },
}));

const taskMock = {
  id: 1,
  nameTask: "test",
  comment: "testing",
  dueDate: "2025-08-06T10:00:00Z",
  completed: false,
  listId: 1,
  createAt: "2025-04-06T10:00:00Z",
};

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
  describe("get all tasks", () => {
    it("should propagate error NotFoundErrorHttp when the list is not found", async () => {
      listRepository.listExists.mockResolvedValue({
        rows: [{ exists: false }],
      });

      await expect(
        taskService.getAllTasksByListId(1, 1, 10, 0)
      ).rejects.toBeInstanceOf(NotFoundErrorHttp);
    });
    it("should propagate error NotFoundErrorhttp when there is no tasks", async () => {
      listRepository.listExists.mockResolvedValue({
        rows: [{ exists: true }],
      });
      taskRepository.getAllByListId.mockResolvedValue({ rows: [] });

      await expect(
        taskService.getAllTasksByListId(1, 1, 10, 0)
      ).rejects.toBeInstanceOf(NotFoundErrorHttp);
    });
    it("should return all tasks successfully", async () => {
      listRepository.listExists.mockResolvedValue({
        rows: [{ exists: true }],
      });
      taskRepository.getAllByListId.mockResolvedValue({ rows: [taskMock] });

      const result = await taskService.getAllTasksByListId(1, 1, 10, 0);

      expect(result).toStrictEqual([taskMock]);
      expect(taskRepository.getAllByListId).toHaveBeenCalledWith(1, 10, 0);
    });
  });
  describe("create task", () => {
    it("should propagate error NotFoundErrorHttp when the list is not found", async () => {
      listRepository.listExists.mockResolvedValue({
        rows: [{ exists: false }],
      });

      await expect(taskService.createTask(1, 1, 10, 0)).rejects.toBeInstanceOf(
        NotFoundErrorHttp
      );
    });
    it("should create and return the list successfully", async () => {
      listRepository.listExists.mockResolvedValue({
        rows: [{ exists: true }],
      });
      taskRepository.create.mockResolvedValue({ rows: [taskMock] });

      const result = await taskService.createTask(
        taskMock.nameTask,
        taskMock.comment,
        taskMock.dueDate,
        taskMock.listId,
        1
      );

      expect(result).toBe(taskMock);
      expect(taskRepository.create).toHaveBeenCalledWith(
        taskMock.nameTask,
        taskMock.comment,
        taskMock.dueDate,
        taskMock.listId
      );
    });
  });
  describe("get task", () => {
    it("should propagate error NotFoundErrorHttp when the list is not found", async () => {
      listRepository.listExists.mockResolvedValue({
        rows: [{ exists: false }],
      });

      await expect(taskService.getTaskByTaskId(1, 1, 1)).rejects.toBeInstanceOf(
        NotFoundErrorHttp
      );
    });
    it("should propagate NotFoundErrorHttp when the task not exist", async () => {
      listRepository.listExists.mockResolvedValue({
        rows: [{ exists: true }],
      });
      taskRepository.getByTaskId.mockResolvedValue({ rows: [] });

      await expect(taskService.getTaskByTaskId(1, 1, 1)).rejects.toBeInstanceOf(
        NotFoundErrorHttp
      );
    });
    it("should return the task successfully", async () => {
      listRepository.listExists.mockResolvedValue({
        rows: [{ exists: true }],
      });
      taskRepository.getByTaskId.mockResolvedValue({ rows: [taskMock] });

      const result = await taskService.getTaskByTaskId(1, 1, 1);

      expect(result).toBe(taskMock);
      expect(taskRepository.getByTaskId).toHaveBeenCalledWith(1, 1);
    });
  });
  describe("update task", () => {
    it("should propagate error NotFoundErrorHttp when the list is not found", async () => {
      listRepository.listExists.mockResolvedValue({
        rows: [{ exists: false }],
      });

      await expect(
        taskService.updateTaskByTaskId(1, 1, 1)
      ).rejects.toBeInstanceOf(NotFoundErrorHttp);
    });
    it("should propagate NotFoundErrorHttp when the task not exist", async () => {
      listRepository.listExists.mockResolvedValue({
        rows: [{ exists: true }],
      });
      taskRepository.updateByTaskId.mockResolvedValue({ rows: [] });

      await expect(
        taskService.updateTaskByTaskId(
          taskMock.listId,
          taskMock.id,
          taskMock.nameTask,
          taskMock.comment,
          taskMock.dueDate,
          1
        )
      ).rejects.toBeInstanceOf(NotFoundErrorHttp);
    });
    it("should update and return the task successfully", async () => {
      listRepository.listExists.mockResolvedValue({
        rows: [{ exists: true }],
      });
      taskRepository.updateByTaskId.mockResolvedValue({ rows: [taskMock] });

      const result = await taskService.updateTaskByTaskId(
        taskMock.listId,
        taskMock.id,
        taskMock.nameTask,
        taskMock.comment,
        taskMock.dueDate,
        1
      );

      expect(result).toBe(taskMock);
      expect(taskRepository.updateByTaskId).toHaveBeenCalledWith(
        1,
        taskMock.listId,
        taskMock.nameTask,
        taskMock.comment,
        taskMock.dueDate
      );
    });
  });
  describe("delete task", () => {
    it("should propagate error NotFoundErrorHttp when the list is not found", async () => {
      listRepository.listExists.mockResolvedValue({
        rows: [{ exists: false }],
      });

      await expect(
        taskService.deleteTaskByTaskId(1, 1, 1)
      ).rejects.toBeInstanceOf(NotFoundErrorHttp);
    });
    it("should propagate error message when throws any unexpected error", async () => {
      listRepository.listExists.mockRejectedValue(
        new Error("Internal server error")
      );

      await expect(taskService.deleteTaskByTaskId(1, 1, 1)).rejects.toThrow(
        "Internal server error"
      );
    });
  });
  describe("set task like completed", () => {
    it("should propagate error NotFoundErrorHttp when the list is not found", async () => {
      listRepository.listExists.mockResolvedValue({
        rows: [{ exists: false }],
      });

      await expect(
        taskService.setTaskCompleted(1, 1, 1, true)
      ).rejects.toBeInstanceOf(NotFoundErrorHttp);
    });
    it("should propagate NotFoundErrorHttp whe the task is not found", async () => {
      listRepository.listExists.mockResolvedValue({
        rows: [{ exists: true }],
      });
      taskRepository.setCompleted.mockResolvedValue({
        rowCount: 0,
      });

      await expect(
        taskService.setTaskCompleted(1, 1, 1, true)
      ).rejects.toBeInstanceOf(NotFoundErrorHttp);
    });
    it("should mark the task like completed and return the task successfully", async () => {
      listRepository.listExists.mockResolvedValue({
        rows: [{ exists: true }],
      });
      taskRepository.setCompleted.mockResolvedValue({
        rowCount: 1,
        rows: [taskMock],
      });

      const result = await taskService.setTaskCompleted(1, 1, 1, true);

      expect(result).toBe(taskMock);
      expect(taskRepository.setCompleted).toHaveBeenCalledWith(1, 1, true);
    });
  });
});
