// clients/applicationClient.ts

import { convertToPascalCase, convertToSnakeCase } from "@/lib/casing";
import {
  Application,
  ApplicationCard,
  ApplicationFilters,
  ApplicationStatus,
  ApplicationType,
  PaginatedApplications,
  SubmitApplicationDTO,
  UpdateApplicationStatusDTO,
  UpdateApplicationDTO,
  AddRecruiterNoteDTO,
} from "@/models/applicationModel";
import { createClient } from "@/supabase/client";

// ─────────────────────────────────────────────
// Submit a new application (candidate)
// ─────────────────────────────────────────────

export const submitApplication = async (
  payload: SubmitApplicationDTO,
  candidateSnapshot: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    avatarUrl?: string;
  },
): Promise<Application | null> => {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Fetch company_id from the job
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("company_id, posted_by, application_form")
    .eq("id", payload.JobId)
    .single();

  if (jobError || !job) {
    console.error("submitApplication — job not found:", jobError);
    return null;
  }

  // Resolve field labels from the application_form snapshot
  const formFields: any[] = job.application_form?.fields ?? [];
  const answersWithLabels = payload.Answers.map((ans) => {
    const field = formFields.find((f: any) => f.id === ans.FieldId);
    return {
      ...(convertToSnakeCase(ans) as Record<string, unknown>),
      field_label: field?.label ?? "",
    };
  });

  const row = {
    job_id: payload.JobId,
    applicant_id: user.id,
    company_id: job.company_id,
    referred_by: payload.ReferredBy ?? null,
    type: payload.ReferredBy
      ? ApplicationType.Referral
      : ApplicationType.Direct,
    status: ApplicationStatus.Submitted,
    candidate_name: candidateSnapshot.name,
    candidate_email: candidateSnapshot.email,
    candidate_phone: candidateSnapshot.phone ?? null,
    candidate_location: candidateSnapshot.location ?? null,
    candidate_avatar_url: candidateSnapshot.avatarUrl ?? null,
    auto_fields: convertToSnakeCase(payload.AutoFields),
    answers: answersWithLabels,
    notes: [],
    status_history: [
      {
        status: ApplicationStatus.Submitted,
        changed_by: user.id,
        changed_at: new Date().toISOString(),
      },
    ],
    is_starred: false,
  };

  const { data, error } = await supabase
    .from("applications")
    .insert([row])
    .select()
    .single();

  if (error) {
    console.error("submitApplication error:", error);
    return null;
  }

  return convertToPascalCase(data) as Application;
};

// ─────────────────────────────────────────────
// Get applications for a company (recruiter view)
// ─────────────────────────────────────────────

export const getApplications = async (
  filters: ApplicationFilters = {},
  page: number = 1,
  pageSize: number = 20,
): Promise<PaginatedApplications> => {
  const supabase = createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("applications")
    .select(
      `
      id,
      job_id,
      applicant_id,
      company_id,
      type,
      status,
      is_starred,
      recruiter_rating,
      candidate_name,
      candidate_email,
      candidate_avatar_url,
      candidate_location,
      auto_fields,
      created_at,
      updated_at,
      jobs!job_id (
        title,
        company_id,
        users!company_id ( name, meta )
      )
      `,
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.jobId) {
    query = query.eq("job_id", filters.jobId);
  }

  if (filters.status?.length) {
    query = query.in("status", filters.status);
  }

  if (filters.type !== undefined) {
    query = query.eq("type", filters.type);
  }

  if (filters.isStarred) {
    query = query.eq("is_starred", true);
  }

  if (filters.search) {
    query = query.or(
      `candidate_name.ilike.%${filters.search}%,candidate_email.ilike.%${filters.search}%`,
    );
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("getApplications error:", error);
    return {
      Data: [],
      Total: 0,
      Page: page,
      PageSize: pageSize,
      HasMore: false,
    };
  }

  const mapped: ApplicationCard[] = (data ?? []).map((row: any) => ({
    Id: row.id,
    JobId: row.job_id,
    JobTitle: row.jobs?.title ?? "",
    CompanyId: row.company_id,
    CompanyName: row.jobs?.users?.name ?? "",
    CompanyLogoUrl: row.jobs?.users?.meta?.avatar_url ?? undefined,
    ApplicantId: row.applicant_id,
    CandidateName: row.candidate_name,
    CandidateEmail: row.candidate_email,
    CandidateAvatarUrl: row.candidate_avatar_url ?? undefined,
    CandidateLocation: row.candidate_location ?? undefined,
    Type: row.type,
    Status: row.status,
    IsStarred: row.is_starred,
    RecruiterRating: row.recruiter_rating ?? undefined,
    ResumeUrl: row.auto_fields?.resume_url ?? undefined,
    CreatedAt: row.created_at,
    UpdatedAt: row.updated_at,
  }));

  const total = count ?? 0;
  return {
    Data: mapped,
    Total: total,
    Page: page,
    PageSize: pageSize,
    HasMore: from + mapped.length < total,
  };
};

