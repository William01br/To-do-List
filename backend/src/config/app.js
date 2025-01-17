import express from "express";
import passport from "passport";
import session from "express-session";

import userRoutes from "../routes/userRoutes.js";
import authRoutes from "../routes/authRoutes.js";
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

app.use(passport.initialize());
app.use(passport.session());

app.set("json spaces", 2);
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use("/user", userRoutes);

app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Hello, Dude!");
});

app.use(errorHandler);

app.use(notFound);

export default app;
