import Review from "../models/Review.js";
import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import asyncHandler from "../utils/tryCatchWrapper.js";

export const createReview = asyncHandler(async (req, res) => {
    const {
        appointmentId,
        doctorId,
        rating,
        comment
    } = req.body;
    
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
        return res.status(404).json({
            success: false,
            message: "Appointment not found"
        });
    }
    
    if (appointment.patientId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: "Unauthorized"
        });
    }

    // Only completed appointments
    if (appointment.status !== "completed") {
        return res.status(400).json({
            success: false,
            message: "Review allowed only after appointment completion"
        });
    }

    // Prevent duplicate review
    const existingReview = await Review.findOne({
        appointmentId
    });
    if (existingReview) {
        return res.status(400).json({
            success: false,
            message: "Review already submitted"
        });
    }

    // Create review
    const review = await Review.create({
        patientId: req.user._id,
        doctorId,
        appointmentId,
        rating,
        comment
    });

    // Recalculate doctor rating
    const reviews = await Review.find({ doctorId });
    const totalReviews = reviews.length;

    const averageRating = reviews.reduce((sum, item) => sum + item.rating, 0) / totalReviews;
    await Doctor.findByIdAndUpdate(
        doctorId,
        {
            rating: Number(averageRating.toFixed(1)),
            totalReviews
        }
    );

    res.status(201).json({
        success: true,
        message: "Review submitted successfully",
        review
    });
});

export const getDoctorReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find({
        doctorId: req.params.doctorId
    }).populate({
        path: "patientId",
        select: "name"
    }).sort({
        createdAt: -1
    });

    res.status(200).json({
        success: true,
        totalReviews: reviews.length,
        reviews
    });
});