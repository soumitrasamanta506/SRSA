"use client";

import { AlertCircle, Sparkles } from "lucide-react";
import { MessageList } from "@/components/ui/message-list";
import { MessageInput } from "@/components/ui/message-input";
import { Button } from "@/components/ui/button";

interface ChatPanelProps {
  messages: any[];
  isLoading: boolean;
  isFinal: boolean;
  input: string;
  setInput: (val: string) => void;
  handleSubmit: () => void;
  onViewReport: () => void;
  containerRef: any;
  handleScroll: any;
  handleTouchStart: any;
}

export function ChatPanel({
  messages,
  isLoading,
  isFinal,
  input,
  setInput,
  handleSubmit,
  onViewReport,
  containerRef,
  handleScroll,
  handleTouchStart
}: ChatPanelProps) {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative items-center bg-background">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        className="w-full flex-1 overflow-x-hidden overflow-y-auto px-4 py-6 md:px-6 scroll-smooth bg-muted/20"
      >
        <div className="mx-auto max-w-2xl min-w-0">
          <MessageList
            messages={messages}
            isTyping={isLoading}
            showTimeStamps={true}
          />
        </div>
      </div>

      <div className="w-full p-4 md:p-5 shrink-0 bg-muted/20">
        <div className="mx-auto max-w-2xl relative">
          {isFinal ? (
            <Button
              onClick={onViewReport}
              className="w-full bg-primary text-primary-foreground shadow-primary/20 rounded-2xl py-4 cursor-pointer h-auto text-base font-bold gap-2 transition-all active:scale-[0.98]"
            >
              <Sparkles size={20} />
              View Diagnostic Report
            </Button>
          ) : (
            <MessageInput
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onSubmit={handleSubmit}
              placeholder="Type your symptoms here..."
              className="w-full shadow-lg border border-border focus-within:border-primary/50 transition-all rounded-2xl bg-card"
              isGenerating={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
