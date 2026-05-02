import jwt from "jsonwebtoken";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import asyncHandler from "../utils/tryCatchWrapper.js";

const protectAuth = (role) =>
    asyncHandler(async (req, res, next) => {

        const token = req.cookies.SRSA_auth_a1b2c3d4e5f6g7h8;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_KEY);

        if (decoded.role !== role) {
            return res.status(403).json({
                success:false,
                message:"Unauthorized"
            });
        }

        const Model = role === "patient" ? Patient : Doctor;
        const user = await Model.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        req.user = user;
        req.role = role;

        next();
    });

export default protectAuth;