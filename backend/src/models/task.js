import { execute } from "../config/database.js";

const task = `CREATE TABLE IF NOT EXISTS "tasks" (
id SERIAL PRIMARY KEY,
name VARCHAR(100) NOT NULL,
completed BOOLEAN DEFAULT FALSE,
endDate TIMESTAMP DEFAULT NULL,
listId INTEGER NOT NULL,
FOREIGN KEY (listId) REFERENCES lists(id) ON DELETE CASCADE ON UPDATE CASCADE)`;

execute(task).then((result) => {
  if (!result) {
    console.log("Table 'tasks' wasn't created");
  }
});

export default task;
