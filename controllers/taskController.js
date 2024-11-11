import { pool, insertTask } from "../models/db.js";

const showAllTasks = async (req, res) => {
  const user_id = parseInt(req.user.userId);

  try {
    const result = await pool.query(
      "SELECT title, description, due_date FROM tasks WHERE user_id = $1",
      [user_id]
    );
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

export { showAllTasks, createTask };
