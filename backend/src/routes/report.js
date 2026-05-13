import express from "express";
import protectAuth from "../middlewares/protectAuth.js";
const router = express.Router();

import {
    saveReportManually,
    getMyReports,
    getSingleReport,
    downloadReport
} from "../controllers/report.js";

router.post("/", protectAuth("patient"), saveReportManually);
router.get("/my", protectAuth("patient"), getMyReports);
router.get("/:id", protectAuth("patient"), getSingleReport);
router.get("/:id/download", protectAuth("patient"), downloadReport);

export default router;