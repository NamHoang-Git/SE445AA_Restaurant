import express from "express";
import { getEtlSummary, runEtlPipeline, getAnalytics } from "../controllers/etl.controller.js";
import { getEtlLogs } from "../controllers/log.controller.js";

const etlRouter = express.Router();

etlRouter.get("/summary", getEtlSummary);
etlRouter.get("/logs", getEtlLogs);
etlRouter.get("/analytics", getAnalytics);
etlRouter.post("/run", runEtlPipeline);

export default etlRouter;
