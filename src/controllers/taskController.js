import taskService from "../services/taskService.js";

const getAllTasks = async (req, res) => {
  try {
    const listId = req.params.listId;
    if (!listId)
      return res.status(400).json({ message: "List Id is required" });

    const userId = req.userId;

    const result = await taskService.getAllTasksByListId(listId, userId);

    if (!result) return res.status(404).json({ message: "List not found" });

    if (result.length === 0)
      return res.status(200).json({ tasks: [], message: "There are no tasks" });
    return res.status(200).json({ data: result });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Creates a new task in a specific list.
 *
 * This function handles the creation of a new task. It validates the required fields (nameTask, comment, dueDate),
 * ensures the list ID is provided, and associates the task with the authenticated user.
 * The due date is expected in ISO 8601 format (e.g., `2025-01-22T15:30:00Z`).
 *
 * @async
 * @function createTask
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.nameTask - The name of the task.
 * @param {string} req.body.comment - Additional comments or details about the task.
 * @param {string} req.body.dueDate - The due date of the task in ISO 8601 format (e.g., `2025-01-22T15:30:00Z`).
 * @param {Object} req.params - The parameters extracted from the URL.
 * @param {string} req.params.listId - The ID of the list to which the task belongs.
 * @param {string} req.userId - The ID of the authenticated user (attached to the request object by middleware).
 * @param {Object} res - The response object.
 * @returns {Promise<Object>} A JSON response indicating the result of the operation.
 * @throws {Error} If an error occurs during the process, it is caught and returned as a 500 status response.
 */
const createTask = async (req, res) => {
  try {
    const { nameTask, comment, dueDate } = req.body;
    if (!nameTask || !comment || !dueDate)
      return res.status(400).json({ message: "All fields are required" });

    const listId = req.params.listId;
    if (!listId)
      return res.status(400).json({ message: "List Id is required" });

    const userId = req.userId;

    const result = await taskService.createTask(
      nameTask,
      comment,
      dueDate,
      listId,
      userId
    );
    if (!result) return res.status(404).json({ message: "List not found" });

    return res.status(200).json({ data: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getTaskByTaskId = async (req, res) => {
  try {
    const listId = req.params.listId;
    const taskId = req.params.taskId;

    if (!listId || !taskId)
      return res
        .status(400)
        .json({ message: "ListId and TaskId are required" });

    const userId = req.userId;

    const result = await taskService.getTaskByTaskId(listId, taskId, userId);
    console.log(result);

    if (!result) return res.status(404).json({ message: "List not found" });

    if (result.length === 0)
      return res.status(404).json({ message: "Task not found" });

    return res.status(200).json({ data: result[0] });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Updates an existing task in a specific list.
 *
 * This function handles the updating of a task. It validates the required parameters (`listId` and `taskId`),
 * sanitizes the fields to be updated (replacing empty strings with `null`), and ensures at least one field is provided for updating.
 * The due date is expected in ISO 8601 format (e.g., `2025-01-22T15:30:00Z`).
 *
 * @async
 * @function updateTask
 * @param {Object} req - The request object.
 * @param {Object} req.params - The parameters extracted from the URL.
 * @param {string} req.params.listId - The ID of the list to which the task belongs.
 * @param {string} req.params.taskId - The ID of the task to be updated.
 * @param {Object} req.body - The body of the request containing the fields to update.
 * @param {string} [req.body.nameTask] - The updated name of the task.
 * @param {string} [req.body.comment] - The updated comments or details about the task.
 * @param {string} [req.body.dueDate] - The updated due date of the task in ISO 8601 format (e.g., `2025-01-22T15:30:00Z`).
 * @param {boolean} [req.body.completed] - The updated completion status of the task.
 * @param {string} req.userId - The ID of the authenticated user (attached to the request object by middleware).
 * @param {Object} res - The response object.
 * @returns {Promise<Object>} A JSON response indicating the result of the operation.
 * @throws {Error} If an error occurs during the process, it is caught and returned as a 500 status response.
 */
const updateTask = async (req, res) => {
  try {
    const userId = req.userId;
    const listId = req.params.listId;
    const taskId = req.params.taskId;

    if (!listId || !taskId)
      return res
        .status(400)
        .json({ message: "ListId and TaskId are required" });

    // Extract the fields to update from the request body
    const fields = req.body;

    // Sanitize the fields: replace empty strings with null
    const sanitizedFields = Object.fromEntries(
      Object.entries(fields).map(([key, value]) => [
        key,
        value === "" ? null : value,
      ])
    );
    const { nameTask, comment, dueDate, completed } = sanitizedFields;

    if (!nameTask && !comment && !dueDate && !completed)
      return res
        .status(400)
        .json({ message: "Is required update one field, at least" });

    // return '0' if the task is not found. 0 === falsy.
    // return 'null' if the list is not found.
    const result = await taskService.updateTaskByTaskId(
      listId,
      taskId,
      nameTask,
      comment,
      dueDate,
      completed,
      userId
    );

    if (result === null)
      return res.status(404).json({ message: "List not found" });

    if (!result) return res.status(404).json({ message: "Task not found" });

    return res.status(200).json({ message: "Task updated successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const userId = req.userId;
    const listId = req.params.listId;
    const taskId = req.params.taskId;

    if (!listId || !taskId)
      return res
        .status(400)
        .json({ message: "ListId and TaskId are required" });

    const result = await taskService.deleteTaskByTaskId(listId, taskId, userId);

    if (result === null)
      return res.status(404).json({ message: "List not found" });

    if (!result)
      return res
        .status(404)
        .json({ message: "Task not found. Nothing was deleted" });

    return res.status(200).json({ message: "Task deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export { getAllTasks, createTask, getTaskByTaskId, updateTask, deleteTask };
