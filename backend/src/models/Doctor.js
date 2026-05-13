import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
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
        lowercase: true
    },

    phone: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    specialization: {
        type: String,
        required: true
    },

    qualification: {
        type: String
    },

    experience: {
        type: Number,
        default: 0
    },

    rating: {
        type: Number,
        default: 0
    },

    totalReviews: {
        type: Number,
        default: 0
    },

    location: {
        address: String,
        city: String
    },

    consultation_fee: {
        type: Number,
        default: 0
    },

    bio: {
        type: String
    }

},
{
    timestamps: true
});
doctorSchema.set("toJSON", {

    transform: (doc, ret) => {
        delete ret.__v;
        delete ret.createdAt;
        delete ret.updatedAt;

        return ret;
    }

});
const doctor = mongoose.model("Doctor", doctorSchema);

export default doctor;