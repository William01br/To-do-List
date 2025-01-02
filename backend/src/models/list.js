import { execute } from "../config/database.js";

const list = `CREATE TABLE IF NOT EXISTS "lists" (
id SERIAL PRIMARY KEY ,
name VARCHAR(100) NOT NULL,
userId INTEGER NOT NULL,
FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE)`;

execute(list).then((result) => {
  if (!result) {
    console.log("Table 'lists' wasn't created");
  }
});

export default list;
