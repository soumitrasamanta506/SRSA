"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CancelModalProps {
  apptToCancel: any;
  onClose: () => void;
  onConfirm: (apptId: string) => void;
}

export function CancelModal({ apptToCancel, onClose, onConfirm }: CancelModalProps) {
  if (!apptToCancel) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-sm bg-card rounded-3xl border border-border shadow-2xl p-6 overflow-hidden text-left animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-4">
          <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center">
            <X className="w-6 h-6" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-foreground font-sans">
              Cancel Consultation?
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed font-sans">
              Are you sure you want to cancel your consultation with <strong className="text-foreground">{apptToCancel.doctorId?.name || "your specialist"}</strong> scheduled for <strong className="text-foreground">{new Date(apptToCancel.appointmentDate).toLocaleDateString()} @ {apptToCancel.startTime}</strong>?
              <br /><br />
              This action will release your scheduled time slot, and your reservation will be permanently deleted.
            </p>
          </div>

          <div className="flex gap-2.5 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 py-3 border border-border text-xs font-semibold text-foreground hover:bg-accent cursor-pointer font-sans transition-transform active:scale-95 rounded-xl h-auto"
            >
              Keep Appointment
            </Button>
            <Button
              variant="destructive"
              onClick={() => onConfirm(apptToCancel._id)}
              className="flex-1 py-3 bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-bold cursor-pointer font-sans transition-transform active:scale-95 border-0 shadow-md rounded-xl h-auto"
            >
              Confirm Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
