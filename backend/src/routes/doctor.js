import express from "express";
import {
    getDoctors,
    getDoctorProfile,
    getAvailabilitySlots
} from "../controllers/doctor.js";

const router = express.Router();

router.get("/", getDoctors);
router.get("/:id", getDoctorProfile);
router.get("/:id/availability-slots", getAvailabilitySlots);

export default router;