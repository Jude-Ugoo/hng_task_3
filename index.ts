// import app from "./server";
import express, { Express, Request, Response } from "express";
import cookieParser from "cookie-parser";
import authRoute from "./routes/auth.route";
import organisationRoute from "./routes/organisation.route";
import userRoute from "./routes/user.route";
import { database } from "./utils/db";

const app: Express = express()

app.use(express.json());
app.use(cookieParser());
database()

const PORT = 8801;

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World");
});

app.use("/auth", authRoute);
app.use("/api", userRoute);
app.use("/api", organisationRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
