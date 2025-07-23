import express from "express";
import passport from "passport";
import session from "express-session";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";

import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import listAndTaskRoutes from "./routes/list-task-Routes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorMiddleware.js";
import swaggerSpec from "./utils/swagger.js";

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

app.use(morgan("dev"));

// app.use((req, res, next) => {
//   console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
//   next();
// });

app.use("/user", userRoutes);

app.use("/auth", authRoutes);

app.use("/lists", listAndTaskRoutes);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// express@5.1.0 have built-in handler for catch async errors
// global middlewares
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
