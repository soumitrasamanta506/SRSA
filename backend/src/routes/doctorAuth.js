import express from "express";
import protectAuth from "../middlewares/protectAuth.js";
const router = express.Router();

import {
    registerDoctor,
    loginDoctor,
    logoutDoctor,
    getMeDoctor
} from "../controllers/doctorAuth.js";

router.post("/register", registerDoctor);
router.post("/login", loginDoctor);
router.post("/logout", logoutDoctor);
router.get("/me", protectAuth("doctor"), getMeDoctor);

export default router;