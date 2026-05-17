import { useState } from "react";

export function useBookingWorkflow(currentUser: any) {
  const [selectedBookingDoctor, setSelectedBookingDoctor] = useState<any>(null);
  const [activeBookingDate, setActiveBookingDate] = useState<string>("");

  const [bookingStep, setBookingStep] = useState<"idle" | "payment" | "confirmed">("idle");
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [selectedSlotEnd, setSelectedSlotEnd] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const startBooking = (doctor: any, date: string) => {
    setSelectedBookingDoctor(doctor);
    setActiveBookingDate(date);
  };

  const cancelBookingSelection = () => {
    setSelectedBookingDoctor(null);
    setActiveBookingDate("");
  };

  const selectSlotAndProceedToPayment = (
    doc: any,
    start: string,
    end: string,
    date: string
  ) => {
    setSelectedDoctor(doc);
    setSelectedSlot(start);
    setSelectedSlotEnd(end);
    setSelectedDate(date);
    setBookingStep("payment");
    setSelectedBookingDoctor(null); // Close booking modal
  };

  const handlePaymentSubmit = async () => {
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
      if (!(window as any).Razorpay) {
        alert("Razorpay Payment Gateway is loading. Please try again.");
        setIsProcessingPayment(false);
        return;
      }

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

  const resetBooking = () => {
    setBookingStep("idle");
    setSelectedDoctor(null);
    setSelectedSlot("");
    setSelectedSlotEnd("");
    setSelectedDate("");
  };

  return {
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
  };
}
