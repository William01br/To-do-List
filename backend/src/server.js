import app from "./config/app.js";
import dotenv from "dotenv";
dotenv.config();

import { testDbConnection } from "./config/database.js";

async function connect() {
  await testDbConnection();
  app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
  });
}
connect();
