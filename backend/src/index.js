import express from "express";
import "dotenv/config";
import cors from "cors";
import session from "express-session";

import logger from "../logs/index.js";
import { errorHandler } from "./middleWare/errorHandler.js";
import chatRoutes from "./routes/chatRoutes.js";

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://127.0.0.1:3000";

app.use(cors({
    origin: (origin, callback) => {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (origin !== FRONTEND_URL && origin !== "http://localhost:3000") {
            return callback(new Error('CORS Policy: Origin not allowed'), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: "SRSA_chatbot",
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 15 * 60 * 1000,
            secure: process.env.NODE_ENV === "production", 
            httpOnly: true,
            sameSite: "lax"
        }
    })
);

// Routes
app.use("/api/chat", chatRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, "127.0.0.1", () => {
    logger.info(`Server is running on http://127.0.0.1:${PORT}`);
});
