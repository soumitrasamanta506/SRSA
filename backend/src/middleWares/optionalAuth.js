import jwt from "jsonwebtoken";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import asyncHandler from "../utils/tryCatchWrapper.js";

const optionalAuth = async (req, res, next) => {
    try {
        const token = req.cookies.SRSA_auth_a1b2c3d4e5f6g7h8;

        if (!token) {
            return next(); // guest user
        }

        const decoded = jwt.verify(token, process.env.JWT_KEY);

        let user = null;

        const Model = decoded.role === "patient" ? Patient : Doctor;
        user = await Model.findById(decoded.id).select("-password");

        if (user) {
            req.user = user;
            req.role = decoded.role;
        }

        next();

    } catch (err) {
        next();
    }
};

export default optionalAuth;