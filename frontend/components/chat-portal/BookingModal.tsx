"use client";

import { useState } from "react";
import { X, Star, Calendar, MapPin, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BookingModalProps {
  doctor: any;
  activeDate: string;
  setActiveDate: (date: string) => void;
  availabilities: any[];
  onClose: () => void;
  onSelectSlot: (doctor: any, start: string, end: string, date: string) => void;
}

export function BookingModal({ doctor, activeDate, setActiveDate, availabilities, onClose, onSelectSlot }: BookingModalProps) {
  const [mobileStep, setMobileStep] = useState<1 | 2>(activeDate ? 2 : 1);
  if (!doctor) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl bg-card rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col md:flex-row h-[85vh] md:h-[550px] text-left animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1.5 bg-background/50 backdrop-blur-sm rounded-full hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        {/* Left Column: Doctor Info Summary & Day Selector */}
        <div className={cn(
          "w-full md:w-1/2 p-6 flex-col justify-between border-b md:border-b-0 md:border-r border-border text-left bg-muted/50 overflow-y-auto h-full",
          mobileStep === 1 ? "flex" : "hidden md:flex"
        )}>
          <div className="space-y-4">
            <div className="flex items-start gap-3.5">
              <svg viewBox="0 0 100 100" className="w-11 h-11 rounded-full shadow-sm border border-primary/20 shrink-0 select-none">
                <defs>
                  <linearGradient id="modalAvatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--primary)" />
                    <stop offset="100%" stopColor="var(--primary)" />
                  </linearGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#modalAvatarGrad)" />
                <circle cx="50" cy="35" r="28" fill="white" opacity="0.12" />
                <path d="M50 48c8.3 0 15-6.7 15-15s-6.7-15-15-15-15 6.7-15 15 6.7 15 15 15z" fill="white" opacity="0.9" />
                <path d="M50 54c-16.6 0-30 13.4-30 30v4h60v-4c0-16.6-13.4-30-30-30z" fill="white" opacity="0.85" />
                <path d="M42 53c0 4.4 3.6 8 8 8s8-3.6 8-8" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.95" />
                <path d="M50 61v6" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.95" />
                <circle cx="50" cy="68" r="3" fill="var(--primary)" />
              </svg>
              <div className="flex-1 min-w-0 text-left text-foreground">
                <h4 className="text-sm font-extrabold tracking-tight font-sans">
                  {doctor.name}
                </h4>
                <div className="inline-block text-[8px] bg-primary/10 text-primary font-extrabold px-1.5 py-0.5 rounded font-sans uppercase tracking-wider mt-0.5">
                  {doctor.specialization}
                </div>
                <div className="flex items-center gap-2 text-[9px] text-muted-foreground font-sans mt-1">
                  <span>{doctor.experience} Years Exp</span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5 font-bold text-foreground">
                    <Star size={9} className="text-amber-500 fill-amber-500 shrink-0" />
                    {doctor.rating}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2 rounded-xl bg-card border border-border flex flex-col">
                <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider font-sans">Duration</span>
                <span className="text-xs font-bold text-foreground mt-0.5">30 mins</span>
              </div>
              <div className="p-2 rounded-xl bg-card border border-border flex flex-col">
                <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider font-sans">Specialist Fee</span>
                <span className="text-xs font-extrabold text-primary font-mono mt-0.5">${doctor.fee}.00</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <h5 className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider font-sans">
                Select Available Date
              </h5>
              <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1">
                {(availabilities || []).map((day: any) => {
                  const availableSlots = day.slots.filter((s: any) => s.available);
                  if (availableSlots.length === 0) return null;
                  
                  const dateObj = new Date(day.date + "T00:00:00");
                  const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });
                  const dayDate = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  const isSelected = activeDate === day.date;

                  return (
                    <button
                      key={day.date}
                      type="button"
                      onClick={() => {
                        setActiveDate(day.date);
                        setMobileStep(2);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between p-2.5 rounded-xl border text-[11px] font-semibold font-sans cursor-pointer transition-all",
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-card text-foreground border-border hover:bg-accent"
                      )}
                    >
                      <span>{dayName}, {dayDate}</span>
                      <span className={cn(
                        "text-[9px] font-extrabold px-1.5 py-0.5 rounded",
                        isSelected
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-primary/10 text-primary"
                      )}>
                        {availableSlots.length} slots
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          
          <div className="flex gap-1.5 text-[9px] text-muted-foreground pt-3 border-t border-border items-center">
            <MapPin size={11} className="text-primary shrink-0" />
            <span className="font-sans line-clamp-1">{doctor.location}</span>
          </div>
        </div>

        {/* Right Column: Time Slot Selection */}
        <div className={cn(
          "flex-1 p-6 pt-10 md:pt-6 flex-col h-full overflow-hidden text-left relative bg-card",
          mobileStep === 2 ? "flex" : "hidden md:flex"
        )}>
          <div className="flex flex-col h-full justify-between">
            <div className="space-y-4 overflow-hidden flex flex-col flex-1">
              <div>
                <div className="flex items-center gap-2 mb-2 md:hidden">
                  <button 
                    onClick={() => setMobileStep(1)}
                    className="p-1 rounded-full hover:bg-accent text-muted-foreground transition-colors -ml-1"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-xs font-bold text-foreground font-sans">Back to Dates</span>
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-sans">
                  Available Timeslots
                </h3>
                <p className="text-[10px] text-muted-foreground font-semibold font-sans mt-0.5">
                  {activeDate ? (
                    `Consultation sessions for ${new Date(activeDate + "T00:00:00").toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric' })}`
                  ) : (
                    "Please select a date on the left"
                  )}
                </p>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1.5 pb-2">
                {(() => {
                  if (!activeDate) {
                    return (
                      <div className="h-full flex items-center justify-center text-xs text-muted-foreground font-sans">
                        Select a calendar date to view slots
                      </div>
                    );
                  }

                  const dayAvail = (availabilities || []).find((d: any) => d.date === activeDate);
                  if (!dayAvail || dayAvail.slots.filter((s: any) => s.available).length === 0) {
                    return (
                      <div className="h-full flex items-center justify-center text-xs text-muted-foreground font-sans">
                        No slot openings on this day
                      </div>
                    );
                  }

                  return dayAvail.slots.map((slot: any) => {
                    if (!slot.available) return null;

                    const formatTime24to12 = (time24: string) => {
                      const [hStr, mStr] = time24.split(":");
                      let h = parseInt(hStr, 10);
                      const ampm = h >= 12 ? "PM" : "AM";
                      h = h % 12;
                      if (h === 0) h = 12;
                      return `${h.toString().padStart(2, "0")}:${mStr} ${ampm}`;
                    };
                    const displayTime = formatTime24to12(slot.startTime);

                    return (
                      <button
                        key={slot.startTime}
                        type="button"
                        onClick={() => {
                          onSelectSlot(doctor, slot.startTime, slot.endTime, activeDate);
                        }}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border text-xs font-semibold hover:border-primary hover:bg-accent cursor-pointer font-sans transition-all active:scale-[0.98] text-foreground bg-card"
                      >
                        <span>{displayTime}</span>
                        <span className="text-[10px] text-primary font-bold">Select Slot</span>
                      </button>
                    );
                  });
                })()}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
