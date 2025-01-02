import { execute } from "../config/database.js";

const user = `CREATE TABLE IF NOT EXISTS "users" (
id SERIAL PRIMARY KEY,
name VARCHAR(100) NOT NULL,
username VARCHAR(100) NOT NULL UNIQUE,
email VARCHAR(100) NOT NULL UNIQUE,
password VARCHAR(255) NOT NULL,
avatar TEXT NOT NULL)`;

execute(user).then((result) => {
  if (!result) {
    console.log("Table 'users' wasn't created");
  }
});

export default user;
