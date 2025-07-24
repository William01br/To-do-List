import NotFoundErrorHttp from "../errors/NotFoundError.js";
import listRepository from "../repository/listRepository.js";
import taskRepository from "../repository/taskRepository.js";

const getCountTasksByListId = async (listId) => {
  const result = await taskRepository.countTasksByListId(listId);
  return Number(result.rows[0].count);
};

const getAllTasksByListId = async (listId, userId, limit, offset) => {
  const list = (await listRepository.listExists(listId, userId)).rows[0].exists;
  if (!list)
    throw new NotFoundErrorHttp({
      message: "List not found",
    });

  const result = await taskRepository.getAllByListId(listId, limit, offset);

  if (result.rows.length === 0)
    throw new NotFoundErrorHttp({
      message: "There are no tasks",
      context: `list Id: ${listId}`,
    });

  return result.rows;
};

const createTask = async (nameTask, comment, dueDate, listId, userId) => {
  const list = (await listRepository.listExists(listId, userId)).rows[0].exists;
  if (!list)
    throw new NotFoundErrorHttp({
      message: "List not found",
    });

  const result = await taskRepository.create(
    nameTask,
    comment,
    dueDate,
    listId
  );

  return result.rows[0];
};

const getTaskByTaskId = async (listId, taskId, userId) => {
  const list = (await listRepository.listExists(listId, userId)).rows[0].exists;
  if (!list)
    throw new NotFoundErrorHttp({
      message: "List not found",
    });

  const result = await taskRepository.getByTaskId(listId, taskId);

  if (result.rows.length === 0)
    throw new NotFoundErrorHttp({
      message: "Task not found",
    });

  return result.rows;
};

const updateTaskByTaskId = async (
  listId,
  taskId,
  nameTask,
  comment,
  dueDate,
  completed,
  userId
) => {
  const list = (await listRepository.listExists(listId, userId)).rows[0].exists;
  if (!list)
    throw new NotFoundErrorHttp({
      message: "List not found",
    });
  // tem que editar esse completed
  // adicionar uma rota só para check
  const result = await taskRepository.updateByTaskId(
    listId,
    taskId,
    nameTask,
    comment,
    dueDate,
    completed
  );

  if (result.rows.length === 0)
    throw new NotFoundErrorHttp({
      message: "Task not found",
    });

  // should return the task updated
  return result.rowCount;
};

const deleteTaskByTaskId = async (listId, taskId, userId) => {
  const list = (await listRepository.listExists(listId, userId)).rows[0].exists;
  if (!list)
    throw new NotFoundErrorHttp({
      message: "List not found",
    });

  // must be return 204 - route IDEMPOTENT
  await taskRepository.deleteByTaskId(listId, taskId);
};

export default {
  getAllTasksByListId,
  createTask,
  getTaskByTaskId,
  updateTaskByTaskId,
  deleteTaskByTaskId,
  getCountTasksByListId,
};
