import express from "express";

import {
    createAvailability,
    getMyAvailability,
    updateAvailability,
    deleteAvailability
} from "../controllers/doctorAvailability.js";

import protectAuth from "../middlewares/protectAuth.js";

const router = express.Router();


// Protect all routes below
router.use(protectAuth("doctor"));
router.post("/", createAvailability);
router.get("/my", getMyAvailability);
router.patch("/:id", updateAvailability);
router.delete("/:id", deleteAvailability);


export default router;