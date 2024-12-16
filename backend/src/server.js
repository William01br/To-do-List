import app from "./config/app.js";
import dotenv from "dotenv";
dotenv.config();

import { testDbConnection } from "./config/database.js";
import syncDB from "./config/sync.js";

async function connect() {
  await testDbConnection();
  await syncDB();
  app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
  });
}
connect();
