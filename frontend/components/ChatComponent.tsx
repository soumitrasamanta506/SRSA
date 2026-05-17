"use client";

import { useState, useEffect, useRef } from "react";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { type Message } from "@/components/ui/chat-message";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

import { Stethoscope, RotateCcw, Moon, Sun, Menu, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useQueryClient } from "@tanstack/react-query";

// API Hooks
import {
  useCurrentUser,
  usePatientDashboardData,
  useDoctors,
  useDoctorAvailability,
} from "@/api/queries";
import {
  useAuthMutation,
  useLogoutMutation,
  useCancelAppointmentMutation,
  useSaveReportMutation,
} from "@/api/mutations";

// Subcomponents
import { SidebarPanel } from "./chat-portal/SidebarPanel";
import { ChatPanel } from "./chat-portal/ChatPanel";
import { ReportDashboardPanel } from "./chat-portal/ReportDashboardPanel";
import { AppointmentDetailsPanel } from "./chat-portal/AppointmentDetailsPanel";
import { AuthModal } from "./chat-portal/AuthModal";
import { CancelModal } from "./chat-portal/CancelModal";
import { BookingModal } from "./chat-portal/BookingModal";
import { PaymentDrawer } from "./chat-portal/PaymentDrawer";

import { getSpecializationForDisease } from "@/lib/medical-mapping";
import { useBookingWorkflow } from "@/hooks/use-booking-workflow";
import { useChatWorkflow } from "@/hooks/use-chat-workflow";

