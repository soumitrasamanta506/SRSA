import Doctor from "../models/Doctor.js";
import DoctorAvailability from "../models/DoctorAvailability.js";
import Appointment from "../models/Appointment.js";
import asyncHandler from "../utils/tryCatchWrapper.js";
import generateSlots from "../utils/generateSlots.js";

export const getDoctors = asyncHandler(async (req, res) => {

    const {
        specialization,
        city,
        search,
        page = 1,
        limit = 10
    } = req.query;

    const query = {};

    // Filter by specialization
    if (specialization) {
        query.specialization = {
            $regex: specialization,
            $options: "i"
        };
    }

    // Filter by city
    if (city) {
        query["location.city"] = {
            $regex: city,
            $options: "i"
        };
    }

    // Search by doctor name
    if (search) {
        query.name = {
            $regex: search,
            $options: "i"
        };
    }

    const doctors = await Doctor.find(query)
        .select("-password")
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));

    const totalDoctors =
        await Doctor.countDocuments(query);

    res.status(200).json({
        success: true,
        totalDoctors,
        currentPage: Number(page),
        totalPages: Math.ceil(
            totalDoctors / Number(limit)
        ),
        doctors
    });
});

export const getDoctorProfile = asyncHandler(async (req, res) => {

    const doctor = await Doctor.findById(req.params.id)
        .select("-password");

    if (!doctor) {
        return res.status(404).json({
            success: false,
            message: "Doctor not found"
        });
    }

    const availability = await DoctorAvailability
        .find({
            doctorId: doctor._id,
            isActive: true
        }).select("-doctorId").sort({
            dayOfWeek: 1,
            startTime: 1
        });

    res.status(200).json({
        success: true,
        doctor,
        availability
    });
});

export const getAvailabilitySlots = asyncHandler(async (req, res) => {
    const doctorId = req.params.id;
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
        return res.status(404).json({
            success: false,
            message: "Doctor not found"
        });
    }

    const availability = await DoctorAvailability.find({
        doctorId,
        isActive: true
    });
    const result = [];
    const currentDate = new Date();

    while (result.length < 10) {
        const dayOfWeek = currentDate.getDay();
        const matchingAvailability = availability.filter( item => item.dayOfWeek === dayOfWeek );

        if (matchingAvailability.length > 0) {
            const formattedDate = currentDate
                    .toISOString()
                    .split("T")[0];

            // Fetch booked appointments
            const bookedAppointments = await Appointment.find({
                doctorId,
                appointmentDate: {
                    $gte: new Date(
                        `${formattedDate}T00:00:00`
                    ),
                    $lt: new Date(
                        `${formattedDate}T23:59:59`
                    )
                },
                status: "booked"
            });

            const bookedSlotSet = new Set(
                bookedAppointments.map( item => item.startTime)
            );
            const slots = [];

            for (const item of matchingAvailability) {
                const generatedSlots = generateSlots(
                    item.startTime,
                    item.endTime,
                    item.slotDuration
                );
                const updatedSlots = generatedSlots
                    .map(slot => {
                        const now = new Date();
                        const slotDateTime = new Date(
                            `${formattedDate}T${slot.startTime}:00`
                        );
                        const minAllowedTime = new Date(
                            now.getTime() +
                            30 * 60 * 1000
                        );
                        const isTooSoon = slotDateTime < minAllowedTime;

                        return({
                            ...slot,
                            available:
                                !bookedSlotSet.has(
                                    slot.startTime
                                ) && !isTooSoon
                    })});

                slots.push(...updatedSlots);
            }
            result.push({
                date: formattedDate,
                dayOfWeek,
                slots
            });
        }

        currentDate.setDate(
            currentDate.getDate() + 1
        );
    }

    res.status(200).json({
        success: true,
        availability: result
    });
});