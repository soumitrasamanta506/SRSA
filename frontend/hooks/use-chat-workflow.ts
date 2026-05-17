import { useState, useRef } from "react";
import { type Message } from "@/components/ui/chat-message";

export function useChatWorkflow() {
  // --- Chat State ---
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm your SRSA Health AI assistant. Please describe your symptoms in detail, and I'll help analyze them.",
      createdAt: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFinal, setIsFinal] = useState(false);

  // --- Health Intelligence State ---
  const [extractedSymptoms, setExtractedSymptoms] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  
  // --- UI State related to chat ---
  const [activeTab, setActiveTab] = useState("chat");
  const [activeReportId, setActiveReportId] = useState<string | null>(null);

  const startOver = (resetReportRef: () => void) => {
    setMessages([
      {
        id: "welcome-" + Date.now(),
        role: "assistant",
        content:
          "Hello! I'm your SRSA Health AI assistant. Please describe your symptoms in detail, and I'll help analyze them.",
        createdAt: new Date(),
      },
    ]);
    setIsFinal(false);
    setExtractedSymptoms([]);
    setPredictions([]);
    setErrorMessage("");
    setActiveTab("chat");
    setActiveReportId(null);
    resetReportRef();
  };

  const handleSubmit = async () => {
    if (!input.trim() || isLoading || isFinal) return;
    const messageToSend = input;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "user",
        content: messageToSend,
        createdAt: new Date(),
      },
    ]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageToSend }),
        credentials: "include",
      });

      const data = await response.json();
      if (data.success) {
        if (data.type === "final" || data.type === "final_error") {
          setIsFinal(true);
          setExtractedSymptoms(data.extracted || []);
          setPredictions(data.predictions || []);
          setErrorMessage(data.type === "final_error" ? data.message : "");

          const content =
            data.type === "final"
              ? `### Analysis Complete\n\nI have successfully compiled your symptom intake profile and run our machine learning models.\n\n**Predicted Conditions:**\n${data.predictions.map((p: any) => `- **${p.disease}**: ${p.confidence}% match`).join("\n")}\n\n*Please refer to the "Diagnostic Report" tab/panel on your screen.*`
              : `### Symptom Summary\n${data.extracted.map((s: any) => `- **${s.name}** (Severity: *${s.severity}*, Duration: *${s.duration}*)`).join("\n")}\n\n⚠️ **Analysis Warning:** ${data.message}`;

          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              role: "assistant",
              content,
              createdAt: new Date(),
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              role: "assistant",
              content: data.message,
              createdAt: new Date(),
            },
          ]);
        }
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content:
            "I'm having trouble connecting to the medical analysis engine. Please ensure your servers are running.",
          createdAt: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    setMessages,
    input,
    setInput,
    isLoading,
    isFinal,
    setIsFinal,
    extractedSymptoms,
    setExtractedSymptoms,
    predictions,
    setPredictions,
    errorMessage,
    setErrorMessage,
    activeTab,
    setActiveTab,
    activeReportId,
    setActiveReportId,
    startOver,
    handleSubmit
  };
}
