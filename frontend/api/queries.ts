import { useQuery } from "@tanstack/react-query";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const response = await fetch("/api/patient/auth/me", { credentials: "include" });
      const data = await response.json();
      return data.success ? data.patient : null;
    },
    retry: false,
  });
}

export function usePatientDashboardData(isEnabled: boolean) {
  return useQuery({
    queryKey: ["patientDashboardData"],
    queryFn: async () => {
      const [apptsRes, reportsRes] = await Promise.all([
        fetch("/api/appointments/patient?type=upcoming", { credentials: "include" }),
        fetch("/api/report/my", { credentials: "include" })
      ]);
      const apptsData = await apptsRes.json();
      const reportsData = await reportsRes.json();
      
      return {
        appointments: apptsData.success ? apptsData.appointments : [],
        reports: reportsData.success ? reportsData.reports : []
      };
    },
    enabled: isEnabled,
  });
}

export function useDoctors(specialization: string) {
  return useQuery({
    queryKey: ["doctors", specialization],
    queryFn: async () => {
      if (!specialization) return [];
      const res = await fetch(`/api/doctors?specialization=${encodeURIComponent(specialization)}`, { credentials: "include" });
      const data = await res.json();
      if (data.success && data.doctors) {
        return data.doctors.map((dbDoc: any) => ({
          id: dbDoc._id || dbDoc.id,
          name: dbDoc.name,
          specialization: dbDoc.specialization,
          experience: dbDoc.experience || 0,
          rating: dbDoc.rating || 4.7,
          reviews: dbDoc.totalReviews || 12,
          fee: dbDoc.consultation_fee || 150,
          slots: ['09:00 AM', '10:30 AM', '02:00 PM', '04:30 PM'],
          location: dbDoc.location ? `${dbDoc.location.address}, ${dbDoc.location.city}` : "Medical Plaza, City Center",
          about: dbDoc.bio || "Board-certified clinical specialist dedicated to patient health and comprehensive diagnosis."
        }));
      }
      return [];
    },
    enabled: !!specialization,
  });
}

export function useDoctorAvailability(doctorId: string) {
  return useQuery({
    queryKey: ["doctorAvailability", doctorId],
    queryFn: async () => {
      if (!doctorId) return [];
      const res = await fetch(`/api/doctors/${doctorId}/availability-slots`, { credentials: "include" });
      const data = await res.json();
      return data.success ? data.availability : [];
    },
    enabled: !!doctorId,
  });
}

export function useReport(reportId: string | null) {
  return useQuery({
    queryKey: ["report", reportId],
    queryFn: async () => {
      if (!reportId) return null;
      const res = await fetch(`/api/report/${reportId}`, { credentials: "include" });
      const data = await res.json();
      return data.success ? data.report : null;
    },
    enabled: !!reportId,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}
