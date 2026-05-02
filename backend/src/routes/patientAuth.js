import express from "express";
import protectAuth from "../middlewares/protectAuth.js";
const router = express.Router();

import {
    registerPatient,
    loginPatient,
    logoutPatient,
    getMePatient
} from "../controllers/patientAuth.js";

router.post("/register", registerPatient);
router.post("/login", loginPatient);
router.post("/logout", logoutPatient);
router.get("/me", protectAuth("patient"), getMePatient);

export default router;