import InternalErrorHttp from "../errors/InternalError.js";
import NotFoundErrorHttp from "../errors/NotFoundError.js";
import listRepository from "../repository/listRepository.js";

const getCountListsByUserId = async (userId) => {
  const result = await listRepository.countByUserId(userId);
  return Number(result.rows[0].count);
};

const createListDefault = async (userId) => {
  const result = await listRepository.createList("Default list", userId, true);
  if (result.rowCount === 0) return null;

  return true;
};

const createList = async (listName, userId) => {
  const result = await listRepository.createList(listName, userId);
  if (result.rows.length === 0)
    throw new InternalErrorHttp({
      message: "List not created",
      context: "reason unknown",
    });

  return result.rows[0];
};

const getAllListsByUserId = async (userId, limit, offset) => {
  const result = await listRepository.getAllByUserId(userId, limit, offset);

  // by default, one list is created when one user is registered.
  // whether not was returned at least one list, the user does not exist.
  if (result.rows.length === 0)
    throw new NotFoundErrorHttp({
      message: "User not found",
    });
  return result.rows;
};

const getListByListId = async (listId, limit, offset) => {
  const result = await listRepository.getListByListId(listId, limit, offset);
  if (result.rows.length === 0)
    throw new NotFoundErrorHttp({ message: "List not found" });

  return result.rows[0];
};

const updateByListId = async (listId, userId, nameList) => {
  const result = await listRepository.updateByListId(listId, userId, nameList);
  if (result.rowCount === 0)
    throw new NotFoundErrorHttp({ message: "List not found" });

  // should return the list??
  return true;
};

const deleteListByListId = async (listId, userId) => {
  await listRepository.deleteByListId(listId, userId);
};

export default {
  createListDefault,
  createList,
  getAllListsByUserId,
  getListByListId,
  updateByListId,
  deleteListByListId,
  getCountListsByUserId,
};
