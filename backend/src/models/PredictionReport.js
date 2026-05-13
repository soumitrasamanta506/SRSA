import mongoose from "mongoose";

const predictionReportSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true
    },

    symptoms: [
        {
            name: {
                type: String,
                required: true
            },
            duration: {
                type: String
            },
            severity: {
                type: String,
                enum: ["low", "medium", "high"]
            },
            _id: false
        }
    ],

    primaryPrediction: {
        disease: String,
        confidence: Number
    },

    predictions: [
        {
            disease: String,
            confidence: Number,
            _id: false
        }
    ]

}, {
    timestamps: true
});

export default mongoose.model("PredictionReport", predictionReportSchema);