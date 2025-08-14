import app from "./app.js";
import dotenv from "dotenv";
dotenv.config();
import { testDbConnection } from "./config/db.js";
import { createTables } from "./config/models.js";

(async () => {
  try {
    await testDbConnection();
    await createTables();
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  } catch (e) {
    console.error(e);
    /**
     * ESTUDAR SOBRE SHUTDOWN
     */
    process.exit(1);
  }
})();
