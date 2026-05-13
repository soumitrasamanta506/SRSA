import mongoose from "mongoose";

const doctorAvailabilitySchema = new mongoose.Schema({

    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
        required: true,
    },

    dayOfWeek: {
        type: Number,
        required: true,
        min: 0,
        max: 6
    },

    startTime: {
        type: String,
        required: true,
        trim: true
    },

    endTime: {
        type: String,
        required: true,
        trim: true
    },

    slotDuration: {
        type: Number,
        required: true,
        default: 30 // in minutes
    },

    isActive: {
        type: Boolean,
        default: true
    }

}, {
    timestamps: true
});
doctorAvailabilitySchema.set("toJSON", {

    transform: (doc, ret) => {

        delete ret.__v;
        delete ret.createdAt;
        delete ret.updatedAt;

        return ret;
    }

});

export default mongoose.model(
    "DoctorAvailability",
    doctorAvailabilitySchema
);