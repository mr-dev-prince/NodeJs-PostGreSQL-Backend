import express from "express";
import { connectDb } from "./database/dbConnection.js";
import "dotenv/config.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser());

connectDb();

// routes
import userRoutes from "./routes/user.route.js";

app.use("/api/v1/user", userRoutes);

app.listen(process.env.PORT, () => {
  console.log("Listening");
});
