import listService from "../../../src/services/listService.js";
import listRepository from "../../../src/repository/listRepository.js";
import InternalErrorHttp from "../../../src/errors/InternalError.js";
import NotFoundErrorHttp from "../../../src/errors/NotFoundError.js";

jest.mock("../../../src/config/db.js", () => ({
  pool: {
    query: jest.fn(),
  },
}));

jest.mock("../../../src/repository/listRepository.js", () => ({
  __esModule: true,
  default: {
    countByUserId: jest.fn(),
    createList: jest.fn(),
    getAllByUserId: jest.fn(),
    getListByListId: jest.fn(),
    updateByListId: jest.fn(),
    deleteByListId: jest.fn(),
    listExists: jest.fn(),
  },
}));

const mockList = {
  title: "test",
};

describe("list service", () => {
  describe("get count lists", () => {
    it("should count the amount of lists", async () => {
      listRepository.countByUserId.mockResolvedValue({
        rows: [{ count: "1" }],
      });

      const result = await listService.getCountListsByUserId(1);

      expect(result).toBe(1);
    });
  });
  describe("create a list", () => {
    it("should propagate InternalErrorHttp when the default list is not created", async () => {
      listRepository.createList.mockResolvedValue({ rowCount: 0 });

      await expect(listService.createListDefault(1)).rejects.toBeInstanceOf(
        InternalErrorHttp
      );
    });
    it("should create a default list successfully", async () => {
      listRepository.createList.mockResolvedValue({ rowCount: 1 });

      await expect(listService.createListDefault(1)).resolves.toBeUndefined();
      expect(listRepository.createList).toHaveBeenCalledWith(
        "Default list",
        1,
        true
      );
    });
    it("should propagate InternalErrorHttp when the list is not created", async () => {
      listRepository.createList.mockResolvedValue({ rows: [] });

      await expect(listService.createList(1)).rejects.toBeInstanceOf(
        InternalErrorHttp
      );
    });
    it("should create a list successfully", async () => {
      listRepository.createList.mockResolvedValue({ rows: [mockList] });

      const result = await listService.createList("test", 1);

      expect(result).toBe(mockList);
      expect(listRepository.createList).toHaveBeenCalledWith("test", 1);
    });
  });
  describe("get all lists", () => {
    it("should propagate NotFoundErrorHttp when the user is not found", async () => {
      listRepository.getAllByUserId.mockResolvedValue({ rows: [] });

      await expect(
        listService.getAllListsByUserId(1, 10, 0)
      ).rejects.toBeInstanceOf(NotFoundErrorHttp);
    });
    it("should return all lists of user", async () => {
      listRepository.getAllByUserId.mockResolvedValue({ rows: [mockList] });

      const result = await listService.getAllListsByUserId(1, 10, 0);

      expect(result).toStrictEqual([mockList]);
      expect(listRepository.getAllByUserId).toHaveBeenCalledWith(1, 10, 0);
    });
  });
  describe("get list", () => {
    it("should propagate NotFoundErrorHttp when the list is not found", async () => {
      listRepository.getListByListId.mockResolvedValue({ rows: [] });

      await expect(
        listService.getListByListId(1, 10, 0)
      ).rejects.toBeInstanceOf(NotFoundErrorHttp);
    });
    it("should return the list of user", async () => {
      listRepository.getListByListId.mockResolvedValue({ rows: [mockList] });

      const result = await listService.getListByListId(1, 10, 0);

      expect(result).toBe(mockList);
      expect(listRepository.getListByListId).toHaveBeenCalledWith(1, 10, 0);
    });
  });
  describe("update list", () => {
    it("should propagate NotFoundError when the list is not found", async () => {
      listRepository.updateByListId.mockResolvedValue({ rowCount: 0 });

      await expect(
        listService.updateByListId(1, 1, "test two")
      ).rejects.toBeInstanceOf(NotFoundErrorHttp);
    });
    it("should update the list successfully and return the list", async () => {
      listRepository.updateByListId.mockResolvedValue({
        rows: [{ title: "test two" }],
      });

      const result = await listService.updateByListId(1, 1, "test two");

      expect(result).toStrictEqual({ title: "test two" });
      expect(listRepository.updateByListId).toHaveBeenCalledWith(
        1,
        1,
        "test two"
      );
    });
  });
  describe("delete list", () => {
    it("should propagate error message when throws any unexpected error", async () => {
      listRepository.deleteByListId.mockRejectedValue(
        new Error("Internal server error")
      );

      await expect(listService.deleteListByListId(1, 1)).rejects.toThrow(
        "Internal server error"
      );
    });
  });
});
