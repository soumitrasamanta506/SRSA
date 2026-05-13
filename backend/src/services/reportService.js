import PredictionReport from "../models/PredictionReport.js";

export const savePredictionReport = async ({
    patientId,
    symptoms,
    predictions
}) => {
    const primary = predictions[0];
    const others = predictions.slice(1);

    const report = await PredictionReport.create({
        patientId,
        symptoms,
        primaryPrediction: primary,
        predictions: others
    });

    return report;
};