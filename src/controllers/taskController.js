import {
  pool,
  insertTask,
  updateTaskData,
  deleteTaskData,
} from "../models/db.js";

const showAllTasks = async (req, res) => {
  const user_id = parseInt(req.user.userId);

  try {
    const result = await pool.query("SELECT * FROM tasks WHERE user_id = $1", [
      user_id,
    ]);
    return res.status(200).json(result.rows);
  } catch (err) {
    res
      .status(500)
      .json({ message: "intern error of server", error: err.message });
  }
};

const createTask = async (req, res) => {
  const { title, description, due_date } = req.body;
  const user_id = parseInt(req.user.userId);

  try {
    const result = await insertTask(user_id, title, description, due_date);

    if (!result)
      return res
        .status(500)
        .json({ message: "Task creation failed", error: err.message });
    return res.status(201).json({ message: "task created successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "intern error of server", error: err.message });
  }
};

const updateTask = async (req, res) => {
  const updates = req.body;
  const taskId = parseInt(req.params.id);
  const user_id = parseInt(req.user.userId);

  // query + placeholders
  let setClause = [];
  // valores para o placeholder
  let values = [];
  let index = 1;

  for (let key in updates) {
    if (updates.hasOwnProperty(key)) {
      setClause.push(`${key} = $${index}`);
      values.push(updates[key]);
      index++;
    }
  }

  if (setClause.length === 0) {
    return res.status(400).json({ message: "No updates provided" });
  }

  values.push(user_id, taskId);

  try {
    const result = await updateTaskData(setClause, values, index);

    if (!result)
      return res.status(500).json({ message: "Task wasn't possible update" });
    return res.status(200).json({ message: "Task successfully updated" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "intern error of server", error: err.message });
  }
};

const deleteTask = async (req, res) => {
  const taskId = parseInt(req.params.id);
  const user_id = parseInt(req.user.userId);
  console.log(taskId, user_id);

  try {
    const result = await deleteTaskData(taskId, user_id);

    if (result === 0)
      return res.status(500).json({ message: "Task wasn't found" });
    return res.status(200).json({ message: "Task successfully deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "intern error of server", error: err.message });
  }
};

export { showAllTasks, createTask, updateTask, deleteTask };
