"use client";

import { Search, MessageSquare, Lock, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SidebarPanelProps {
  historySearchQuery: string;
  setHistorySearchQuery: (query: string) => void;
  isFinal: boolean;
  activeAppointment: any;
  startIntake: () => void;
  currentUser: any;
  patientReports: any[];
  patientAppointments: any[];
  activeReportId: string | null;
  loadSavedReport: (id: string) => void;
  setActiveAppointment: (appt: any) => void;
  onCancelAppointment: (appt: any) => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (val: boolean) => void;
}

export function SidebarPanel({
  historySearchQuery,
  setHistorySearchQuery,
  isFinal,
  activeAppointment,
  startIntake,
  currentUser,
  patientReports,
  patientAppointments,
  activeReportId,
  loadSavedReport,
  setActiveAppointment,
  onCancelAppointment,
  onOpenAuth,
  onLogout,
  isMobileOpen,
  setIsMobileOpen
}: SidebarPanelProps) {
  return (
    <>
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden animate-in fade-in" 
          onClick={() => setIsMobileOpen(false)} 
        />
      )}
      <div
        className={cn(
          "fixed md:static inset-y-0 left-0 z-50 w-[80%] max-w-[280px] md:w-[260px] lg:w-[280px] shrink-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col h-full transition-transform duration-300",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
      <div className="p-2 pb-0 shrink-0">
        <div className="relative flex items-center group">
          <Search className="absolute left-2.5 w-3.5 h-3.5 text-sidebar-foreground/40 group-focus-within:text-primary transition-colors" />
          <Input
            type="text"
            placeholder="Search history..."
            value={historySearchQuery}
            onChange={(e) => setHistorySearchQuery(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1.5 h-8 bg-sidebar-accent/30 border-sidebar-border rounded-full text-[11px] focus-visible:ring-primary focus-visible:ring-1 text-sidebar-foreground placeholder:text-sidebar-foreground/30 font-sans shadow-none"
          />
        </div>
      </div>

      <div className="px-2 py-2 space-y-0.5 shrink-0 border-b border-sidebar-border/60">
          <button
          onClick={startIntake}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer active:scale-[0.98]",
            (!isFinal && !activeAppointment && !activeReportId)
              ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
              : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          )}
        >
          <MessageSquare size={14} className="text-primary" />
          <span>Symptom Intake</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 text-left">
        {currentUser ? (
          <div className="space-y-1.5">
            <div className="px-3 text-[10px] font-bold text-sidebar-foreground/40 uppercase tracking-wider">
              Recents
            </div>
            {patientReports.filter((r) => {
              const term = historySearchQuery.toLowerCase();
              const title = (r.primaryPrediction?.disease || "Clinical Diagnosis").toLowerCase();
              return title.includes(term);
            }).length === 0 ? (
              <div className="px-3 py-2 text-[11px] text-sidebar-foreground/50 font-medium leading-relaxed font-sans">
                {historySearchQuery ? "No matching history." : "Intake history is empty."}
              </div>
            ) : (
              <div className="space-y-0.5">
                {patientReports
                  .filter((r) => {
                    const term = historySearchQuery.toLowerCase();
                    const title = (r.primaryPrediction?.disease || "Clinical Diagnosis").toLowerCase();
                    return title.includes(term);
                  })
                  .map((report, idx) => (
                    <button
                      key={report._id}
                      onClick={() => loadSavedReport(report._id)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-all text-left group cursor-pointer",
                        activeReportId === report._id && !activeAppointment
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                          : "text-sidebar-foreground/60 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
                      )}
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <span className="truncate flex-1 pr-2 font-sans">
                        {report.primaryPrediction?.disease || "Clinical Diagnosis"}
                      </span>
                    </button>
                  ))}
              </div>
            )}

            {patientAppointments.length > 0 && (
              <div className="pt-4 mt-2 border-t border-sidebar-border/60 space-y-1.5">
                <div className="px-3 text-[10px] font-bold text-sidebar-foreground/40 uppercase tracking-wider">
                  Appointments
                </div>
                <div className="space-y-1">
                  {patientAppointments.map((appt, idx) => (
                    <div
                      key={appt._id}
                      onClick={() => setActiveAppointment(appt)}
                      className={cn(
                        "px-3 py-2 rounded-lg border border-sidebar-border space-y-1 font-sans cursor-pointer transition-all",
                        activeAppointment?._id === appt._id
                          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm font-semibold"
                          : "bg-sidebar-accent/30 hover:bg-sidebar-accent/60"
                      )}
                    >
                      <div className="flex justify-between items-center text-xs font-bold text-sidebar-foreground">
                        <span className="truncate max-w-[120px]">{appt.doctorId?.name || "General Practitioner"}</span>
                        <span className="text-[8px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded-md">Slot</span>
                      </div>
                      <div className="flex justify-between items-center text-[9px] text-sidebar-foreground/50">
                        <span>{new Date(appt.appointmentDate).toLocaleDateString()} @ {appt.startTime}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCancelAppointment(appt);
                          }}
                          className="text-destructive hover:text-destructive/80 cursor-pointer font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 bg-sidebar-accent/20 border border-sidebar-border rounded-xl space-y-2.5 mx-1.5 mt-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Lock size={14} />
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-sidebar-foreground font-sans">Unlock Clinical Vault</h4>
              <p className="text-[10px] text-sidebar-foreground/50 leading-normal mt-0.5 font-sans">
                Access diagnostic records, scheduled appointments, and clinical specialist logs securely.
              </p>
            </div>
            <Button
              onClick={onOpenAuth}
              className="w-full py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-[10px] font-bold cursor-pointer transition-transform active:scale-95 font-sans shadow-md shadow-primary/5 h-auto"
            >
              Sign In / Register
            </Button>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-sidebar-border bg-sidebar shrink-0">
        {currentUser ? (
          <div className="flex items-center justify-between p-2 rounded-xl bg-sidebar-accent/30 border border-sidebar-border select-none">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0 uppercase font-sans">
                {currentUser.name ? currentUser.name[0] : "P"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-sidebar-foreground truncate leading-none font-sans">
                  {currentUser.name}
                </p>
                <p className="text-[9px] text-primary font-semibold mt-0.5 leading-none font-sans">
                  Clinical Patient
                </p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-1 text-sidebar-foreground/40 hover:text-destructive transition-colors cursor-pointer shrink-0"
              title="Sign Out"
            >
              <LogOut size={13} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-sidebar-accent/20 border border-sidebar-border text-sidebar-foreground/50 select-none">
            <div className="w-7 h-7 rounded-full bg-sidebar-accent/50 flex items-center justify-center shrink-0">
              <User size={13} className="text-sidebar-foreground/40" />
            </div>
            <span className="text-[11px] font-medium truncate font-sans">Guest Session</span>
          </div>
        )}
      </div>
      </div>
    </>
  );
}
