"use client";

import { useState, useEffect } from "react";
import { MessageList } from "@/components/ui/message-list";
import { MessageInput } from "@/components/ui/message-input";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { type Message } from "@/components/ui/chat-message";
import { Stethoscope, RotateCcw, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

export default function ChatComponent() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your SRSA Health AI assistant. Please describe your symptoms (e.g., 'I have a fever and cough'), and I'll help analyze them.",
      createdAt: new Date(),
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFinal, setIsFinal] = useState(false);

  const { containerRef, handleScroll, handleTouchStart } = useAutoScroll([messages, isLoading]);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async () => {
    if (!input.trim() || isLoading || isFinal) return;

    const messageToSend = input;
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageToSend,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Relative path /api/... will be rewritten to backend by next.config.ts
      const response = await fetch("/api/chat/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: messageToSend }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.type === "final") {
          setIsFinal(true);
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: `### Symptom Extraction Complete\nBased on our conversation, I've summarized your symptoms:\n\n\`\`\`json\n${JSON.stringify(data.data, null, 2)}\n\`\`\`\n\nYou can now proceed with this data or start a new session.`,
            createdAt: new Date(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
        } else {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: data.message,
            createdAt: new Date(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
        }
      } else {
        throw new Error(data.message || "Failed to get reply");
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm having trouble connecting to the medical analysis engine. Please ensure the backend is running and try again.",
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const startOver = () => {
    setMessages([
      {
        id: "welcome-" + Date.now(),
        role: "assistant",
        content: "Hello! I'm your SRSA Health AI assistant. Please describe your symptoms in detail, and I'll help analyze them.",
        createdAt: new Date(),
      }
    ]);
    setIsFinal(false);
  };

  const toggleTheme = () => {
    if (theme === "light") setTheme("dark");
    else setTheme("light");
  };

  const getThemeIcon = () => {
    if (!mounted) return <Sun size={20} />;
    if (theme === "light") return <Sun size={20} />;
    return <Moon size={20} />;
  };

  return (
    <div className="flex flex-col h-full w-full bg-background transition-colors duration-300">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b bg-card/50 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-xl text-primary-foreground shadow-lg shadow-primary/20">
            <Stethoscope size={22} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none tracking-tight">SRSA Health AI</h1>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Symptom Analysis System</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="rounded-full"
            title={`Current theme: ${theme}`}
          >
            {getThemeIcon()}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={startOver}
            className="gap-2 rounded-full hidden sm:flex"
          >
            <RotateCcw size={16} />
            Reset Session
          </Button>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden relative flex flex-col items-center">
        <div 
          ref={containerRef}
          onScroll={handleScroll}
          onTouchStart={handleTouchStart}
          className="w-full flex-1 overflow-x-hidden overflow-y-auto px-4 py-8 md:px-6 scroll-smooth"
        >
          <div className="mx-auto max-w-3xl min-w-0 text-foreground">
            <MessageList 
              messages={messages} 
              isTyping={isLoading}
              showTimeStamps={true}
            />
          </div>
        </div>

        {/* Input Area */}
        <div className="w-full border-t bg-card/50 backdrop-blur-md p-4 md:p-6 shrink-0">
          <div className="mx-auto max-w-3xl relative">
            {isFinal ? (
              <div className="flex flex-col items-center gap-4 py-2 animate-in fade-in slide-in-from-bottom-2">
                <p className="text-sm font-medium text-muted-foreground text-center">Analysis complete. Start a new session to check other symptoms.</p>
                <Button onClick={startOver} className="rounded-full px-8 gap-2 shadow-lg transition-transform hover:scale-105">
                  <RotateCcw size={18} />
                  Start New Session
                </Button>
              </div>
            ) : (
              <MessageInput
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onSubmit={handleSubmit}
                placeholder="Type your symptoms here..."
                className="w-full shadow-xl border-2 focus-within:border-primary/50 transition-all rounded-2xl"
                isGenerating={isLoading}
              />
            )}
            {/* <p className="text-[10px] text-center text-muted-foreground mt-4 uppercase tracking-widest font-semibold opacity-50">
              AI-Powered Healthcare Assistant • Not for Emergency Use
            </p> */}
          </div>
        </div>
      </div>
    </div>
  );
}
