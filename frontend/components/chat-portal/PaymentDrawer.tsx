"use client";

import { X, CreditCard, Activity, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaymentDrawerProps {
  bookingStep: "payment" | "confirmed";
  currentUser: any;
  selectedDoctor: any;
  selectedDate: string;
  selectedSlot: string;
  isProcessingPayment: boolean;
  onClose: () => void;
  onPaymentSubmit: (e: React.FormEvent) => void;
  onAuthRequired: () => void;
}

export function PaymentDrawer({
  bookingStep,
  currentUser,
  selectedDoctor,
  selectedDate,
  selectedSlot,
  isProcessingPayment,
  onClose,
  onPaymentSubmit,
  onAuthRequired
}: PaymentDrawerProps) {
  return (
    <div 
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-card border border-border rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4 text-left animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        
        {bookingStep === "payment" ? (
          <div className="space-y-4">
            <div className="flex justify-between items-start pb-2 border-b border-border">
              <div className="duration-300">
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5 font-sans">
                  SECURE CLINICAL CHECKOUT
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5 font-sans">Authorize slot hold and payment</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            {!currentUser && (
              <div className="space-y-4 border-t border-border pt-4">
                <div className="bg-primary/10 p-3 rounded-2xl border border-primary/20">
                  <p className="text-[10px] text-primary font-bold font-sans">Authentication Required</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5 leading-normal font-sans">
                    Sign in or register your Patient Profile to book, schedule, and receive clinical verification.
                  </p>
                </div>
                <Button
                  onClick={onAuthRequired}
                  className="w-full py-4.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/10 cursor-pointer text-xs font-sans transition-transform active:scale-95"
                >
                  Sign In / Register to Continue
                </Button>
              </div>
            )}

            {currentUser && selectedDoctor && (
              <form onSubmit={onPaymentSubmit} className="space-y-4">
                <div className="p-4 bg-muted border border-border rounded-2xl space-y-2.5 font-mono text-[11px] leading-relaxed">
                  <p className="font-bold text-foreground text-xs border-b border-border pb-1.5 font-sans">Appt Booking Summary</p>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-sans">DOCTOR:</span>
                    <span className="font-bold text-foreground font-sans">{selectedDoctor.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-sans">SPECIALTY:</span>
                    <span className="font-bold text-foreground font-sans">{selectedDoctor.specialization}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-sans">DATE / SLOT:</span>
                    <span className="font-bold text-foreground font-mono">{selectedDate || "Today"}, {selectedSlot}</span>
                  </div>
                  <div className="flex justify-between border-t border-dashed border-border pt-2.5 mt-1 text-xs">
                    <span className="font-bold text-foreground font-sans">CONSULTATION FEE:</span>
                    <span className="font-bold text-primary font-mono">${selectedDoctor.fee}.00</span>
                  </div>
                </div>

                <div className="border-t border-border pt-2.5 flex justify-between items-center text-xs font-sans">
                  <span className="text-muted-foreground">Authorized Patient:</span>
                  <span className="font-bold text-foreground">{currentUser.name}</span>
                </div>

                <Button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="w-full py-5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/10 cursor-pointer disabled:opacity-50 text-xs font-sans transition-transform active:scale-95"
                >
                  {isProcessingPayment ? (
                    <>
                      <Activity className="w-4.5 h-4.5 animate-spin" />
                      Holding Slot & Opening Gateway...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Authorize Slot Hold & Pay Now
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <div className="flex flex-col items-center py-2">
              <div className="w-12 h-12 bg-primary/15 text-primary rounded-full flex items-center justify-center mb-3 scale-110">
                <CheckCircle2 size={24} strokeWidth={2.5}  />
              </div>
              <h4 className="text-sm font-bold text-foreground font-sans">
                Appointment Confirmed!
              </h4>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-sans">
                Clinical consultation schedule finalized.
              </p>
            </div>

            <div className="text-left border-y border-dashed border-border py-4 my-2 space-y-3 font-mono text-[11px] leading-relaxed">
              <div className="flex justify-between">
                <span className="text-muted-foreground font-sans">BOOKING ID:</span>
                <span className="font-bold text-foreground font-mono">SRSA-{Math.floor(100000 + Math.random() * 900000)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-sans">PATIENT:</span>
                <span className="font-bold text-foreground truncate max-w-[200px] font-sans">{currentUser?.name || "Guest Patient"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-sans">CLINICIAN:</span>
                <span className="font-bold text-foreground font-sans">{selectedDoctor?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-sans">SPECIALTY:</span>
                <span className="font-bold text-foreground font-sans">{selectedDoctor?.specialization}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-sans">SCHEDULE:</span>
                <span className="font-bold text-foreground font-sans">{selectedDate || "Today"}, {selectedSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-sans">ROOM / LINK:</span>
                <span className="font-bold text-foreground font-sans">Clinic Room A-102 / Telehealth</span>
              </div>
              <div className="flex justify-between border-t border-dashed border-border pt-2.5 mt-2">
                <span className="font-bold text-foreground font-sans">TRANSACTION STATUS:</span>
                <span className="text-primary font-bold font-mono">PAID (${selectedDoctor?.fee}.00)</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1 py-4.5 rounded-xl font-bold cursor-pointer text-xs font-sans transition-transform active:scale-95"
              >
                Return to Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
