import express from "express";
import passport from "passport";
import session from "express-session";
import cookieParser from "cookie-parser";

import userRoutes from "../routes/userRoutes.js";
import authRoutes from "../routes/authRoutes.js";
import listAndTaskRoutes from "../routes/list-task-Routes.js";
import { notFound } from "../middleware/notFound.js";
import errorHandler from "../middleware/errorMiddleware.js";

const app = express();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(cookieParser(process.env.COOKIE_PARSER_SECRET));

app.use(passport.initialize());
app.use(passport.session());

app.set("json spaces", 2);
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use("/user", userRoutes);

app.use("/auth", authRoutes);

app.use("/lists", listAndTaskRoutes);

app.use(errorHandler);

app.use(notFound);

export default app;
