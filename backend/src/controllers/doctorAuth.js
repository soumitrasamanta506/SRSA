import bcrypt from "bcryptjs";
import Doctor from "../models/Doctor.js";
import asyncHandler from "../utils/tryCatchWrapper.js";
import generateToken from "../utils/generateToken.js";

// REGISTER
export const registerDoctor = asyncHandler( async (req, res) => {
    const {
        name,
        email,
        phone,
        password,
        specialization,
        qualification,
        experience,
        location,
        consultation_fee,
        bio
    } = req.body;

    const existingDoctor = await Doctor.findOne({ email });

    if(existingDoctor){
        return res.status(400).json({
            success: false,
            message: "Doctor already exists"
        });
    };

    const hashedPassword = await bcrypt.hash(password, 10);

    await Doctor.create({
        name,
        email,
        phone,
        password: hashedPassword,
        specialization,
        qualification,
        experience,
        location,
        consultation_fee,
        bio
    });

    return res.status(201).json({
        success: true,
        message: "Doctor registered successfully"
    });
});

// LOGIN
export const loginDoctor = asyncHandler(async (req, res) => {

    const { email, password } = req.body;

    const doctor = await Doctor.findOne({ email });

    if (!doctor) {
        return res.status(404).json({
            success: false,
            message: "Doctor not found"
        });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);

    if (!isMatch) {
        return res.status(401).json({
            success: false,
            message: "Invalid credentials"
        });
    }

    const token = generateToken(doctor, "doctor");

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
export const logoutDoctor = (req, res) => {
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
export const getMeDoctor = asyncHandler(async (req, res) => {
    res.status(200).json({
        success: true,
        doctor: req.user
    });
});