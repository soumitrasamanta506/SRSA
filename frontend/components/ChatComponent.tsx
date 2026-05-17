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

const getSpecializationForDisease = (disease: string): string => {
  const d = disease.toLowerCase();
  if (
    d.includes("heart") ||
    d.includes("hypertension") ||
    d.includes("cardio") ||
    d.includes("artery")
  )
    return "Cardiologist";
  if (
    d.includes("acne") ||
    d.includes("psoriasis") ||
    d.includes("eczema") ||
    d.includes("fungal") ||
    d.includes("skin") ||
    d.includes("dermat")
  )
    return "Dermatologist";
  if (
    d.includes("migraine") ||
    d.includes("stroke") ||
    d.includes("neurology") ||
    d.includes("brain") ||
    d.includes("headache")
  )
    return "Neurologist";
  if (
    d.includes("gerd") ||
    d.includes("ulcer") ||
    d.includes("stomach") ||
    d.includes("gastro") ||
    d.includes("abdominal")
  )
    return "Gastroenterologist";
  if (
    d.includes("asthma") ||
    d.includes("copd") ||
    d.includes("pneumonia") ||
    d.includes("lung") ||
    d.includes("bronchitis")
  )
    return "Pulmonologist";
  if (
    d.includes("diabetes") ||
    d.includes("thyroid") ||
    d.includes("hormone") ||
    d.includes("endo")
  )
    return "Endocrinologist";
  if (
    d.includes("joint") ||
    d.includes("arthritis") ||
    d.includes("bone") ||
    d.includes("rheumat")
  )
    return "Rheumatologist";
  if (d.includes("allergy") || d.includes("allergic") || d.includes("immune"))
    return "Allergist / Immunologist";
  return "General Physician";
};

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

  // --- Chat State ---
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm your SRSA Health AI assistant. Please describe your symptoms in detail, and I'll help analyze them.",
      createdAt: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFinal, setIsFinal] = useState(false);

  // --- Health Intelligence State ---
  const [extractedSymptoms, setExtractedSymptoms] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showDemoTrigger, setShowDemoTrigger] = useState(false);

  // --- Doctors & Slots Data ---
  const primaryPrediction = predictions[0];
  const matchedSpecialization = primaryPrediction
    ? getSpecializationForDisease(primaryPrediction.disease)
    : "";
  const { data: recommendedDoctors = [] } = useDoctors(matchedSpecialization);
  const [availabilities, setAvailabilities] = useState<any>({});

  // --- UI State ---
  const [activeTab, setActiveTab] = useState("chat");
  const [activeAppointment, setActiveAppointment] = useState<any>(null);
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [historySearchQuery, setHistorySearchQuery] = useState("");

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authError, setAuthError] = useState("");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const hasSavedReportRef = useRef(false);

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [apptToCancel, setApptToCancel] = useState<any>(null);

  const [selectedBookingDoctor, setSelectedBookingDoctor] = useState<any>(null);
  const [activeBookingDate, setActiveBookingDate] = useState<string>("");

  const [bookingStep, setBookingStep] = useState<
    "idle" | "payment" | "confirmed"
  >("idle");
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [selectedSlotEnd, setSelectedSlotEnd] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

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
    setMessages([
      {
        id: "welcome-" + Date.now(),
        role: "assistant",
        content:
          "Hello! I'm your SRSA Health AI assistant. Please describe your symptoms in detail, and I'll help analyze them.",
        createdAt: new Date(),
      },
    ]);
    setIsFinal(false);
    setActiveAppointment(null);
    setExtractedSymptoms([]);
    setPredictions([]);
    setErrorMessage("");
    setShowDemoTrigger(false);
    setBookingStep("idle");
    setActiveTab("chat");
    hasSavedReportRef.current = false;
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

  const simulateDemoFlow = () => {
    setIsFinal(true);
    setExtractedSymptoms([
      { name: "cough", severity: "high", duration: "3 days" },
      { name: "fever", severity: "high", duration: "3 days" },
      { name: "shortness of breath", severity: "high", duration: "1 day" },
      { name: "chest tightness", severity: "medium", duration: "1 day" },
      { name: "chills", severity: "medium", duration: "2 days" },
    ]);
    setPredictions([
      { disease: "Bronchitis", confidence: 88.5 },
      { disease: "Influenza (Flu)", confidence: 76.2 },
      { disease: "Common Cold", confidence: 45.1 },
    ]);
    setErrorMessage("");
    setShowDemoTrigger(false);
    setActiveTab("report");

    setMessages((prev) => [
      ...prev,
      {
        id: "demo-complete",
        role: "assistant",
        content: `### Demo Clinical Profile Ready\n\nI have generated a simulated clinical profile for a standard respiratory case (Bronchitis simulation).\n\n**Simulated Diagnostic Conditions:**\n- **Bronchitis**: 88.5% match\n- **Influenza (Flu)**: 76.2% match\n- **Common Cold**: 45.1% match\n\nPlease refer to the **Diagnostic Report** panel/tab to select an available time slot with our recommended pulmonologist.`,
        createdAt: new Date(),
      },
    ]);
  };

  const handleSubmit = async () => {
    if (!input.trim() || isLoading || isFinal) return;
    const messageToSend = input;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "user",
        content: messageToSend,
        createdAt: new Date(),
      },
    ]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageToSend }),
        credentials: "include",
      });

      const data = await response.json();
      if (data.success) {
        if (data.type === "final" || data.type === "final_error") {
          setIsFinal(true);
          setExtractedSymptoms(data.extracted || []);
          setPredictions(data.predictions || []);
          setErrorMessage(data.type === "final_error" ? data.message : "");
          setShowDemoTrigger(false);
          setActiveTab("report");

          const content =
            data.type === "final"
              ? `### Analysis Complete\n\nI have successfully compiled your symptom intake profile and run our machine learning models.\n\n**Predicted Conditions:**\n${data.predictions.map((p: any) => `- **${p.disease}**: ${p.confidence}% match`).join("\n")}\n\n*Please refer to the "Diagnostic Report" tab/panel on your screen.*`
              : `### Symptom Summary\n${data.extracted.map((s: any) => `- **${s.name}** (Severity: *${s.severity}*, Duration: *${s.duration}*)`).join("\n")}\n\n⚠️ **Analysis Warning:** ${data.message}`;

          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              role: "assistant",
              content,
              createdAt: new Date(),
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              role: "assistant",
              content: data.message,
              createdAt: new Date(),
            },
          ]);
        }
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setShowDemoTrigger(true);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content:
            "I'm having trouble connecting to the medical analysis engine. Please ensure your servers are running, or click 'Simulate Diagnostics' below to evaluate the portal using standard simulation parameters.",
          createdAt: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor || !selectedSlot) return;
    setIsProcessingPayment(true);

    try {
      let endTime = selectedSlotEnd;
      let startTime = selectedSlot;
      let appointmentDate =
        selectedDate || new Date().toISOString().split("T")[0];

      if (!endTime) {
        const parts = startTime.split(" ");
        let [hStr, mStr] = parts[0].split(":");
        let h = parseInt(hStr, 10);
        if (h === 12 && parts[1] === "AM") h = 0;
        else if (h !== 12 && parts[1] === "PM") h += 12;
        startTime = `${h.toString().padStart(2, "0")}:${mStr}`;

        let em = parseInt(mStr) + 30;
        let eh = h;
        if (em >= 60) {
          em -= 60;
          eh += 1;
        }
        endTime = `${eh.toString().padStart(2, "0")}:${em.toString().padStart(2, "0")}`;
      }

      const holdResponse = await fetch("/api/appointments/hold-slot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: selectedDoctor.id || selectedDoctor._id,
          appointmentDate,
          startTime,
          endTime,
        }),
        credentials: "include",
      });
      const holdData = await holdResponse.json();

      if (!holdData.success) {
        setIsProcessingPayment(false);
        return alert(holdData.message || "Failed to hold appointment slot.");
      }

      const { appointment, order } = holdData;
      if (!(window as any).Razorpay)
        return alert("Razorpay Payment Gateway is loading. Please try again.");

      const options = {
        key: "rzp_test_SqVobajkoYD98m",
        amount: order.amount,
        currency: order.currency,
        name: "SRSA Clinical Portal",
        description: `Consultation Booking - ${selectedDoctor.name}`,
        order_id: order.id,
        handler: async (response: any) => {
          setIsProcessingPayment(true);
          try {
            const verifyRes = await fetch("/api/appointments/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                appointmentId: appointment._id,
              }),
              credentials: "include",
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setBookingStep("confirmed");
            } else {
              alert(verifyData.message || "Payment verification failed.");
            }
          } catch (err) {
            alert("Error connecting to payment verification service.");
          } finally {
            setIsProcessingPayment(false);
          }
        },
        prefill: {
          name: currentUser?.name || "Patient",
          email: currentUser?.email || "patient@srsa.com",
          contact: currentUser?.phone || "9999999999",
        },
        theme: { color: "#10b981" },
        modal: { ondismiss: () => setIsProcessingPayment(false) },
      };

      new (window as any).Razorpay(options).open();
    } catch (err) {
      setIsProcessingPayment(false);
      alert("An error occurred during booking. Please try again.");
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
          startIntake={() => {
            setIsFinal(false);
            setBookingStep("idle");
            setActiveAppointment(null);
            setActiveReportId(null);
            setIsMobileOpen(false);
            setActiveTab("chat");
            setPredictions([]);
            setExtractedSymptoms([]);
            hasSavedReportRef.current = false;
          }}
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
          ) : !isFinal ? (
            <ChatPanel
              messages={messages}
              isLoading={isLoading}
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              showDemoTrigger={showDemoTrigger}
              setShowDemoTrigger={setShowDemoTrigger}
              simulateDemoFlow={simulateDemoFlow}
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
                setSelectedBookingDoctor(doc);
                setActiveBookingDate(date);
              }}
              getSpecializationForDisease={getSpecializationForDisease}
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
          onClose={() => {
            setSelectedBookingDoctor(null);
            setActiveBookingDate("");
          }}
          onSelectSlot={(doc, start, end, date) => {
            setSelectedDoctor(doc);
            setSelectedSlot(start);
            setSelectedSlotEnd(end);
            setSelectedDate(date);
            setBookingStep("payment");
            setSelectedBookingDoctor(null);
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
          onPaymentSubmit={handlePaymentSubmit}
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
