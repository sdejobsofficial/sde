import {
  getJobs,
  getJobById,
  getFeaturedCompanies,
  getFilterFacets,
  createJob,
  updateJob,
  deleteJob,
  incrementJobCounter,
  JobFilters,
  getMyJobs,
  getCompanyJobs,
  getCompanyById,
  fetchCompanies,
  getPremiumFilterFacets,
  getPremiumJobs,
  PremiumJobFilters,
  getPremiumPlusJobs,
} from "@/clients/jobClient";
import {
  CompanyFilters,
  JobInteraction,
  UpdateJobDTO,
} from "@/models/jobModel";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export const jobKeys = {
  all: () => ["jobs"] as const,
  list: (filters: JobFilters, page: number, pageSize: number) =>
    ["jobs", "list", filters, page, pageSize] as const,
  detail: (id: string) => ["jobs", "detail", id] as const,
  companies: () => ["jobs", "featured-companies"] as const,
  facets: () => ["jobs", "facets"] as const,
};

export const useJobs = (
  filters: JobFilters = {},
  page: number = 1,
  pageSize: number = 10,
) => {
  return useQuery({
    queryKey: jobKeys.list(filters, page, pageSize),
    queryFn: () => getJobs(filters, page, pageSize),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
};

export const useJobById = (id: string) => {
  return useQuery({
    queryKey: jobKeys.detail(id),
    queryFn: () => getJobById(id),
    enabled: !!id,
    staleTime: 60 * 1000,
  });
};

export const useFeaturedCompanies = () => {
  return useQuery({
    queryKey: jobKeys.companies(),
    queryFn: getFeaturedCompanies,
    staleTime: 5 * 60 * 1000,
  });
};

export const useFilterFacets = () => {
  return useQuery({
    queryKey: jobKeys.facets(),
    queryFn: getFilterFacets,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateJob = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: JobInteraction) => createJob(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.all() });
      toast.success("Job posted successfully!");
      router.push("/recruiter/jobs");
    },
    onError: () => {
      toast.error("Failed to post job. Please try again.");
    },
  });
};

export const useUpdateJob = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateJobDTO) => updateJob(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.all() });
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(id) });
      toast.success("Job updated successfully!");
    },
    onError: () => {
      toast.error("Failed to update job. Please try again.");
    },
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.all() });
      toast.success("Job deleted.");
    },
    onError: () => {
      toast.error("Failed to delete job.");
    },
  });
};

export const useIncrementJobCounter = () => {
  return useMutation({
    mutationFn: ({
      jobId,
      field,
    }: {
      jobId: string;
      field: "total_applicants" | "total_referrals" | "total_views";
    }) => incrementJobCounter(jobId, field),
  });
};

export const useMyJobs = () => {
  return useQuery({
    queryKey: ["jobs", "mine"],
    queryFn: getMyJobs,
    staleTime: 30 * 1000,
  });
};

export const companyKeys = {
  detail: (id: string) => ["company", "detail", id] as const,
  jobs: (id: string, page: number) => ["company", "jobs", id, page] as const,
};

export const useCompany = (id: string) =>
  useQuery({
    queryKey: companyKeys.detail(id),
    queryFn: () => getCompanyById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

export const useCompanyJobs = (companyId: string, page = 1, pageSize = 12) =>
  useQuery({
    queryKey: companyKeys.jobs(companyId, page),
    queryFn: () => getCompanyJobs(companyId, page, pageSize),
    enabled: !!companyId,
    staleTime: 30 * 1000,
  });

// ─── Hooks ────────────────────────────────────────────────────────────────

export const useCompanies = (
  filters: CompanyFilters,
  page: number,
  pageSize: number,
) =>
  useQuery({
    queryKey: ["companies", "list", filters, page, pageSize],
    queryFn: () => fetchCompanies(filters, page, pageSize),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });

export const premiumJobKeys = {
  all: () => ["premium-jobs"] as const,
  list: (filters: PremiumJobFilters, page: number, pageSize: number) =>
    ["premium-jobs", "list", filters, page, pageSize] as const,
  facets: () => ["premium-jobs", "facets"] as const,
};

export const premiumPlusJobKeys = {
  all: () => ["premium-plus-jobs"] as const,
  list: (filters: PremiumJobFilters, page: number, pageSize: number) =>
    ["premium-plus-jobs", "list", filters, page, pageSize] as const,
};

export const usePremiumJobs = (
  filters: PremiumJobFilters = {},
  page: number = 1,
  pageSize: number = 10,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: premiumJobKeys.list(filters, page, pageSize),
    queryFn: () => getPremiumJobs(filters, page, pageSize),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
    enabled: options?.enabled ?? true,
  });
};

export const usePremiumPlusJobs = (
  filters: PremiumJobFilters = {},
  page: number = 1,
  pageSize: number = 10,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: premiumPlusJobKeys.list(filters, page, pageSize),
    queryFn: () => getPremiumPlusJobs(filters, page, pageSize),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
    enabled: options?.enabled ?? true,
  });
};

export const usePremiumFilterFacets = () => {
  return useQuery({
    queryKey: premiumJobKeys.facets(),
    queryFn: getPremiumFilterFacets,
    staleTime: 5 * 60 * 1000,
  });
};
