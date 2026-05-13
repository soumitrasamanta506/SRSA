import DoctorAvailability from "../models/DoctorAvailability.js";
import asyncHandler from "../utils/tryCatchWrapper.js";
import {validateAvailabilityOverlap} from "../services/doctorAvailability.js";

export const createAvailability = asyncHandler(async (req, res) => {

    const {
        dayOfWeek,
        startTime,
        endTime,
        slotDuration
    } = req.body;

    await validateAvailabilityOverlap({
        doctorId: req.user._id,
        dayOfWeek,
        startTime,
        endTime
    });

    const availability = await DoctorAvailability.create({
        doctorId: req.user._id,
        dayOfWeek,
        startTime,
        endTime,
        slotDuration
    });

    res.status(201).json({
        success: true,
        message: "Availability created successfully",
        availability
    });
});

export const getMyAvailability = asyncHandler(async (req, res) => {

    const availability = await DoctorAvailability.find({
        doctorId: req.user._id
    }).sort({
        dayOfWeek: 1,
        startTime: 1
    });

    res.status(200).json({
        success: true,
        count: availability.length,
        availability
    });
});

export const updateAvailability = asyncHandler(async (req, res) => {

    const availability = await DoctorAvailability.findById(req.params.id);

    if (!availability) {
        return res.status(404).json({
            success: false,
            message: "Availability not found"
        });
    }
    // SECURITY CHECK
    if (availability.doctorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: "Unauthorized access"
        });
    }
    
    const {
        dayOfWeek,
        startTime,
        endTime
    } = req.body;
    await validateAvailabilityOverlap({
        doctorId: req.user._id,
        dayOfWeek,
        startTime,
        endTime,
        excludeId: req.params.id
    });

    const updatedAvailability = await DoctorAvailability.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

    res.status(200).json({
        success: true,
        message: "Availability updated successfully",
        availability: updatedAvailability
    });
});

export const deleteAvailability = asyncHandler(async (req, res) => {

    const availability = await DoctorAvailability.findById(req.params.id);

    if (!availability) {
        return res.status(404).json({
            success: false,
            message: "Availability not found"
        });
    }

    // SECURITY CHECK
    if ( availability.doctorId.toString() !== req.user._id.toString() ) {
        return res.status(403).json({
            success: false,
            message: "Unauthorized access"
        });
    }

    await availability.deleteOne();

    res.status(200).json({
        success: true,
        message: "Availability deleted successfully"
    });
});