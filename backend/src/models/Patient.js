import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    phone: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    dob: {
        type: Date
    },

    gender: {
        type: String,
        enum: ["male", "female", "other"]
    },

    address: {
        type: String
    }

},
{
    timestamps: true
});

const patient = mongoose.model("Patient", patientSchema);

export default patient;