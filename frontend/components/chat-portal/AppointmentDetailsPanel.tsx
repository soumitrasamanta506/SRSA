"use client";

import { User, Star, DollarSign, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppointmentDetailsPanelProps {
  activeAppointment: any;
  currentUser: any;
  onClose: () => void;
  onCancelClick: () => void;
}

export function AppointmentDetailsPanel({
  activeAppointment,
  currentUser,
  onClose,
  onCancelClick
}: AppointmentDetailsPanelProps) {
  if (!activeAppointment) return null;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative items-stretch bg-background">
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-6">
        
        {/* Header Card */}
        <div className="p-5 border border-border bg-card rounded-2xl flex items-center justify-between shadow-sm w-full">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-xl shrink-0">
              <BookOpen size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                Appointment Confirmation
              </h2>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-sans">
                Scheduled specialist consultation & verified receipt
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl border-border text-[10px] font-semibold py-1 px-3 cursor-pointer transition-transform active:scale-95"
          >
            Close Details
          </Button>
        </div>
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 text-left">
              <User size={14} className="text-primary" />
              Consultation Details
            </h3>
            
            <div className="p-6 bg-card border border-border rounded-2xl space-y-5 shadow-sm">
              <div className="flex items-start gap-4">
                <svg viewBox="0 0 100 100" className="w-12 h-12 rounded-full shadow-sm border border-primary/20 shrink-0 select-none">
                  <defs>
                    <linearGradient id="receiptAvatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="var(--primary)" />
                      <stop offset="100%" stopColor="var(--primary)" />
                    </linearGradient>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#receiptAvatarGrad)" />
                  <circle cx="50" cy="35" r="28" fill="white" opacity="0.12" />
                  <path d="M50 48c8.3 0 15-6.7 15-15s-6.7-15-15-15-15 6.7-15 15 6.7 15 15 15z" fill="white" opacity="0.9" />
                  <path d="M50 54c-16.6 0-30 13.4-30 30v4h60v-4c0-16.6-13.4-30-30-30z" fill="white" opacity="0.85" />
                  <path d="M42 53c0 4.4 3.6 8 8 8s8-3.6 8-8" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.95" />
                  <path d="M50 61v6" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.95" />
                  <circle cx="50" cy="68" r="3" fill="var(--primary)" />
                </svg>
                <div className="space-y-1 text-left">
                  <h4 className="text-sm font-bold text-foreground">
                    {activeAppointment.doctorId?.name || "General Specialist"}
                  </h4>
                  <p className="text-xs text-primary font-semibold font-sans">
                    {activeAppointment.doctorId?.specialization || "Clinical Specialist"}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded font-medium">
                      Exp: {activeAppointment.doctorId?.experience || 5}+ yrs
                    </span>
                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-medium font-sans">
                      <span className="flex items-center gap-0.5">
                        <Star size={10} className="text-amber-500 fill-amber-500 shrink-0" />
                        {activeAppointment.doctorId?.rating || "4.9"}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <hr className="border-border" />

              <div className="space-y-3 text-left">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-sans">Scheduled Date:</span>
                  <span className="font-bold text-foreground font-sans">
                    {new Date(activeAppointment.appointmentDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-sans">Time Slot:</span>
                  <span className="font-bold text-foreground font-sans">
                    {activeAppointment.startTime} - {activeAppointment.endTime || "Slot Duration"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-sans">Consultation Type:</span>
                  <span className="font-semibold text-foreground font-sans">
                    In-Clinic Consultation
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-sans">Clinic Location:</span>
                  <span className="font-semibold text-foreground font-sans">
                    {activeAppointment.doctorId?.location && typeof activeAppointment.doctorId.location === "object"
                      ? `${activeAppointment.doctorId.location.address || ""}, ${activeAppointment.doctorId.location.city || ""}`
                      : activeAppointment.doctorId?.location || "Clinic Room 3A, Level 2"}
                  </span>
                </div>
              </div>

              <hr className="border-border" />

              <div className="pt-1.5 flex gap-2">
                <Button
                  variant="destructive"
                  onClick={onCancelClick}
                  className="flex-1 gap-1.5 h-8.5 rounded-xl text-[10px] font-bold bg-destructive/10 hover:bg-destructive text-destructive hover:text-destructive-foreground border border-destructive/20 transition-all font-sans cursor-pointer active:scale-95 shadow-sm"
                >
                  Cancel Appointment
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 text-left">
              <DollarSign size={14} className="text-primary" />
              Payment Receipt & Invoice
            </h3>
            
            <div className="p-6 bg-card text-card-foreground border border-border rounded-2xl space-y-5 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
              
              <div className="flex justify-between items-start text-left">
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider font-sans">Receipt ID</p>
                  <p className="text-xs font-semibold text-foreground/80 font-mono mt-0.5">
                    REC-{activeAppointment._id?.substring(0, 8).toUpperCase() || "INTAKE-SLOT"}
                  </p>
                </div>
                <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-sans">
                  Paid
                </span>
              </div>

              <hr className="border-border" />

              <div className="space-y-3.5 text-left text-xs font-sans">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Authorized Patient:</span>
                  <span className="font-semibold text-foreground">{currentUser?.name || "Patient"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Registered Email:</span>
                  <span className="font-medium text-foreground/80">{currentUser?.email || "Email"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Booking Reference:</span>
                  <span className="font-mono text-foreground/80">SRSA-{activeAppointment._id?.substring(8, 14).toUpperCase() || "PAYMENT"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Payment Channel:</span>
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    💳 Digital Secure Pay
                  </span>
                </div>
              </div>

              <hr className="border-border" />

              <div className="space-y-2 text-left font-sans">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Consultation Hold Charge:</span>
                  <span className="font-medium text-foreground/85">${(activeAppointment.doctorId?.fee || 120).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Digital Gateway Fee:</span>
                  <span className="font-medium text-foreground/85">$0.00</span>
                </div>
                <div className="flex justify-between items-center pt-2.5 border-t border-border text-sm">
                  <span className="font-bold text-foreground">Total Amount Charged:</span>
                  <span className="font-bold text-primary font-mono">
                    ${(activeAppointment.doctorId?.fee || 120).toFixed(2)}
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
