import axios from "axios";
import { generateReply } from "../services/geminiService.js";
import asyncHandler from "../utils/tryCatchWrapper.js";
import logger from "../../logs/index.js"

const MAX_MESSAGES = 6;

function extractJSON(text) {
    try {
        // Regex to find content between the first { and last }
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return null;
        
        return JSON.parse(jsonMatch[0]);
    } catch {
        return null;
    }
}

export const handleChat = asyncHandler(async (req, res) => {
    const { message } = req.body;

    // Validation
    if (!message) {
        const err = new Error("Message is required");
        err.statusCode = 400;
        throw err;
    }

    // Initialize session
    if (!req.session.chat) {
        req.session.chat = {
        summary: "",
        messages: [],
        
        };
    }

    const chat = req.session.chat;

    // 1. Add user message
    chat.messages.push({
        role: "user",
        content: message
    });

    // 2. Trim old messages (basic control)
    if (chat.messages.length > MAX_MESSAGES) {
        chat.messages.shift(); // remove oldest
    }

    // 3. Call Gemini
    const reply = await generateReply(chat.summary, chat.messages);

    // 4. Store Gemini reply
    chat.messages.push({
        role: "assistant",
        content: reply
    });
    
    const parsedData = extractJSON(reply);
    // Detect final JSON (symptom extraction complete)
    if(parsedData && parsedData.final_symptoms){
        const extractedSymptoms = parsedData.final_symptoms;

        // clear session after completion
        req.session.chat = null;

        try{
            const mlResponse = await axios.post(`${process.env.ML_SERVICE_URL}/api/disease/predict`, {
                symptoms: extractedSymptoms
            }, { timeout: 5000});

            return res.json({
                success: true,
                type: "final",
                extracted: extractedSymptoms,
                predictions: mlResponse.data.data.predictions
            });
        } catch ( mlError ){
            logger.error(`ML Model Service Unavailable: ${mlError.message}`);

            return res.json({
                success: true,
                type: "final_error",
                extracted: extractedSymptoms,
                message: "I've gathered your symptoms, but my analysis engine is currently offline. Please try again later."
            });
        }
    }

    //  6. Normal chatbot response
    res.json({
        success: true,
        type: "message",
        message: reply
    });
});