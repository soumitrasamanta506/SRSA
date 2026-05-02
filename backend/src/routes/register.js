import patientAuthRoutes from "./patientAuth.js";
import doctorAuthRoutes from "./doctorAuth.js";
import chatRoutes from "./chat.js";
import reportRoutes from "./report.js";

const registerRoutes = (app) => {
    app.use("/api/patient/auth", patientAuthRoutes);
    app.use("/api/doctor/auth", doctorAuthRoutes);    
    app.use("/api/chat", chatRoutes);
    app.use("/api/report", reportRoutes);
};

export default registerRoutes;