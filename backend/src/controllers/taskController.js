import taskService from "../services/taskService.js";

const getAllTasks = async (req, res) => {
  try {
    const listId = req.params.listId;
    if (!listId)
      return res.status(400).json({ message: "List Id is required" });

    const result = await taskService.getAllTasksByListId(listId);

    if (!result) return res.status(404).json({ message: "List not found" });

    if (result.length === 0)
      return res.status(200).json({ tasks: [], message: "There are no tasks" });
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const createTask = async (req, res) => {
  /*
   * Considering the client will send the date in format:
   * ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)
   * example: 2025-01-22T15:30:00Z
   */
  try {
    const { nameTask, comment, dueDate } = req.body;
    if (!nameTask || !comment || !dueDate)
      return res.status(404).json({ message: "All fields are required" });

    const listId = req.params.listId;
    if (!listId)
      return res.status(400).json({ message: "List Id is required" });

    const result = await taskService.createTask(
      nameTask,
      comment,
      dueDate,
      listId
    );
    if (!result) return res.status(404).json({ message: "List not found" });

    return res.status(200).json({ task: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
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

    const result = await taskService.getTaskByTaskId(listId, taskId);
    console.log(result);

    if (!result) return res.status(404).json({ message: "List not found" });

    if (result.length === 0)
      return res.status(404).json({ message: "Task not found" });

    return res.status(200).json(result[0]);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const listId = req.params.listId;
    const taskId = req.params.taskId;

    if (!listId || !taskId)
      return res
        .status(400)
        .json({ message: "ListId and TaskId are required" });

    /*
     * The client will send the date in format:
     * ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)
     * example: 2025-01-22T15:30:00Z
     */

    const fields = req.body;

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

    const result = await taskService.updateTaskByTaskId(
      listId,
      taskId,
      nameTask,
      comment,
      dueDate,
      completed
    );

    if (!result) return res.status(404).json({ message: "List not found" });

    if (result === 0)
      return res.status(404).json({ message: "Task not found" });

    return res.status(200).json({ message: "Task updated successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export { getAllTasks, createTask, getTaskByTaskId, updateTask };
