import express from "express";
import { handleChat } from "../controllers/chat.js";
import optionalAuth from "../middlewares/optionalAuth.js";

const router = express.Router();

router.post("/message", optionalAuth, handleChat);

export default router;