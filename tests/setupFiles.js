import dotenv from "dotenv";
import { dirname } from "path";
import path from "path";
import { fileURLToPath } from "url";

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

dotenv.config({ path: path.resolve(_dirname, "../.env.test") });

console.log("Environments loaded");
