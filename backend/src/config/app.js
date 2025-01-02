import express from "express";

import userRoutes from "../routes/userRoutes.js";
import authRoutes from "../routes/authRoutes.js";
import { notFound } from "../middleware/notFound.js";

const app = express();

app.set("json spaces", 2);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use("/user", userRoutes);

app.use("/auth", authRoutes);

app.use(notFound);

export default app;
