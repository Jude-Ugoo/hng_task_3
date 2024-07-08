import express, {Express, Request, Response } from "express"
import { database } from "./utils/db";
import cookieParser from "cookie-parser";
import authRoute from "./routes/auth.route";
import organisationRoute from "./routes/organisation.route";
import userRoute from "./routes/user.route";

const app: Express = express()

app.use(express.json());
app.use(cookieParser());
database()

app.use("/auth", authRoute);
app.use("/api", userRoute);
app.use("/api", organisationRoute);


export default app