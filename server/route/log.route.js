import express from "express";
import { getEtlLogs } from "../controllers/log.controller.js";

const logRouter = express.Router();

logRouter.get("/logs", getEtlLogs);

export default logRouter;
