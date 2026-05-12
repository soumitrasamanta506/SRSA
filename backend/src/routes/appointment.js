import express from "express";
import {
    holdAppointmentSlot,
    verifyPayment,
    getPatientAppointments,
    cancelAppointment,
    getDoctorAppointments,
    markAppointmentCompleted
} from "../controllers/appointment.js";
import protectAuth from "../middlewares/protectAuth.js";

const router = express.Router();

// Hold slot + create payment order
router.post("/hold-slot", protectAuth("patient"), holdAppointmentSlot);
router.post("/verify-payment", protectAuth("patient"), verifyPayment);
router.get("/patient", protectAuth("patient"), getPatientAppointments);
router.patch("/:id/cancel", protectAuth("patient"), cancelAppointment);

router.get("/doctor", protectAuth("doctor"), getDoctorAppointments);
router.patch("/:id/complete", protectAuth("doctor"), markAppointmentCompleted);

export default router;