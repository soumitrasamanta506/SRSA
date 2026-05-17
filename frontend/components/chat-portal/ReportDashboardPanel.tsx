"use client";

import { Sparkles, Download, FileText, Brain, Star, Briefcase, MapPin, Calendar, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ReportDashboardPanelProps {
  activeReportId: string | null;
  extractedSymptoms: any[];
  predictions: any[];
  errorMessage: string;
  recommendedDoctors: any[];
  availabilities: any;
  matchedSpecialization: string;
  startOver: () => void;
  onSelectDoctor: (doc: any, date: string) => void;
  getSpecializationForDisease: (disease: string) => string;
}

export function ReportDashboardPanel({
  activeReportId,
  extractedSymptoms,
  predictions,
  errorMessage,
  recommendedDoctors,
  availabilities,
  matchedSpecialization,
  startOver,
  onSelectDoctor,
  getSpecializationForDisease
}: ReportDashboardPanelProps) {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background text-left">
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-6">
        
        {/* Header Card */}
        <div className="p-5 border border-border bg-card rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm w-full">
          <div className="slide-in-from-left-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <Sparkles size={15} className="text-primary" />
              Clinical Analysis & Recommendations
            </h2>
            <p className="text-[10px] text-muted-foreground mt-1">
              Machine-learning generated diagnostic summary and matchmaking calendar
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {activeReportId && (
              <Button
                onClick={() => window.open(`/api/report/${activeReportId}/download`, "_blank")}
                className="rounded-xl text-xs gap-1.5 shadow-md shadow-primary/10 active:scale-95 transition-transform font-bold cursor-pointer"
              >
                <Download size={13} />
                Download PDF Report
              </Button>
            )}
            <Button
              variant="outline"
              onClick={startOver}
              className="rounded-xl border-border text-xs font-bold px-3.5 py-2 cursor-pointer transition-transform active:scale-95"
            >
              Start New Consultation
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          <div className="space-y-3.5 h-full flex flex-col">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 shrink-0">
              <FileText size={14} className="text-primary" />
              Extracted Symptoms Profile ({extractedSymptoms.length})
            </h3>
            <div className="p-5 bg-card border border-border rounded-2xl flex-1 space-y-4 shadow-sm flex flex-col justify-start">
              <p className="text-xs text-muted-foreground leading-normal shrink-0 font-sans">
                The neural language processing network analyzed your conversational intake and successfully extracted the following active symptoms:
              </p>
              <div className="flex flex-wrap gap-2.5 overflow-y-auto max-h-[180px] pr-1.5">
                {extractedSymptoms.length === 0 ? (
                  <span className="text-xs text-muted-foreground italic font-sans">No symptoms parsed.</span>
                ) : (
                  extractedSymptoms.map((symptom, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col gap-0.5 px-3.5 py-2.5 bg-muted border border-border rounded-xl"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <span className="text-xs font-bold text-foreground capitalize font-sans">
                        {symptom.name}
                      </span>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span
                          className={cn(
                            "text-[9px] font-bold px-1.5 py-0.5 rounded-full border capitalize",
                            symptom.severity === "high"
                              ? "bg-destructive/10 text-destructive border-destructive/20"
                              : symptom.severity === "medium"
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                              : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                          )}
                        >
                          {symptom.severity}
                        </span>
                        <span className="text-[9px] text-muted-foreground font-sans">
                          {symptom.duration}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3.5 h-full flex flex-col">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 shrink-0">
              <Brain size={14} className="text-primary" />
              AI Diagnostic Predictions
            </h3>

            <div className="flex-1">
              {errorMessage ? (
                <div className="p-5 bg-destructive/10 border border-destructive/20 rounded-2xl flex gap-3 text-destructive h-full items-center font-sans">
                  <AlertCircle className="w-6 h-6 shrink-0" />
                  <div>
                    <p className="text-xs font-bold">Prediction Engine Warning</p>
                    <p className="text-[11px] mt-1 leading-normal opacity-90">{errorMessage}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {predictions.slice(0, 3).map((pred, idx) => {
                    const isPrimary = idx === 0;
                    const matchPct = pred.confidence;

                    return (
                      <div
                        key={idx}
                        className={cn(
                          "p-4.5 rounded-2xl border transition-all relative overflow-hidden bg-card shadow-xs text-left",
                          isPrimary
                            ? "border-primary dark:border-primary/60 bg-primary/5 shadow-md shadow-primary/5"
                            : "border-border"
                        )}
                        style={{ animationDelay: `${idx * 150}ms` }}
                      >
                        <div className="flex items-start justify-between font-sans">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-foreground">
                                {pred.disease}
                              </h4>
                              {isPrimary && (
                                <span className="text-[9px] bg-primary text-primary-foreground font-bold px-1.5 py-0.5 rounded-full tracking-wide">
                                  Primary Match
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              Specialist Match:{" "}
                              <span className="font-semibold text-primary capitalize">
                                {getSpecializationForDisease(pred.disease)}
                              </span>
                            </p>
                          </div>
                          <span className="text-xs font-bold text-foreground font-mono">
                            {matchPct}% Match
                          </span>
                        </div>

                        <div className="w-full h-1.5 bg-muted rounded-full mt-3.5 overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              isPrimary ? "bg-primary" : "bg-muted-foreground/50"
                            )}
                            style={{ width: `${matchPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>

        <div className="space-y-4 border-t border-border pt-6">
          
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 font-sans">
              <Sparkles size={14} className="text-primary" />
              Recommended Clinician Matchmaking ({matchedSpecialization})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedDoctors.length === 0 ? (
              <div className="col-span-full p-6 bg-card border border-border rounded-2xl text-center text-xs text-muted-foreground leading-relaxed font-sans">
                No specialists are currently scheduled for this specialization.
              </div>
            ) : (
              recommendedDoctors.map((doc, idx) => {
                const docId = doc.id || (doc as any)._id;
                const docAvails = availabilities[docId] || [];
                const totalAvailableSlots = docAvails.reduce((acc: number, curr: any) => acc + curr.slots.filter((s: any) => s.available).length, 0);

                return (
                  <div
                    key={docId}
                    className="flex flex-col justify-between p-6 bg-card border border-border rounded-3xl hover:border-primary/35 hover:shadow-lg transition-all relative text-left"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <svg viewBox="0 0 100 100" className="w-13 h-13 rounded-2xl shadow-md border border-primary/20 shrink-0 select-none bg-primary/10 p-0.5">
                          <defs>
                            <linearGradient id={`matchAvatarGrad_${docId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="var(--primary)" />
                              <stop offset="100%" stopColor="var(--primary)" />
                            </linearGradient>
                          </defs>
                          <rect width="100%" height="100%" fill={`url(#matchAvatarGrad_${docId})`} rx="12" />
                          <circle cx="50" cy="35" r="28" fill="white" opacity="0.12" />
                          <path d="M50 48c8.3 0 15-6.7 15-15s-6.7-15-15-15-15 6.7-15 15 6.7 15 15 15z" fill="white" opacity="0.9" />
                          <path d="M50 54c-16.6 0-30 13.4-30 30v4h60v-4c0-16.6-13.4-30-30-30z" fill="white" opacity="0.85" />
                          <path d="M42 53c0 4.4 3.6 8 8 8s8-3.6 8-8" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.95" />
                          <path d="M50 61v6" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.95" />
                          <circle cx="50" cy="68" r="3" fill="var(--primary)" />
                        </svg>
                        <div className="flex-1 min-w-0 text-left space-y-1">
                          <h4 className="text-sm font-extrabold text-foreground tracking-tight font-sans line-clamp-1">
                            {doc.name}
                          </h4>
                          <div className="inline-block text-[9px] bg-primary/10 text-primary font-extrabold px-2.5 py-0.5 rounded-full font-sans uppercase tracking-wider">
                            {doc.specialization}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1 text-left">
                        <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-sans">Biography</h5>
                        <p className="text-xs text-muted-foreground leading-relaxed font-sans line-clamp-3 min-h-[54px]">
                          {doc.about || "Board-certified clinical specialist dedicated to patient health and comprehensive diagnosis."}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-muted-foreground border-y border-border py-2.5 my-3">
                        <span className="flex items-center gap-1 font-sans">
                          <Briefcase size={12} className="text-primary shrink-0" />
                          <strong className="text-foreground font-semibold">{doc.experience} Years</strong> Exp
                        </span>
                        <span className="flex items-center gap-1 font-sans font-bold text-foreground">
                          <Star size={11} className="text-amber-500 fill-amber-500 shrink-0" />
                          {doc.rating} Rating
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-muted border border-border">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider font-sans">Session Fee</span>
                          <span className="font-extrabold text-primary font-mono text-xs">
                            ${doc.fee}.00
                          </span>
                        </div>

                        <div className="flex gap-1.5 text-[10px] text-muted-foreground leading-normal min-h-[30px] px-0.5">
                          <MapPin size={12} className="text-primary shrink-0 mt-0.5" />
                          <span className="font-sans line-clamp-2">{doc.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-auto border-t border-border space-y-3 w-full">
                      <div className="flex items-start justify-between">
                        <span className="text-[9px] font-bold text-primary uppercase tracking-wider font-sans flex items-center gap-1.5">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
                          </span>
                          {totalAvailableSlots > 0 ? `${totalAvailableSlots} slot openings` : "Slots Available"}
                        </span>
                        <span className="text-[9px] text-muted-foreground font-sans">Primary Match</span>
                      </div>
                      <Button
                        onClick={() => {
                          const initialDate = docAvails.length > 0 ? docAvails[0].date : "";
                          onSelectDoctor(doc, initialDate);
                        }}
                        className="w-full py-3 rounded-xl text-xs font-bold gap-1.5 shadow-md shadow-primary/10 transition-transform active:scale-95 cursor-pointer font-sans h-auto"
                      >
                        <Calendar size={13} />
                        Book Consultation
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
