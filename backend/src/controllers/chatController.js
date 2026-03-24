import { generateReply } from "../services/geminiService.js";
import asyncHandler from "../utils/tryCatchWrapper.js";

const MAX_MESSAGES = 6;

function isJSONResponse(text) {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
}

export const handleChat = asyncHandler(async (req, res) => {
    const { message } = req.body;

    // 🔴 Validation
    if (!message) {
        const err = new Error("Message is required");
        err.statusCode = 400;
        throw err;
    }

    // 🧠 Initialize session
    if (!req.session.chat) {
        req.session.chat = {
        summary: "",
        messages: [],
        
        };
    }

    const chat = req.session.chat;

    // ✅ 1. Add user message
    chat.messages.push({
        role: "user",
        content: message
    });

    // ✅ 2. Trim old messages (basic control)
    if (chat.messages.length > MAX_MESSAGES) {
        chat.messages.shift(); // remove oldest
    }

    // 🤖 3. Call Gemini
    const reply = await generateReply(chat.summary, chat.messages);

    // ✅ 4. Store Gemini reply
    chat.messages.push({
        role: "assistant",
        content: reply
    });

    // 🎯 5. Detect final JSON (symptom extraction complete)
    if(isJSONResponse(reply)){
        let parsed = JSON.parse(reply);

        // 🧹 Optional: clear session after completion
        req.session.chat = null;

        return res.json({
        success: true,
        type: "final",
        data: parsed
        });
    }

    // 💬 6. Normal chatbot response
    res.json({
        success: true,
        type: "message",
        message: reply
    });
});