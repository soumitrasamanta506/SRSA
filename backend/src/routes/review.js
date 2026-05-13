import express from "express";
import {
    createReview,
    getDoctorReviews
} from "../controllers/review.js";
import protectAuth from "../middlewares/protectAuth.js";

const router = express.Router();

router.post("/", protectAuth("patient"), createReview);
router.get("/doctor/:doctorId", getDoctorReviews);

export default router;