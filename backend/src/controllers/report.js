import PDFDocument from "pdfkit";
import asyncHandler from "../utils/tryCatchWrapper.js";
import { savePredictionReport } from "../services/reportService.js";
import PredictionReport from "../models/PredictionReport.js";

export const saveReportManually = asyncHandler(async (req, res) => {

    const { symptoms, predictions } = req.body;

    if (!symptoms || !predictions) {
        return res.status(400).json({
            success: false,
            message: "Invalid data"
        });
    }
    const report = await savePredictionReport({
        patientId: req.user._id,
        symptoms,
        predictions
    });

    res.status(201).json({
        success: true,
        message: "Report saved successfully",
        report
    });
});

export const getMyReports = asyncHandler(async (req, res) => {

    const reports = await PredictionReport.find({
        patientId: req.user._id
    })
    .select("primaryPrediction createdAt")
    .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: reports.length,
        reports
    });
});

export const getSingleReport = asyncHandler(async (req, res) => {

    const report = await PredictionReport.findById(req.params.id);

    if (!report) {
        return res.status(404).json({
            success: false,
            message: "Report not found"
        });
    }

    // SECURITY CHECK
    if (report.patientId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: "Unauthorized access"
        });
    }

    res.status(200).json({
        success: true,
        report
    });
});

export const downloadReport = asyncHandler(async (req, res) => {

    const report = await PredictionReport.findById(req.params.id);

    if (!report) {
        return res.status(404).json({
            success: false,
            message: "Report not found"
        });
    }

    // SECURITY CHECK
    if (report.patientId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: "Unauthorized access"
        });
    }

    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
        "Content-Disposition",
        "attachment; filename=report.pdf"
    );

    doc.pipe(res);

    // Title
    doc.fontSize(20).text("Medical Prediction Report", { align: "center" });

    doc.moveDown();

    // Date
    doc.fontSize(12).text(`Date: ${report.createdAt.toDateString()}`);

    doc.moveDown();

    // Symptoms
    doc.text("Symptoms:");
    report.symptoms.forEach((s, i) => {
        doc.text(
            `${i + 1}. ${s.name} (${s.severity}, ${s.duration})`
        );
    });

    doc.moveDown();

    // Primary Prediction
    doc.text("Primary Prediction:");
    doc.text(
        `${report.primaryPrediction.disease} (${report.primaryPrediction.confidence}%)`
    );

    doc.moveDown();

    // Other Predictions
    doc.text("Other Possible Conditions:");
    report.predictions.forEach((p, i) => {
        doc.text(`${i + 1}. ${p.disease} (${p.confidence}%)`);
    });

    doc.end();
});