import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true,
        index: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
        required: true,
        index: true
    },
    appointmentDate: {
        type: Date,
        required: true,
        index: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: [
            "held",
            "confirmed",
            "cancelled",
            "completed"
        ],
        default: "held"
    },
    paymentStatus: {
        type: String,
        enum: [
            "pending",
            "paid",
            "failed"
        ],
        default: "pending"
    },
    paymentId: {
        type: String
    },
    holdExpiresAt: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});

// Clean API response
appointmentSchema.set("toJSON", {
    transform: (doc, ret) => {
        delete ret.__v;

        return ret;
    }
});

export default mongoose.model("Appointment", appointmentSchema);