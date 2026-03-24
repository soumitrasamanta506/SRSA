import express from "express";
import "dotenv/config";
import cors from "cors";
import session from "express-session";

import logger from "../logs/index.js";
import { errorHandler } from "./middleWare/errorHandler.js";
import chatRoutes from "./routes/chatRoutes.js";

const app = express();

app.use(cors({
    origin: "http://localhost:5000",
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded());

app.use(
    session({
        secret: "SRSA_chatbot",
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 15 * 60 * 1000  // 15 minutes
        }
    })
);

// Routes
app.use("/api/chat", chatRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});