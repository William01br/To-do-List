import { testDbConnection } from "../../src/config/db.js";
import { createTables } from "../../src/config/models.js";
import {
  createDatabase,
  dropTestDatabase,
  clearDatabase,
} from "../utils/test-db.js";

beforeAll(async () => {
  await createDatabase();
  await testDbConnection();
  await createTables();
});

beforeEach(async () => {
  await clearDatabase();
});

afterEach(() => {});

afterAll(async () => {
  await dropTestDatabase();
});
