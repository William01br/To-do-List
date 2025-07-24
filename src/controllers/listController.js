import listService from "../services/listService.js";
import BadRequestErrorHttp from "../errors/BadRequestError.js";

const createList = async (req, res) => {
  const userId = req.userId;

  const { listName } = req.body;
  if (!listName)
    throw new BadRequestErrorHttp({
      message: "List name is required",
    });

  const result = await listService.createList(listName, userId);

  return res.status(200).json({ data: result });
};

const getAllLists = async (req, res) => {
  const userId = req.userId;
  const { nextUrl, previousUrl, limit, offset } = req.dataPagination;

  const result = await listService.getAllListsByUserId(userId, limit, offset);

  return res.status(200).json({ nextUrl, previousUrl, data: result });
};

const getListByListId = async (req, res) => {
  const listId = req.params.listId;
  const { nextUrl, previousUrl, limit, offset } = req.dataPagination;

  if (!listId)
    throw new BadRequestErrorHttp({
      message: "list Id is required",
    });

  const result = await listService.getListByListId(listId, limit, offset);

  return res.status(200).json({ nextUrl, previousUrl, data: result });
};

const updateList = async (req, res) => {
  const listId = req.params.listId;
  if (!listId)
    throw new BadRequestErrorHttp({
      message: "List Id is required",
    });

  const { listName } = req.body;
  if (!listName)
    throw new BadRequestErrorHttp({ message: "Name list is required" });

  const userId = req.userId;

  const list = await listService.updateByListId(listId, userId, listName);

  return res.status(200).json({ data: list });
};

const deleteList = async (req, res) => {
  const listId = req.params.listId;
  if (!listId)
    throw new BadRequestErrorHttp({
      message: "List Id is required",
    });

  const userId = req.userId;

  await listService.deleteListByListId(listId, userId);

  // IDEMPOTENT
  return res.status(204).send();
};

export { createList, getAllLists, getListByListId, updateList, deleteList };
