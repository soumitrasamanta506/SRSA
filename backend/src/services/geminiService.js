import { ai } from "../config/gemini.js";

const SYSTEM_PROMPT = `
You are a medical symptom intake chatbot.

Your task:
- Collect symptom name, duration, and severity
- Ask follow-up questions ONLY when necessary
- Ask only ONE question at a time

IMPORTANT RULES:
- Do NOT ask the same question more than once
- Do NOT repeatedly ask "any other symptoms"
- After collecting 1–2 symptoms with details, STOP asking questions
- Then return FINAL JSON immediately

Use only these symptoms:
fever, cough, headache, fatigue, body pain, nausea, vomiting, sore throat

DO NOT:
- Diagnose disease
- Add explanations
- Ask unnecessary questions

FINAL OUTPUT FORMAT (only JSON):
{
  "final_symptoms": [
    { "name": "", "duration": "", "severity": "" }
  ]
}
`;

function buildPrompt(summary, messages){
    const history = messages
        .map(m => `${m.role.toUpperCase()}: ${m.content}`)
        .join("\n");

    return `
    ${SYSTEM_PROMPT}

    Conversation Summary:
    ${summary || "None"}

    Recent Messages:
    ${history}

    Respond appropriately.
    `;
};

export async function generateReply( summary, messages){
    const prompt = buildPrompt(summary, messages);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,        
    });

    return response.text;
}