import bcrypt from "bcryptjs";
import Patient from "../models/Patient.js";
import asyncHandler from "../utils/tryCatchWrapper.js";
import generateToken from "../utils/generateToken.js";

// REGISTER
export const registerPatient = asyncHandler( async (req, res) => {
    const { name, email, phone, password, dob, gender, address } = req.body;

    const existingPatient = await Patient.findOne({ email });

    if(existingPatient){
        return res.status(400).json({
            success: false,
            message: "Patient already exists"
        });
    };

    const hashedPassword = await bcrypt.hash(password, 10);

    await Patient.create({
        name,
        email, 
        phone, 
        password: hashedPassword, 
        dob, 
        gender, 
        address
    });

    return res.status(201).json({
        success: true,
        message: "Patient registered successfully"
    });
});

// LOGIN
export const loginPatient = asyncHandler(async (req, res) => {

    const { email, password } = req.body;

    const patient = await Patient.findOne({ email });

    if (!patient) {
        return res.status(404).json({
            success: false,
            message: "Patient not found"
        });
    }

    const isMatch = await bcrypt.compare(password, patient.password);

    if (!isMatch) {
        return res.status(401).json({
            success: false,
            message: "Invalid credentials"
        });
    }

    const token = generateToken(patient, "patient");

    res.cookie("SRSA_auth_a1b2c3d4e5f6g7h8", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",      
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.status(200).json({
        success: true,
        message: "Login successful"
    });
});

// LOGOUT
export const logoutPatient = (req, res) => {
    res.clearCookie("SRSA_auth_a1b2c3d4e5f6g7h8", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",      
        sameSite: "lax"
    });

    res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });
};

// ME
export const getMePatient = asyncHandler(async (req, res) => {
    res.status(200).json({
        success: true,
        patient: req.user
    });
});