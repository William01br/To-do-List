import BadRequestErrorHttp from "../errors/BadRequestError.js";
import taskService from "../services/taskService.js";

const getAllTasks = async (req, res) => {
  const { nextUrl, previousUrl, limit, offset } = req.dataPagination;

  const listId = req.params.listId;
  if (!listId) throw BadRequestErrorHttp({ message: "List Id is required" });

  const userId = req.userId;

  const result = await taskService.getAllTasksByListId(
    listId,
    userId,
    limit,
    offset
  );

  return res.status(200).json({ nextUrl, previousUrl, data: result });
};

// TRANSFORMAR EM FORMATO ISO NO SERVICE OU EM ALGUM MIDDLEWARE AO INVÉS DE MANDAR NO FORMATO DIRETO NO BODY.
// NA VERDADE, O FRONT JÁ MANDA NO FORMATO, AQUI SÓ VALIDAMOS.
const createTask = async (req, res) => {
  const { nameTask, comment, dueDate } = req.body;
  if (!nameTask || !comment || !dueDate)
    throw new BadRequestErrorHttp({
      message: "All fields are required",
    });

  const listId = req.params.listId;
  const inputRegex = /^(?:[1-9]\d{0,2})$/;
  if (!listId || !inputRegex.test(listId))
    throw new BadRequestErrorHttp({
      message: "List Id is required and must be a valid number",
      context: "must be a number between 1 and 999",
    });

  const userId = req.userId;

  const result = await taskService.createTask(
    nameTask,
    comment,
    dueDate,
    listId,
    userId
  );

  return res.status(200).json({ data: result });
};

const getTaskByTaskId = async (req, res) => {
  const { listId, taskId } = req.params;
  if (!listId || !taskId)
    throw new BadRequestErrorHttp({
      message: "ListId and TaskId are required",
    });

  const userId = req.userId;

  const result = await taskService.getTaskByTaskId(listId, taskId, userId);

  return res.status(200).json({ data: result[0] });
};

const updateTask = async (req, res) => {
  const userId = req.userId;

  const { listId, taskId } = req.params;
  if (!listId || !taskId)
    throw new BadRequestErrorHttp({
      message: "ListId and TaskId are required",
    });

  // Extract the fields to update from the request body
  const fields = req.body;

  // Sanitize the fields: replace empty strings with null
  const sanitizedFields = Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [
      key,
      value === "" ? null : value,
    ])
  );
  const { nameTask, comment, dueDate } = sanitizedFields;

  if (!nameTask && !comment && !dueDate)
    throw new BadRequestErrorHttp({
      message: "Is required update one field, at least",
      context: "no value was send",
    });

  const task = await taskService.updateTaskByTaskId(
    listId,
    taskId,
    nameTask,
    comment,
    dueDate,
    userId
  );

  return res.status(200).json({ data: task });
};

const setTaskCompleted = async (req, res) => {
  const userId = req.userId;

  const { listId, taskId } = req.params;
  if (!listId || !taskId)
    throw new BadRequestErrorHttp({
      message: "ListId and TaskId are required",
    });

  const completed = req.body.completed;
  if (typeof completed !== "boolean")
    throw new BadRequestErrorHttp({
      message: "'completed' is required and must be boolean value",
    });

  const task = await taskService.setTaskCompleted(
    userId,
    listId,
    taskId,
    completed
  );
  res.status(200).json({
    data: task,
  });
};

const deleteTask = async (req, res) => {
  const userId = req.userId;
  const listId = req.params.listId;
  const taskId = req.params.taskId;

  if (!listId || !taskId)
    throw new BadRequestErrorHttp({
      message: "ListId and TaskId are required",
    });

  await taskService.deleteTaskByTaskId(listId, taskId, userId);

  // IDEMPOTENT
  return res.status(204).send();
};

export {
  getAllTasks,
  createTask,
  getTaskByTaskId,
  updateTask,
  deleteTask,
  setTaskCompleted,
};
