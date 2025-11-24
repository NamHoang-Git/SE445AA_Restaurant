import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import connectDB from "./config/connectDB.js";
import userRouter from "./route/user.route.js";
import uploadRouter from "./route/upload.route.js";
import etlRouter from "./route/etl.route.js";
import employeeRouter from "./route/employee.route.js";
import shiftRouter from "./route/shift.route.js";
import performanceRouter from "./route/performance.route.js";

const app = express();

app.use(
    cors({
        credentials: true,
        origin: process.env.FRONTEND_URL,
    }),
);

app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));
app.use(
    helmet({
        crossOriginResourcePolicy: false,
    }),
);

const PORT = 8080 || process.env.PORT;

app.get("/", (req, res) => {
    res.json({
        message: "Server is running " + PORT,
    });
});

app.use('/api/user', userRouter);
app.use('/api/file', uploadRouter);
app.use('/api/etl', etlRouter);

// Employee Management routes
app.use('/api/employee', employeeRouter);
app.use('/api/shift', shiftRouter);
app.use('/api/performance', performanceRouter);

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("Server is running", PORT);
    });
});