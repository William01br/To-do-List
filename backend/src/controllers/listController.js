import listService from "../services/listService.js";

const createList = async (req, res) => {
  try {
    const userId = req.userId;

    const { listName } = req.body;
    console.log(listName);
    if (!listName)
      return res.status(400).json({ message: "List name is required" });

    const result = await listService.createList(listName, userId);
    if (!result) {
      return res.status(500).json({ message: "Internal Server Error" });
    }

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getAllLists = async (req, res) => {
  try {
    const userId = req.userId;

    const result = await listService.getAllListsByUserId(userId);
    if (!result) {
      return res.status(500).json({ message: "Internal Server Error" });
    }

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export { createList, getAllLists };
