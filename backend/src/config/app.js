import express from "express";

// import authRouters from "../routes/authRoutes.js";
// import taskRouters from "../routes/taskRoutes.js";
import { notFound } from "../middleware/notFound.js";

const app = express();

app.set("json spaces", 2);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use("/api/auth", authRouters);

// app.use("/api", taskRouters);

app.use(notFound);

export default app;