export default function ChatComponent() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();

  // --- Queries & Mutations ---
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const { data: dashboardData, isLoading: isDashboardLoading } = usePatientDashboardData(!!currentUser);
  const patientAppointments = dashboardData?.appointments || [];
  const patientReports = dashboardData?.reports || [];

  const authMutation = useAuthMutation();
  const logoutMutation = useLogoutMutation();
  const cancelAppointmentMutation = useCancelAppointmentMutation();
  const saveReportMutation = useSaveReportMutation();

  const {
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
    startOver: chatStartOver,
    handleSubmit
  } = useChatWorkflow();

  const primaryPrediction = predictions[0];
  const matchedSpecialization = primaryPrediction
    ? getSpecializationForDisease(primaryPrediction.disease)
    : "";
  const { data: recommendedDoctors = [] } = useDoctors(matchedSpecialization);
  const [availabilities, setAvailabilities] = useState<any>({});

  // --- UI State ---
  const [activeAppointment, setActiveAppointment] = useState<any>(null);
  const [historySearchQuery, setHistorySearchQuery] = useState("");

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authError, setAuthError] = useState("");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const hasSavedReportRef = useRef(false);

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [apptToCancel, setApptToCancel] = useState<any>(null);

  const {
    selectedBookingDoctor,
    activeBookingDate,
    setActiveBookingDate,
    bookingStep,
    selectedDoctor,
    selectedSlot,
    selectedSlotEnd,
    selectedDate,
    isProcessingPayment,
    startBooking,
    cancelBookingSelection,
    selectSlotAndProceedToPayment,
    handlePaymentSubmit,
    resetBooking,
    setBookingStep,
  } = useBookingWorkflow(currentUser);

  const { containerRef, handleScroll, handleTouchStart } = useAutoScroll([
    messages,
    isLoading,
  ]);

  useEffect(() => {
    setMounted(true);
    if (!document.getElementById("razorpay-checkout-sdk")) {
      const script = document.createElement("script");
      script.id = "razorpay-checkout-sdk";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Fetch slots for loaded doctors
  useEffect(() => {
    if (recommendedDoctors.length > 0) {
      recommendedDoctors.forEach(async (doc: any) => {
        try {
          const docId = doc.id || doc._id;
          if (availabilities[docId]) return;
          const res = await fetch(`/api/doctors/${docId}/availability-slots`, {
            credentials: "include",
          });
          const data = await res.json();
          if (data.success && data.availability) {
            setAvailabilities((prev: any) => ({
              ...prev,
              [docId]: data.availability,
            }));
          }
        } catch (err) {
          console.error("Failed to fetch slots", err);
        }
      });
    }
  }, [recommendedDoctors]);

  // Auto-save report
  useEffect(() => {
    if (isFinal && currentUser && !activeReportId && predictions.length > 0) {
      if (hasSavedReportRef.current) return;
      hasSavedReportRef.current = true;
      
      saveReportMutation.mutate(
        {
          symptoms: extractedSymptoms.map((s) => ({
            name: s.name,
            severity: s.severity || "medium",
            duration: s.duration || "few days",
          })),
          predictions: predictions.map((p) => ({
            disease: p.disease,
            confidence: p.confidence,
          })),
        },
        {
          onSuccess: (data) => setActiveReportId(data.report?._id),
        },
      );
    }
  }, [isFinal, currentUser, predictions, activeReportId]);

  const startOver = () => {
    chatStartOver(() => { hasSavedReportRef.current = false; });
    resetBooking();
    setActiveAppointment(null);
  };

  const loadSavedReport = async (reportId: string) => {
    if (activeReportId === reportId) {
      setIsMobileOpen(false);
      return;
    }
    try {
      setActiveAppointment(null);
      const report = await queryClient.fetchQuery({
        queryKey: ["report", reportId],
        queryFn: async () => {
          const res = await fetch(`/api/report/${reportId}`, {
            credentials: "include",
          });
          const data = await res.json();
          return data.success ? data.report : null;
        },
        staleTime: 1000 * 60 * 60, // Cache for 1 hour
      });

      if (report) {
        setExtractedSymptoms(report.symptoms || []);
        const fullPredictions = [];
        if (report.primaryPrediction) {
          fullPredictions.push(report.primaryPrediction);
        }
        if (report.predictions) {
          fullPredictions.push(...report.predictions);
        }
        setPredictions(fullPredictions);
        setActiveReportId(reportId);
        setIsFinal(true);
        setActiveTab("report");
        setIsMobileOpen(false);
      }
    } catch (err) {
      alert("Error connecting to server to load report.");
    }
  };

  if (isUserLoading || isDashboardLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm font-semibold text-muted-foreground animate-pulse">
            {isUserLoading ? "Initializing Secure Portal..." : "Loading Patient Dashboard..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-2 border-b border-border bg-card/70 backdrop-blur-md z-10 shrink-0 select-none">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileOpen(true)}
            className="md:hidden rounded-lg h-8 w-8 text-muted-foreground mr-1"
          >
            <Menu size={20} />
          </Button>
          <div className="p-1.5 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-lg text-white shadow-md shadow-teal-500/15 shrink-0 hidden sm:flex">
            <Stethoscope size={16} strokeWidth={2.5} />
          </div>
          <h1 className="text-sm font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
            SRSA Clinical Portal
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="rounded-full h-7 w-7 text-muted-foreground"
          >
            {theme === "light" ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        <SidebarPanel
          historySearchQuery={historySearchQuery}
          setHistorySearchQuery={setHistorySearchQuery}
          isFinal={isFinal}
          activeAppointment={activeAppointment}
          startIntake={startOver}
          currentUser={currentUser}
          patientReports={patientReports}
          patientAppointments={patientAppointments}
          activeReportId={activeReportId}
          loadSavedReport={loadSavedReport}
          setActiveAppointment={(appt) => {
            setActiveAppointment(appt);
            setIsMobileOpen(false);
          }}
          onCancelAppointment={(appt) => {
            setApptToCancel(appt);
            setCancelModalOpen(true);
          }}
          onOpenAuth={() => {
            setAuthError("");
            setAuthMode("login");
            setIsAuthModalOpen(true);
          }}
          onLogout={() => logoutMutation.mutate()}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        <div
          className="flex-1 flex flex-col h-full overflow-hidden bg-background"
        >
          {activeAppointment ? (
            <AppointmentDetailsPanel
              activeAppointment={activeAppointment}
              currentUser={currentUser}
              onClose={() => setActiveAppointment(null)}
              onCancelClick={() => {
                setApptToCancel(activeAppointment);
                setCancelModalOpen(true);
              }}
            />
          ) : activeTab === "chat" ? (
            <ChatPanel
              messages={messages}
              isLoading={isLoading}
              isFinal={isFinal}
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              onViewReport={() => setActiveTab("report")}
              containerRef={containerRef}
              handleScroll={handleScroll}
              handleTouchStart={handleTouchStart}
            />
          ) : (
            <ReportDashboardPanel
              activeReportId={activeReportId}
              extractedSymptoms={extractedSymptoms}
              predictions={predictions}
              errorMessage={errorMessage}
              recommendedDoctors={recommendedDoctors}
              availabilities={availabilities}
              matchedSpecialization={matchedSpecialization}
              startOver={startOver}
              onSelectDoctor={(doc, date) => {
                startBooking(doc, date);
              }}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      {isAuthModalOpen && (
        <AuthModal
          initialMode={authMode}
          onClose={() => setIsAuthModalOpen(false)}
          onSubmit={(mode, payload) => {
            const endpoint =
              mode === "login"
                ? "/api/patient/auth/login"
                : "/api/patient/auth/register";
            authMutation.mutate(
              { endpoint, payload },
              {
                onSuccess: () => {
                  setIsAuthModalOpen(false);
                  setAuthError("");
                },
                onError: (err: any) => setAuthError(err.message),
              },
            );
          }}
          isLoading={authMutation.isPending}
          error={authError}
        />
      )}

      {cancelModalOpen && (
        <CancelModal
          apptToCancel={apptToCancel}
          onClose={() => {
            setCancelModalOpen(false);
            setApptToCancel(null);
          }}
          onConfirm={(apptId) => {
            cancelAppointmentMutation.mutate(apptId, {
              onSuccess: () => {
                setCancelModalOpen(false);
                setApptToCancel(null);
                if (activeAppointment?._id === apptId)
                  setActiveAppointment(null);
              },
            });
          }}
        />
      )}

      {selectedBookingDoctor && (
        <BookingModal
          doctor={selectedBookingDoctor}
          activeDate={activeBookingDate}
          setActiveDate={setActiveBookingDate}
          availabilities={
            availabilities[
              selectedBookingDoctor.id || selectedBookingDoctor._id
            ] || []
          }
          onClose={cancelBookingSelection}
          onSelectSlot={(doc, start, end, date) => {
            selectSlotAndProceedToPayment(doc, start, end, date);
          }}
        />
      )}

      {bookingStep !== "idle" && (
        <PaymentDrawer
          bookingStep={bookingStep}
          currentUser={currentUser}
          selectedDoctor={selectedDoctor}
          selectedDate={selectedDate}
          selectedSlot={selectedSlot}
          isProcessingPayment={isProcessingPayment}
          onClose={() => setBookingStep("idle")}
          onPaymentSubmit={(e) => {
            e.preventDefault();
            handlePaymentSubmit();
          }}
          onAuthRequired={() => {
            setAuthError("");
            setAuthMode("login");
            setIsAuthModalOpen(true);
          }}
        />
      )}
    </div>
  );
}
