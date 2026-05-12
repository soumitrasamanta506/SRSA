import crypto from "crypto";
import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import razorpay from "../config/razorpay.js";
import asyncHandler from "../utils/tryCatchWrapper.js";

export const holdAppointmentSlot = asyncHandler(async (req, res) => {
    const {
        doctorId,
        appointmentDate,
        startTime,
        endTime
    } = req.body;

    // Check doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
        return res.status(404).json({
            success: false,
            message: "Doctor not found"
        });
    }

    // Prevent past booking
    const slotDateTime = new Date(
        `${appointmentDate}T${startTime}:00`
    );

    const minAllowedTime = new Date(
        Date.now() +
        30 * 60 * 1000
    );

    if (slotDateTime < minAllowedTime) {
        return res.status(400).json({
            success: false,
            message: "Appointments must be booked at least 30 minutes in advance"
        });
    }

    // Check existing active appointment
    const existingAppointment = await Appointment.findOne({
        doctorId,
        appointmentDate,
        startTime,
        $or: [
            {
                status: "confirmed"
            },
            {
                status: "held",
                holdExpiresAt: {
                    $gt: new Date()
                }
            }
        ]
    });

    if (existingAppointment) {
        return res.status(409).json({
            success: false,
            message: "Slot cannot be booked"
        });
    }

    // Hold for 5 minutes
    const holdExpiresAt = new Date( Date.now() + 5 * 60 * 1000 );

    // Create temporary appointment
    const appointment = await Appointment.create({
        patientId: req.user._id,
        doctorId,
        appointmentDate,
        startTime,
        endTime,
        holdExpiresAt
    });


    // Create Razorpay order
    const order = await razorpay.orders.create({
        amount: doctor.consultation_fee * 100,
        currency: "INR",
        receipt: appointment._id.toString()
    });

    res.status(201).json({
        success: true,
        message: "Slot held successfully",
        appointment,
        order
    });
});

export const verifyPayment = asyncHandler(async (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        appointmentId
    } = req.body;

    const generatedSignature = crypto
        .createHmac(
            "sha256",
            process.env.RAZORPAY_KEY_SECRET
        )
        .update(
            razorpay_order_id +
            "|" +
            razorpay_payment_id
        )
        .digest("hex");

    if (generatedSignature !== razorpay_signature) {
        await Appointment.findByIdAndUpdate(
            appointmentId,
            {
                status: "cancelled",
                paymentStatus: "failed"
            }
        );
        return res.status(400).json({
            success: false,
            message: "Payment verification failed"
        });
    }

    // Confirm booking
    const appointment = await Appointment.findByIdAndUpdate(
        appointmentId,
        {
            status: "confirmed",
            paymentStatus: "paid",
            paymentId: razorpay_payment_id
        },
        {
            new: true
        }
    );

    res.status(200).json({
        success: true,
        message: "Appointment booked successfully",
        appointment
    });
});

export const getPatientAppointments = asyncHandler(async (req, res) => {
    const { type } = req.query;
    const query = {
        patientId: req.user._id
    };
    
    if (type === "upcoming") {  // Upcoming appointments
        query.status = "confirmed";
        query.appointmentDate = {
            $gte: new Date(
                new Date().setHours(0, 0, 0, 0)
            )
        };
    } else if (type === "completed") {  // Completed appointments
        query.status = "completed";
    } else if (type === "cancelled") {  // Cancelled appointments
        query.status = "cancelled";
    } else {  // Invalid type
        return res.status(400).json({
            success: false,
            message: "Invalid appointment type"
        });
    }

    const appointments = await Appointment.find(query)
        .populate({
            path: "doctorId",
            select: "name specialization consultation_fee location"
        }).sort({
            appointmentDate: -1,
            startTime: 1
        });

    res.status(200).json({
        success: true,
        totalAppointments: appointments.length,
        appointments
    });

});

export const cancelAppointment = asyncHandler(async (req, res) => {
    const appointment = await Appointment.findById(
        req.params.id
    );

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

    if (appointment.status !== "confirmed") {
        return res.status(400).json({
            success: false,
            message: "Only confirmed appointments can be cancelled"
        });
    }

    // Prevent cancelling past appointments
    const appointmentDateTime =
        new Date(
            `${appointment.appointmentDate
                .toISOString()
                .split("T")[0]
            }T${appointment.startTime}:00`
        );


    if (appointmentDateTime < new Date()) {
        return res.status(400).json({
            success: false,
            message: "Past appointments cannot be cancelled"
        });
    }

    // 1-hour cancellation restriction
    const ONE_HOUR = 60 * 60 * 1000;
    if (appointmentDateTime.getTime() - Date.now() < ONE_HOUR) {
        return res.status(400).json({
            success: false,
            message: "Appointments cannot be cancelled within 1 hour"
        });
    }

    appointment.status = "cancelled";
    await appointment.save();

    res.status(200).json({
        success: true,
        message: "Appointment cancelled successfully"
    });
});

export const getDoctorAppointments = asyncHandler(async (req, res) => {
    const {
        date,
        status
    } = req.query;

    const query = {
        doctorId: req.user._id
    };

    if (date) {
        query.appointmentDate = {
            $gte: new Date(
                `${date}T00:00:00`
            ),
            $lt: new Date(
                `${date}T23:59:59`
            )
        };
    }
    if (status) {
        query.status = status;
    }


    const appointments = await Appointment.find(query)
        .populate({
            path: "patientId",
            select: "name email phone"
        }).sort({
            appointmentDate: 1,
            startTime: 1
        });

    res.status(200).json({
        success: true,
        totalAppointments: appointments.length,
        appointments
    });
});

export const markAppointmentCompleted = asyncHandler(async (req, res) => {
    const appointment = await Appointment.findById(
        req.params.id
    );

    if (!appointment) {
        return res.status(404).json({
            success: false,
            message: "Appointment not found"
        });
    }
    
    if (appointment.doctorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: "Unauthorized"
        });
    }

    if (appointment.status !== "confirmed") {
        return res.status(400).json({
            success: false,
            message: "Only confirmed appointments can be completed"
        });
    }

    // Appointment time validation
    const appointmentDateTime =
        new Date(
            `${appointment.appointmentDate
                .toISOString()
                .split("T")[0]
            }T${appointment.startTime}:00`
        );

    if (appointmentDateTime > new Date()) {
        return res.status(400).json({
            success: false,
            message: "Future appointments cannot be completed"
        });
    }

    appointment.status = "completed";
    await appointment.save();

    res.status(200).json({
        success: true,
        message: "Appointment marked as completed",
        appointment
    });
});