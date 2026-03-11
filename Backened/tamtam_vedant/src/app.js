import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({limit:"16kb"}));
app.use(cookieParser());
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));


import userRoutes from "./routes/user.routes.js";
import jobRoutes from "./routes/job.routes.js";
import applicationsRoutes from "./routes/applications.routes.js";
 
app.use("/api/v1/users", userRoutes);

app.use("/api/v1/job", jobRoutes);
app.use("/api/v1/applications", applicationsRoutes);


export default app;