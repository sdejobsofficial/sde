// hooks/useApplication.ts

import {
  submitApplication,
  getApplications,
  getApplicationById,
  getMyApplications,
  updateApplicationStatus,
  updateApplication,
  addRecruiterNote,
  withdrawApplication,
  hasApplied,
} from "@/clients/applicationClient";
import {
  ApplicationFilters,
  SubmitApplicationDTO,
  UpdateApplicationStatusDTO,
  UpdateApplicationDTO,
  AddRecruiterNoteDTO,
} from "@/models/applicationModel";
import {
  UserRole,
  JobSeekerMeta,
} from "@/models/userModel";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/useUser";
import toast from "react-hot-toast";

// ─── Query keys ───────────────────────────────────────────────────────────

export const applicationKeys = {
  all: () => ["applications"] as const,
  list: (filters: ApplicationFilters, page: number, ps: number) =>
    ["applications", "list", filters, page, ps] as const,
  detail: (id: string) => ["applications", "detail", id] as const,
  mine: (page: number, ps: number) =>
    ["applications", "mine", page, ps] as const,
  hasApplied: (jobId: string) => ["applications", "hasApplied", jobId] as const,
};

// ─── useApplications — recruiter: list all applicants ────────────────────

export const useApplications = (
  filters: ApplicationFilters = {},
  page: number = 1,
  pageSize: number = 20,
) => {
  return useQuery({
    queryKey: applicationKeys.list(filters, page, pageSize),
    queryFn: () => getApplications(filters, page, pageSize),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
};

// ─── useApplicationById — full detail view ────────────────────────────────

export const useApplicationById = (id: string) => {
  return useQuery({
    queryKey: applicationKeys.detail(id),
    queryFn: () => getApplicationById(id),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
};

// ─── useMyApplications — candidate: their own submitted applications ──────

export const useMyApplications = (page: number = 1, pageSize: number = 10) => {
  return useQuery({
    queryKey: applicationKeys.mine(page, pageSize),
    queryFn: () => getMyApplications(page, pageSize),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
};

// ─── useHasApplied — check if current user already applied to a job ───────

export const useHasApplied = (jobId: string) => {
  return useQuery({
    queryKey: applicationKeys.hasApplied(jobId),
    queryFn: () => hasApplied(jobId),
    enabled: !!jobId,
    staleTime: 5 * 60 * 1000, // 5 min — don't need to check this often
  });
};

// ─── useSubmitApplication — candidate applies to a job ────────────────────

export const useSubmitApplication = () => {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();

  return useMutation({
    mutationFn: (payload: SubmitApplicationDTO) => {
      const isJobSeeker = user && user.Role === UserRole.JobSeeker;
      const meta = isJobSeeker ? (user.Meta as JobSeekerMeta) : null;
      return submitApplication(payload, {
        name: user?.Name ?? "",
        email: user?.Email ?? "",
        phone: user?.Phone ?? undefined,
        location: meta?.Location ?? undefined,
        avatarUrl: meta?.AvatarUrl ?? undefined,
      });
    },
    onSuccess: (_, variables) => {
      // Invalidate candidate's application list
      queryClient.invalidateQueries({ queryKey: applicationKeys.mine(1, 10) });
      // Mark hasApplied as true for this job
      queryClient.setQueryData(
        applicationKeys.hasApplied(variables.JobId),
        true,
      );
      toast.success("Application submitted successfully!");
    },
    onError: (error: Error) => {
      if (error?.message?.includes("one_application_per_job")) {
        toast.error("You have already applied to this job.");
      } else {
        toast.error("Failed to submit application. Please try again.");
      }
    },
  });
};

// ─── useUpdateApplicationStatus — recruiter moves a candidate through pipeline

export const useUpdateApplicationStatus = (applicationId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateApplicationStatusDTO) =>
      updateApplicationStatus(applicationId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.all() });
      queryClient.invalidateQueries({
        queryKey: applicationKeys.detail(applicationId),
      });
      toast.success("Status updated.");
    },
    onError: () => {
      toast.error("Failed to update status.");
    },
  });
};

// ─── useUpdateApplication — recruiter stars / rates ───────────────────────

export const useUpdateApplication = (applicationId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateApplicationDTO) =>
      updateApplication(applicationId, payload),
    onSuccess: () => {
      // Optimistic — no toast needed for starring/rating
      queryClient.invalidateQueries({ queryKey: applicationKeys.all() });
      queryClient.invalidateQueries({
        queryKey: applicationKeys.detail(applicationId),
      });
    },
    onError: () => {
      toast.error("Failed to update.");
    },
  });
};

// ─── useAddRecruiterNote ──────────────────────────────────────────────────

export const useAddRecruiterNote = (applicationId: string) => {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  return useMutation({
    mutationFn: (payload: AddRecruiterNoteDTO) =>
      addRecruiterNote(applicationId, payload, user?.Name ?? "Recruiter"),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: applicationKeys.detail(applicationId),
      });
      toast.success("Note added.");
    },
    onError: () => {
      toast.error("Failed to add note.");
    },
  });
};

// ─── useWithdrawApplication — candidate withdraws ─────────────────────────

export const useWithdrawApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => withdrawApplication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.mine(1, 10) });
      toast.success("Application withdrawn.");
    },
    onError: () => {
      toast.error("Failed to withdraw application.");
    },
  });
};