// ─────────────────────────────────────────────
// Get full application detail (recruiter + candidate)
// ─────────────────────────────────────────────

export const getApplicationById = async (
  id: string,
): Promise<Application | null> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("getApplicationById error:", error);
    return null;
  }

  return convertToPascalCase(data) as Application;
};

// ─────────────────────────────────────────────
// Get my applications (candidate view)
// ─────────────────────────────────────────────

export const getMyApplications = async (
  page: number = 1,
  pageSize: number = 10,
): Promise<PaginatedApplications> => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return {
      Data: [],
      Total: 0,
      Page: page,
      PageSize: pageSize,
      HasMore: false,
    };

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("applications")
    .select(
      `
      id,
      job_id,
      applicant_id,
      company_id,
      type,
      status,
      is_starred,
      candidate_name,
      candidate_email,
      candidate_avatar_url,
      auto_fields,
      created_at,
      updated_at,
      jobs!job_id (
        title,
        users!company_id ( name, meta )
      )
      `,
      { count: "exact" },
    )
    .eq("applicant_id", user.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("getMyApplications error:", error);
    return {
      Data: [],
      Total: 0,
      Page: page,
      PageSize: pageSize,
      HasMore: false,
    };
  }

  const mapped: ApplicationCard[] = (data ?? []).map((row: any) => ({
    Id: row.id,
    JobId: row.job_id,
    JobTitle: row.jobs?.title ?? "",
    CompanyId: row.company_id,
    CompanyName: row.jobs?.users?.name ?? "",
    CompanyLogoUrl: row.jobs?.users?.meta?.avatar_url ?? undefined,
    ApplicantId: row.applicant_id,
    CandidateName: row.candidate_name,
    CandidateEmail: row.candidate_email,
    CandidateAvatarUrl: row.candidate_avatar_url ?? undefined,
    Type: row.type,
    Status: row.status,
    IsStarred: row.is_starred,
    ResumeUrl: row.auto_fields?.resume_url ?? undefined,
    CreatedAt: row.created_at,
    UpdatedAt: row.updated_at,
  }));

  const total = count ?? 0;
  return {
    Data: mapped,
    Total: total,
    Page: page,
    PageSize: pageSize,
    HasMore: from + mapped.length < total,
  };
};

// ─────────────────────────────────────────────
// Update application status (recruiter)
// ─────────────────────────────────────────────

export const updateApplicationStatus = async (
  id: string,
  payload: UpdateApplicationStatusDTO,
): Promise<Application | null> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("applications")
    .update({
      status: payload.Status,
      rejection_reason: payload.RejectionReason ?? null,
      rejection_note: payload.RejectionNote ?? null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("updateApplicationStatus error:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      raw: error,
    });
    return null;
  }

  return convertToPascalCase(data) as Application;
};

// ─────────────────────────────────────────────
// Update application (star, rating)
// ─────────────────────────────────────────────

export const updateApplication = async (
  id: string,
  payload: UpdateApplicationDTO,
): Promise<Application | null> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("applications")
    .update(convertToSnakeCase(payload) as Record<string, unknown>)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("updateApplication error:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      raw: error,
    });
    return null;
  }

  return convertToPascalCase(data) as Application;
};

// ─────────────────────────────────────────────
// Add recruiter note (via RPC to avoid JSONB race)
// ─────────────────────────────────────────────

export const addRecruiterNote = async (
  id: string,
  payload: AddRecruiterNoteDTO,
  authorName: string,
): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase.rpc("add_application_note", {
    p_application_id: id,
    p_content: payload.Content,
    p_author_name: authorName,
  });
  if (error) console.error("addRecruiterNote error:", error);
};

// ─────────────────────────────────────────────
// Withdraw application (candidate)
// ─────────────────────────────────────────────

export const withdrawApplication = async (id: string): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase
    .from("applications")
    .update({ status: ApplicationStatus.Withdrawn })
    .eq("id", id);
  if (error) console.error("withdrawApplication error:", error);
};

// ─────────────────────────────────────────────
// Check if candidate already applied
// ─────────────────────────────────────────────

export const hasApplied = async (jobId: string): Promise<boolean> => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("applications")
    .select("id")
    .eq("job_id", jobId)
    .eq("applicant_id", user.id)
    .maybeSingle();

  return !!data;
};
