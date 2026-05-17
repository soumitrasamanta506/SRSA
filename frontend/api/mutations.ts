import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useAuthMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ endpoint, payload }: { endpoint: string, payload: any }) => {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include"
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message || "Authentication failed");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.invalidateQueries({ queryKey: ["patientDashboardData"] });
    }
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await fetch("/api/patient/auth/logout", { method: "POST", credentials: "include" });
    },
    onSuccess: () => {
      queryClient.setQueryData(["currentUser"], null);
      queryClient.setQueryData(["patientDashboardData"], { appointments: [], reports: [] });
    }
  });
}

export function useCancelAppointmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (apptId: string) => {
      const res = await fetch(`/api/appointments/${apptId}/cancel`, {
        method: "PATCH",
        credentials: "include"
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to cancel appointment");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patientDashboardData"] });
    }
  });
}

export function useSaveReportMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reportData: any) => {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData),
        credentials: "include"
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to save report");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patientDashboardData"] });
    }
  });
}
