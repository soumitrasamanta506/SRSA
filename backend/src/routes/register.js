import patientAuthRoutes from "./patientAuth.js";
import doctorAuthRoutes from "./doctorAuth.js";
import chatRoutes from "./chat.js";
import reportRoutes from "./report.js";
import doctorAvailabilityRoutes from "./doctorAvailability.js";
import doctorRoutes from "./doctor.js";
import appointmentRoutes from "./appointment.js";
import reviewRoutes from "./review.js";

const registerRoutes = (app) => {
    app.use("/api/patient/auth", patientAuthRoutes);
    app.use("/api/doctor/auth", doctorAuthRoutes);    
    app.use("/api/chat", chatRoutes);
    app.use("/api/report", reportRoutes);
    app.use("/api/doctor/availability", doctorAvailabilityRoutes);
    app.use("/api/doctors", doctorRoutes);
    app.use("/api/appointments", appointmentRoutes);
    app.use("/api/reviews", reviewRoutes);
};

export default registerRoutes;