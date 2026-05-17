"use client";

import { AlertCircle, Sparkles } from "lucide-react";
import { MessageList } from "@/components/ui/message-list";
import { MessageInput } from "@/components/ui/message-input";
import { Button } from "@/components/ui/button";

interface ChatPanelProps {
  messages: any[];
  isLoading: boolean;
  input: string;
  setInput: (val: string) => void;
  handleSubmit: () => void;
  showDemoTrigger: boolean;
  setShowDemoTrigger: (val: boolean) => void;
  simulateDemoFlow: () => void;
  containerRef: any;
  handleScroll: any;
  handleTouchStart: any;
}

export function ChatPanel({
  messages,
  isLoading,
  input,
  setInput,
  handleSubmit,
  showDemoTrigger,
  setShowDemoTrigger,
  simulateDemoFlow,
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

          {showDemoTrigger && (
            <div className="p-4 mt-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-3 text-left">
              <div className="flex gap-2.5 text-amber-600 dark:text-amber-500">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold font-sans">Gemini API Rate Limit / Quota Exceeded (429)</p>
                  <p className="mt-1 leading-relaxed text-[11px] opacity-90 font-sans">
                    Your configured Gemini API key has hit Google's daily free-tier usage caps (20 queries). 
                    Bypassing this with our **Clinical Intake Simulator** lets you evaluate the full diagnostics dashboard, physician schedules, slot selector, and payment receipt flows immediately!
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={simulateDemoFlow} 
                  className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs gap-1.5 shadow-md shadow-amber-500/10 cursor-pointer transition-transform active:scale-95 font-bold"
                >
                  <Sparkles size={13} />
                  Simulate Diagnostics & Booking
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setShowDemoTrigger(false)} 
                  className="rounded-xl text-xs border-border hover:bg-accent text-foreground cursor-pointer transition-transform active:scale-95"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="w-full p-4 md:p-5 shrink-0 bg-muted/20">
        <div className="mx-auto max-w-2xl relative">
          <MessageInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onSubmit={handleSubmit}
            placeholder="Type your symptoms here..."
            className="w-full shadow-lg border border-border focus-within:border-primary/50 transition-all rounded-2xl bg-card"
            isGenerating={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
