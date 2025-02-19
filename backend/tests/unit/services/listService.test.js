import { pool } from "../../../src/config/database.js";
import listService from "../../../src/services/listService.js";

jest.mock("../../../src/config/database.js", () => ({
  pool: {
    query: jest.fn(),
  },
}));

describe("create default list", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a default list", async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 1 });

    const result = await listService.createListDefault(1);

    expect(result).toBe(true);
    expect(pool.query).toHaveBeenCalledWith(
      `INSERT INTO lists (name_list, user_id, is_protected) VALUES ($1, $2, $3)`,
      ["Default List", 1, true]
    );
  });

  it("should return null if it does not create a default list", async () => {
    pool.query.mockResolvedValue({ rowCount: 0 });

    const result = await listService.createListDefault(1);

    expect(result).toBe(null);
    expect(pool.query).toHaveBeenCalledWith(
      `INSERT INTO lists (name_list, user_id, is_protected) VALUES ($1, $2, $3)`,
      ["Default List", 1, true]
    );
  });

  it("must be to throw an unexpected error occurs in database", async () => {
    pool.query.mockRejectedValueOnce(new Error("Unexpected database error"));

    await expect(listService.createListDefault(1)).rejects.toThrow(
      "Failed to create default list"
    );
    expect(pool.query).toHaveBeenCalledWith(
      `INSERT INTO lists (name_list, user_id, is_protected) VALUES ($1, $2, $3)`,
      ["Default List", 1, true]
    );
  });
});

describe("create list", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a list and return the data", async () => {
    const mockList = { id: 1, name_list: "New List", user_id: 1 };
    pool.query.mockResolvedValueOnce({
      rows: [mockList],
    });

    const result = await listService.createList("New List", 1);

    expect(result).toBe(mockList);
    expect(pool.query).toHaveBeenCalledWith(
      `INSERT INTO lists (name_list, user_id) VALUES ($1, $2) RETURNING *`,
      ["New List", 1]
    );
  });

  it("should return null if it does not create a list", async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const result = await listService.createList("New List", 1);

    expect(result).toBe(null);
    expect(pool.query).toHaveBeenCalledWith(
      `INSERT INTO lists (name_list, user_id) VALUES ($1, $2) RETURNING *`,
      ["New List", 1]
    );
  });

  it("must be to throw an unexpected error occurs in database", async () => {
    pool.query.mockRejectedValue(new Error("Unexpected database error"));

    await expect(listService.createList("New List", 1)).rejects.toThrow(
      "Failed to create list"
    );
    expect(pool.query).toHaveBeenCalledWith(
      `INSERT INTO lists (name_list, user_id) VALUES ($1, $2) RETURNING *`,
      ["New List", 1]
    );
  });
});

describe("get All Lists By UserId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return all data user", async () => {
    const mockList = {
      rows: [
        {
          id: 1,
          name_list: "Default List",
          tasks: [],
        },
        {
          id: 2,
          name_list: "List 1",
          tasks: [],
        },
      ],
    };

    pool.query.mockResolvedValue(mockList);

    const result = await listService.getAllListsByUserId(1);

    expect(result).toBe(mockList.rows);
  });

  it("should return null if user is not found", async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const result = await listService.getAllListsByUserId(1);
    expect(result).toBe(null);
  });

  it("must be to throw an unexpected error occurs in database", () => {
    pool.query.mockRejectedValue(new Error("Unexpected database error"));

    expect(listService.getAllListsByUserId(1)).rejects.toThrow(
      "Failed to get all lists by userId"
    );
  });
});

describe("get List by listId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return the list data", async () => {
    const mockList = {
      id: 1,
      name_list: "Default List",
      tasks: [],
    };
    pool.query.mockResolvedValue({
      rows: [mockList],
    });

    const result = await listService.getListByListId(1);

    expect(result).toBe(mockList);
  });

  it("should return null if the list is empty", async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const result = await listService.getListByListId(1);

    expect(result).toBe(null);
  });

  it("must be to throw an unexpected error occurs in database", () => {
    pool.query.mockRejectedValue(new Error("Unexpected database error"));

    expect(listService.getListByListId(1)).rejects.toThrow(
      "Failed to get list by listId"
    );
  });
});

describe("updated list by listId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update the list", async () => {
    pool.query.mockResolvedValue({ rowCount: 1 });

    const result = await listService.updateByListId(1, 1, "games");

    expect(result).toBe(true);
    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining(
        "UPDATE lists SET name_list = $1 WHERE id = $2 AND user_id = $3 AND is_protected = $4"
      ),
      ["games", 1, 1, false]
    );
  });

  it("should return null if no rows are affected", async () => {
    pool.query.mockResolvedValue({ rowCount: 0 });

    const result = await listService.updateByListId(1, 1, "games");

    expect(result).toBe(null);
    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining(
        "UPDATE lists SET name_list = $1 WHERE id = $2 AND user_id = $3 AND is_protected = $4"
      ),
      ["games", 1, 1, false]
    );
  });

  it("must be to throw an unexpected error occurs in database", () => {
    pool.query.mockRejectedValue(new Error("Unexpected database error"));

    expect(listService.updateByListId(1, 1, "games")).rejects.toThrow(
      "Failed to update list by listId"
    );
  });
});

describe("delete list by listId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should delete the list", async () => {
    pool.query.mockResolvedValue({ rowCount: 1 });

    const result = await listService.deleteListByListId(1, 1);

    expect(result).toBe(true);
    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining(
        "DELETE FROM lists WHERE id = $1 AND user_id = $2 AND is_protected = $3"
      ),
      [1, 1, false]
    );
  });

  it("should return null if no rows are affected", async () => {
    pool.query.mockResolvedValue({ rowCount: 0 });

    const result = await listService.deleteListByListId(1, 1);

    expect(result).toBe(null);
    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining(
        "DELETE FROM lists WHERE id = $1 AND user_id = $2 AND is_protected = $3"
      ),
      [1, 1, false]
    );
  });

  it("must be to throw an unexpected error occurs in database", () => {
    pool.query.mockRejectedValue(new Error("Unexpected database error"));

    expect(listService.deleteListByListId(1, 1)).rejects.toThrow(
      "Failed to delete list by listId"
    );
  });
});
