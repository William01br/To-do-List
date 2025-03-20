import listService from "../services/listService.js";

const createList = async (req, res) => {
  try {
    const userId = req.userId;

    const { listName } = req.body;
    if (!listName)
      return res.status(400).json({ message: "List name is required" });

    const result = await listService.createList(listName, userId);
    if (!result) {
      return res.status(500).json({ message: "List not created" });
    }

    return res.status(200).json({ data: result });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getAllLists = async (req, res) => {
  try {
    const userId = req.userId;
    const { nextUrl, previousUrl, limit, offset } = req.dataPagination;

    console.log("controler - limite/offset:", limit, offset);
    const result = await listService.getAllListsByUserId(userId, limit, offset);
    if (!result) {
      return res.status(404).json({ message: "user not found" });
    }

    return res.status(200).json({ nextUrl, previousUrl, data: result });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getListByListId = async (req, res) => {
  try {
    const listId = req.params.listId;
    const { nextUrl, previousUrl, limit, offset } = req.dataPagination;

    if (!listId)
      return res.status(400).json({ message: "list Id is required" });

    const result = await listService.getListByListId(listId, limit, offset);
    if (!result) return res.status(404).json({ message: "List not found" });

    return res.status(200).json({ nextUrl, previousUrl, data: result });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const updateList = async (req, res) => {
  try {
    const listId = req.params.listId;
    if (!listId)
      return res.status(400).json({ message: "List Id is required" });

    const { listName } = req.body;
    if (!listName)
      return res.status(400).json({ message: "Name list is required" });

    const userId = req.userId;

    const result = await listService.updateByListId(listId, userId, listName);
    if (!result)
      return res
        .status(404)
        .json({ message: "List not found. Nothing was updated" });

    return res.status(200).json({ message: "List updated sucessfuly" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const deleteList = async (req, res) => {
  try {
    const listId = req.params.listId;
    if (!listId)
      return res.status(400).json({ message: "List Id is required" });

    const userId = req.userId;

    const result = await listService.deleteListByListId(listId, userId);
    if (!result)
      return res
        .status(404)
        .json({ message: "List not found. Nothing was deleted" });

    return res.status(200).json({ message: "List deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export { createList, getAllLists, getListByListId, updateList, deleteList };
