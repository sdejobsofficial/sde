import { convertToPascalCase, convertToSnakeCase } from "@/lib/casing";
import { createClient } from "@/supabase/client";
import {
  CompanyCard,
  CompanyFilters,
  CreateJobDTO,
  Job,
  JobCard,
  JobInteraction,
  JobStatus,
  PaginatedCompanies,
  UpdateJobDTO,
} from "@/models/jobModel";
import { getCurrentSession, getCurrentUser } from "./userClient";
import {
  CompanySize,
  VerificationStatus,
  CompanyMeta,
} from "@/models/userModel";

// ─── Filter & pagination types ────────────────────────────────────────────

export interface JobFilters {
  search?: string;
  workMode?: number[];
  jobType?: number[];
  experienceLevel?: number[];
  salaryMin?: number;
  salaryMax?: number;
  locations?: string[];
  industries?: string[];
  skills?: string[];
  referralOpen?: boolean;
}

export interface PaginatedJobs {
  data: JobCard[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface FeaturedCompany {
  Id: string;
  Name: string;
  LogoUrl?: string;
  Location?: string;
  Industry?: string[];
  ActiveJobs: number;
}

// ─── getJobs — server-side filtered + paginated ───────────────────────────

export const getJobs = async (
  filters: JobFilters = {},
  page: number = 1,
  pageSize: number = 10,
): Promise<PaginatedJobs> => {
  const supabase = createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("jobs")
    .select(
      `
      id,
      title,
      company_id,
      location,
      work_mode,
      job_type,
      experience_level,
      experience_min_years,
      experience_max_years,
      salary_min,
      salary_max,
      salary_currency,
      salary_type,
      salary_visibility,
      skills,
      total_openings,
      total_applicants,
      referral_status,
      is_featured,
      is_urgent,
      status,
      application_deadline,
      published_at,
      users!company_id (
        name,
        meta
      )
    `,
      { count: "exact" },
    )
    // .eq("status", JobStatus.Active)
    .is("company_meta", null)
    .order("is_featured", { ascending: false })
    .order("published_at", { ascending: false })
    .range(from, to);

  if (filters.search) {
    // Pre-fetch matching company IDs
    const { data: companies } = await supabase
      .from("users")
      .select("id")
      .eq("role", 1)
      .ilike("name", `%${filters.search}%`);

    const companyIds = companies?.map((c) => c.id) || [];

    if (companyIds.length > 0) {
      // Use double quotes for UUIDs in PostgREST .in.()
      const idsStr = companyIds.map((id) => `"${id}"`).join(",");
      query = query.or(
        `title.ilike.%${filters.search}%,location.ilike.%${filters.search}%,company_id.in.(${idsStr})`,
      );
    } else {
      query = query.or(
        `title.ilike.%${filters.search}%,location.ilike.%${filters.search}%`,
      );
    }
  }

  if (filters.workMode?.length) {
    query = query.in("work_mode", filters.workMode);
  }

  if (filters.jobType?.length) {
    query = query.in("job_type", filters.jobType);
  }

  if (filters.experienceLevel?.length) {
    query = query.in("experience_level", filters.experienceLevel);
  }

  if (filters.salaryMin !== undefined) {
    query = query.gte("salary_min", filters.salaryMin);
  }

  if (filters.salaryMax !== undefined) {
    query = query.lte("salary_max", filters.salaryMax);
  }

  if (filters.locations?.length) {
    const locationFilters = filters.locations
      .map((l) => `location.ilike.%${l}%`)
      .join(",");
    query = query.or(locationFilters);
  }

  if (filters.skills?.length) {
    query = query.overlaps("skills", filters.skills);
  }

  if (filters.referralOpen) {
    query = query.eq("referral_status", 0);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("getJobs error:", error);
    return { data: [], total: 0, page, pageSize, hasMore: false };
  }

  const mapped: JobCard[] = (data ?? []).map((row: any) => ({
    Id: row.id,
    Title: row.title,
    CompanyId: row.company_id,
    CompanyName: row.users?.name ?? "Unknown",
    CompanyLogoUrl: row.users?.meta?.avatar_url ?? undefined,
    Location: row.location,
    WorkMode: row.work_mode,
    JobType: row.job_type,
    Salary: {
      Min: row.salary_min,
      Max: row.salary_max,
      Currency: row.salary_currency,
      Type: row.salary_type,
      Visibility: row.salary_visibility,
    },
    ExperienceRequired: {
      Level: row.experience_level,
      MinYears: row.experience_min_years,
      MaxYears: row.experience_max_years ?? undefined,
    },
    Skills: row.skills ?? [],
    TotalOpenings: row.total_openings,
    TotalApplicants: row.total_applicants,
    ReferralStatus: row.referral_status,
    IsFeatured: row.is_featured,
    IsUrgent: row.is_urgent,
    Status: row.status,
    ApplicationDeadline: row.application_deadline ?? undefined,
    PublishedAt: row.published_at ?? undefined,
  }));

  const total = count ?? 0;
  return {
    data: mapped,
    total,
    page,
    pageSize,
    hasMore: from + mapped.length < total,
  };
};

// ─── getJobById ───────────────────────────────────────────────────────────

export const getJobById = async (id: string): Promise<Job | null> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("*, users!company_id(name, meta)")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("getJobById error:", error);
    return null;
  }

  return convertToPascalCase(data) as Job;
};

// ─── getFeaturedCompanies — top 5 active hiring companies ─────────────────

export const getFeaturedCompanies = async (): Promise<FeaturedCompany[]> => {
  const supabase = createClient();

  const { data, error } = await supabase.from("jobs").select(
    `
      company_id,
      users!company_id (
        id,
        name,
        meta
      )
    `,
  );
  // .eq("status", JobStatus.Active);

  if (error || !data) {
    console.error("getFeaturedCompanies error:", error);
    return [];
  }

  // Count active jobs per company
  const countMap: Record<string, { company: any; count: number }> = {};
  for (const row of data as any[]) {
    const id = row.company_id;
    if (!countMap[id]) {
      countMap[id] = { company: row.users, count: 0 };
    }
    countMap[id].count++;
  }

  return Object.entries(countMap)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
    .map(([id, { company, count }]) => ({
      Id: id,
      Name: company?.name ?? "Unknown",
      LogoUrl: company?.meta?.avatar_url ?? undefined,
      Location: company?.meta?.location ?? undefined,
      Industry: company?.meta?.industry ?? [],
      ActiveJobs: count,
    }));
};

// ─── getFilterFacets — counts for sidebar checkboxes ─────────────────────

export interface FilterFacets {
  locations: { label: string; count: number }[];
  industries: { label: string; count: number }[];
}

export const getFilterFacets = async (): Promise<FilterFacets> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("jobs")
    .select(
      `
      location,
      users!company_id (
        meta
      )
    `,
    )
    .eq("status", JobStatus.Active);

  if (error || !data) return { locations: [], industries: [] };

  // Aggregate locations
  const locationCount: Record<string, number> = {};
  const industryCount: Record<string, number> = {};

  for (const row of data as any[]) {
    const loc = row.location as string;
    if (loc) locationCount[loc] = (locationCount[loc] ?? 0) + 1;

    const industries: string[] = row.users?.meta?.industry ?? [];
    for (const ind of industries) {
      industryCount[ind] = (industryCount[ind] ?? 0) + 1;
    }
  }

  const toSorted = (map: Record<string, number>) =>
    Object.entries(map)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);

  return {
    locations: toSorted(locationCount),
    industries: toSorted(industryCount),
  };
};

// ─── createJob ────────────────────────────────────────────────────────────

// export const createJob = async (payload: Record<string, unknown>) => {
//   const supabase = createClient();
//   const { data, error } = await supabase
//     .from("jobs")
//     .insert([payload])
//     .select()
//     .single();

//   if (error) {
//     console.error("createJob error:", error);
//     return null;
//   }
//   return convertToPascalCase(data) as Job;
// };

export const createJob = async (payload: JobInteraction) => {
  const supabase = createClient();

  const userSession = await getCurrentSession();
  const user = await getCurrentUser();
  if (!userSession || !user) {
    console.log("No user session found");
    return;
  }

  if (
    user.Role === 1 &&
    (user.Meta as any)?.VerificationStatus !== VerificationStatus.Verified
  ) {
    throw new Error("Company profile must be verified to post a job.");
  }

  // ── Map CreateJobDTO (PascalCase + nested) → flat snake_case DB columns ──
  // const row: Record<string, unknown> = {
  //   // ── Content ──
  //   title: payload.Title,
  //   location: payload.Location,
  //   skills: payload.Skills,
  //   description: payload.Description, // stored as JSONB as-is

  //   // ── Classification ──
  //   job_type: payload.JobType,
  //   work_mode: payload.WorkMode,
  //   experience_level: payload.ExperienceRequired.Level,
  //   experience_min_years: payload.ExperienceRequired.MinYears,
  //   experience_max_years: payload.ExperienceRequired.MaxYears ?? null,

  //   // ── Salary (flatten SalaryRange) ──
  //   salary_min: payload.Salary.Min,
  //   salary_max: payload.Salary.Max,
  //   salary_currency: payload.Salary.Currency,
  //   salary_type: payload.Salary.Type,
  //   salary_visibility: payload.Salary.Visibility,

  //   // ── Openings ──
  //   total_openings: payload.TotalOpenings,

  //   // ── Application ──
  //   form_type: payload.FormType,
  //   external_apply_url: payload.ExternalApplyUrl ?? null,
  //   application_form: payload.ApplicationForm ?? null,

  //   // ── Referrals ──
  //   referral_status: payload.ReferralStatus,
  //   referral_bonus: payload.ReferralBonus ?? null,

  //   // ── Misc ──
  //   is_urgent: payload.IsUrgent ?? false,
  //   application_deadline: payload.ApplicationDeadline ?? null,

  //   // ── Status: insert as Draft (0); caller can transition to Active separately ──
  //   status: JobStatus.Draft,

  //   company_id: user.id, // from current user session
  //   posted_by: user.id, // same as company_id for now; could be different if we track individual recruiters
  // };

  // Strip non-DB fields before insert
  const { CompanyName, ...dbPayload } = payload;

  const { data, error } = await supabase
    .from("jobs")
    .insert([
      convertToSnakeCase({
        ...dbPayload,
        company_id: userSession.id,
        posted_by: userSession.id,
      }),
    ])
    .select()
    .single();

  if (error) {
    console.error("createJob error:", error);
    return null;
  }

  return convertToPascalCase(data) as Job;
};

// ─── updateJob ────────────────────────────────────────────────────────────

export const updateJob = async (id: string, payload: UpdateJobDTO) => {
  const supabase = createClient();

  const user = await getCurrentUser();
  if (
    user &&
    user.Role === 1 &&
    (user.Meta as any)?.VerificationStatus !== VerificationStatus.Verified
  ) {
    throw new Error("Company profile must be verified to edit a job.");
  }

  // ── Map only the fields that are present in the partial UpdateJobDTO ──
  const row: Record<string, unknown> = {};

  if (payload.Title !== undefined) row.title = payload.Title;
  if (payload.Location !== undefined) row.location = payload.Location;
  if (payload.Skills !== undefined) row.skills = payload.Skills;
  if (payload.Description !== undefined) row.description = payload.Description;

  if (payload.JobType !== undefined) row.job_type = payload.JobType;
  if (payload.WorkMode !== undefined) row.work_mode = payload.WorkMode;

  if (payload.ExperienceRequired !== undefined) {
    row.experience_level = payload.ExperienceRequired.Level;
    row.experience_min_years = payload.ExperienceRequired.MinYears;
    row.experience_max_years = payload.ExperienceRequired.MaxYears ?? null;
  }

  if (payload.Salary !== undefined) {
    row.salary_min = payload.Salary.Min;
    row.salary_max = payload.Salary.Max;
    row.salary_currency = payload.Salary.Currency;
    row.salary_type = payload.Salary.Type;
    row.salary_visibility = payload.Salary.Visibility;
  }

  if (payload.TotalOpenings !== undefined)
    row.total_openings = payload.TotalOpenings;
  if (payload.FormType !== undefined) row.form_type = payload.FormType;
  if (payload.ExternalApplyUrl !== undefined)
    row.external_apply_url = payload.ExternalApplyUrl ?? null;
  if (payload.ApplicationForm !== undefined)
    row.application_form = payload.ApplicationForm ?? null;
  if (payload.ReferralStatus !== undefined)
    row.referral_status = payload.ReferralStatus;
  if (payload.ReferralBonus !== undefined)
    row.referral_bonus = payload.ReferralBonus ?? null;
  if (payload.ApplicationDeadline !== undefined)
    row.application_deadline = payload.ApplicationDeadline ?? null;
  if (payload.IsUrgent !== undefined) row.is_urgent = payload.IsUrgent;

  // UpdateJobDTO-only fields
  if (payload.Status !== undefined) row.status = payload.Status;
  if (payload.IsFeatured !== undefined) row.is_featured = payload.IsFeatured;

  const { data, error } = await supabase
    .from("jobs")
    .update(row)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("updateJob error:", error);
    return null;
  }

  return convertToPascalCase(data) as Job;
};

// ─── deleteJob ────────────────────────────────────────────────────────────

export const deleteJob = async (id: string) => {
  const supabase = createClient();
  const { error } = await supabase.from("jobs").delete().eq("id", id);
  if (error) console.error("deleteJob error:", error);
};

// ─── incrementJobCounter ─────────────────────────────────────────────────

export const incrementJobCounter = async (
  jobId: string,
  field: "total_applicants" | "total_referrals" | "total_views",
) => {
  const supabase = createClient();
  await supabase.rpc("increment_job_counter", {
    p_job_id: jobId,
    p_field: field,
    p_amount: 1,
  });
};

// ─── Add to jobClient.ts ──────────────────────────────────────────────────

export const getMyJobs = async (): Promise<JobCard[]> => {
  const supabase = createClient();

  const user = await getCurrentSession();
  if (!user) {
    console.log("No user session found");
    return [];
  }

  const { data, error } = await supabase
    .from("jobs")
    .select(
      `
      id,
      title,
      company_id,
      location,
      work_mode,
      job_type,
      experience_level,
      experience_min_years,
      experience_max_years,
      salary_min,
      salary_max,
      salary_currency,
      salary_type,
      salary_visibility,
      skills,
      total_openings,
      total_applicants,
      total_views,
      referral_status,
      is_featured,
      is_urgent,
      status,
      application_deadline,
      published_at,
      users!company_id (
        name,
        meta
      )
    `,
    )
    .eq("company_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getMyJobs error:", error);
    return [];
  }

  return (data ?? []).map((row: any) => ({
    Id: row.id,
    Title: row.title,
    CompanyId: row.company_id,
    CompanyName: row.users?.name ?? "Unknown",
    CompanyLogoUrl: row.users?.meta?.avatar_url ?? undefined,
    Location: row.location,
    WorkMode: row.work_mode,
    JobType: row.job_type,
    Salary: {
      Min: row.salary_min,
      Max: row.salary_max,
      Currency: row.salary_currency,
      Type: row.salary_type,
      Visibility: row.salary_visibility,
    },
    ExperienceRequired: {
      Level: row.experience_level,
      MinYears: row.experience_min_years,
      MaxYears: row.experience_max_years ?? undefined,
    },
    Skills: row.skills ?? [],
    TotalOpenings: row.total_openings,
    TotalApplicants: row.total_applicants,
    TotalViews: row.total_views,
    ReferralStatus: row.referral_status,
    IsFeatured: row.is_featured,
    IsUrgent: row.is_urgent,
    Status: row.status,
    ApplicationDeadline: row.application_deadline ?? undefined,
    PublishedAt: row.published_at ?? undefined,
  }));
};

// ─── CompanySize → readable label ─────────────────────────────────────────

export const COMPANY_SIZE_LABEL: Record<CompanySize, string> = {
  [CompanySize.Micro]: "1–10",
  [CompanySize.Small]: "11–50",
  [CompanySize.Medium]: "51–200",
  [CompanySize.Large]: "201–500",
  [CompanySize.XLarge]: "501–1,000",
  [CompanySize.Enterprise]: "1,000+",
};

// ─── Public company profile ────────────────────────────────────────────────

export interface CompanyProfile {
  Id: string;
  Name: string;
  Email: string;
  Phone?: string;
  // From CompanyMeta (after convertToPascalCase)
  AvatarUrl?: string;
  Location?: string;
  Bio?: string;
  Website?: string;
  Industry?: string[];
  Size?: CompanySize;
  SizeLabel?: string;
  SocialLinks?: {
    LinkedIn?: string;
    GitHub?: string;
    Portfolio?: string;
    Twitter?: string;
    Website?: string;
  };
  VerificationStatus: VerificationStatus;
  IsProfileComplete: boolean;
  // Derived counts
  ActiveJobs: number;
  TotalJobs: number;
}

// ─── getCompanyById ────────────────────────────────────────────────────────

export const getCompanyById = async (
  id: string,
): Promise<CompanyProfile | null> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, phone, meta")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("getCompanyById error:", error);
    return null;
  }

  const raw = data as any;
  // meta is stored as snake_case JSONB — lift to PascalCase to match CompanyMeta
  const meta = raw.meta ? (convertToPascalCase(raw.meta) as CompanyMeta) : null;

  // Count all jobs and active jobs in parallel
  const [{ count: totalCount }, { count: activeCount }] = await Promise.all([
    supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("company_id", id),
    supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("company_id", id)
      .eq("status", JobStatus.Active),
  ]);

  return {
    Id: raw.id,
    Name: raw.name ?? "Unknown",
    Email: raw.email ?? "",
    Phone: raw.phone ?? undefined,
    AvatarUrl: meta?.AvatarUrl ?? undefined,
    Location: meta?.Location ?? undefined,
    Bio: meta?.Bio ?? undefined,
    Website: meta?.Website ?? undefined,
    Industry: meta?.Industry ?? [],
    Size: meta?.Size ?? undefined,
    SizeLabel:
      meta?.Size != null
        ? COMPANY_SIZE_LABEL[meta.Size as CompanySize]
        : undefined,
    SocialLinks: meta?.SocialLinks ?? undefined,
    VerificationStatus:
      meta?.VerificationStatus ?? VerificationStatus.Unverified,
    IsProfileComplete: meta?.IsProfileComplete ?? false,
    ActiveJobs: activeCount ?? 0,
    TotalJobs: totalCount ?? 0,
  };
};

// ─── getCompanyJobs ────────────────────────────────────────────────────────

export const getCompanyJobs = async (
  companyId: string,
  page: number = 1,
  pageSize: number = 20,
): Promise<{ data: JobCard[]; total: number; hasMore: boolean }> => {
  const supabase = createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("jobs")
    .select(
      `
      id, title, company_id, location, work_mode, job_type,
      experience_level, experience_min_years, experience_max_years,
      salary_min, salary_max, salary_currency, salary_type, salary_visibility,
      skills, total_openings, total_applicants, referral_status,
      is_featured, is_urgent, status, application_deadline, published_at,
      users!company_id(name, meta)
    `,
      { count: "exact" },
    )
    .eq("company_id", companyId)
    .order("is_featured", { ascending: false })
    .order("published_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("getCompanyJobs error:", error);
    return { data: [], total: 0, hasMore: false };
  }

  const mapped: JobCard[] = (data ?? []).map((row: any) => ({
    Id: row.id,
    Title: row.title,
    CompanyId: row.company_id,
    CompanyName: row.users?.name ?? "Unknown",
    CompanyLogoUrl: row.users?.meta?.avatar_url ?? undefined,
    Location: row.location,
    WorkMode: row.work_mode,
    JobType: row.job_type,
    Salary: {
      Min: row.salary_min ?? 0,
      Max: row.salary_max ?? 0,
      Currency: row.salary_currency ?? "INR",
      Type: row.salary_type,
      Visibility: row.salary_visibility ?? 0,
    },
    ExperienceRequired: {
      Level: row.experience_level ?? 0,
      MinYears: row.experience_min_years ?? 0,
      MaxYears: row.experience_max_years ?? undefined,
    },
    Skills: row.skills ?? [],
    TotalOpenings: row.total_openings ?? 0,
    TotalApplicants: row.total_applicants ?? 0,
    ReferralStatus: row.referral_status,
    IsFeatured: row.is_featured,
    IsUrgent: row.is_urgent,
    Status: row.status,
    ApplicationDeadline: row.application_deadline ?? undefined,
    PublishedAt: row.published_at ?? undefined,
  }));

  const total = count ?? 0;
  return { data: mapped, total, hasMore: from + mapped.length < total };
};

export const fetchCompanies = async (
  filters: CompanyFilters,
  page: number,
  pageSize: number,
): Promise<PaginatedCompanies> => {
  const supabase = createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("users")
    .select("id, name, meta, email", { count: "exact" })
    .eq("role", 1) // Company role
    .range(from, to);

  if (filters.search) {
    query = query.ilike("name", `%${filters.search}%`);
  }

  if (filters.verifiedOnly) {
    query = query.eq(
      "meta->>verification_status",
      String(VerificationStatus.Verified),
    );
  }

  if (filters.locations?.length) {
    const locationFilters = filters.locations
      .map((l) => `meta->>location.ilike.%${l}%`)
      .join(",");
    query = query.or(locationFilters);
  }

  const { data, error, count } = await query;

  if (error || !data) {
    console.error("fetchCompanies error:", error);
    return { data: [], total: 0, hasMore: false };
  }

  // Get active job counts for all companies
  const companyIds = data.map((c: any) => c.id);
  const { data: jobData } = await supabase
    .from("jobs")
    .select("company_id")
    .in("company_id", companyIds)
    .eq("status", JobStatus.Active);

  const jobCountMap: Record<string, number> = {};
  for (const j of (jobData ?? []) as any[]) {
    jobCountMap[j.company_id] = (jobCountMap[j.company_id] ?? 0) + 1;
  }

  let mapped: CompanyCard[] = data.map((row: any) => ({
    Id: row.id,
    Name: row.name ?? "Unknown",
    LogoUrl: row.meta?.avatar_url ?? undefined,
    Location: row.meta?.location ?? undefined,
    Bio: row.meta?.bio ?? undefined,
    Industries: row.meta?.industry ?? [],
    Size: row.meta?.size ?? undefined,
    Website: row.meta?.website ?? undefined,
    VerificationStatus: row.meta?.verification_status ?? 0,
    ActiveJobs: jobCountMap[row.id] ?? 0,
    SocialLinks: row.meta?.social_links ?? undefined,
  }));

  // Client-side filter: industry, size, hiringOnly
  if (filters.industries?.length) {
    mapped = mapped.filter((c) =>
      c.Industries.some((i) => filters.industries!.includes(i)),
    );
  }
  if (filters.sizes?.length) {
    mapped = mapped.filter(
      (c) => c.Size !== undefined && filters.sizes!.includes(c.Size),
    );
  }
  if (filters.hiringOnly) {
    mapped = mapped.filter((c) => c.ActiveJobs > 0);
  }

  const total = count ?? 0;
  return { data: mapped, total, hasMore: from + mapped.length < total };
};

export interface PremiumJobCompanyMeta {
  Name: string;
  LogoUrl?: string;
  Size?: number; // CompanySize enum
  Industry?: string[];
  Location?: string;
  Website?: string;
  Bio?: string;
  SocialLinks?: {
    LinkedIn?: string;
    GitHub?: string;
    Twitter?: string;
    Portfolio?: string;
  };
}

// ─── PremiumJobCard — what the list page renders ──────────────────────────────
export interface PremiumJobCard {
  Id: string;
  Title: string;
  Location: string;
  WorkMode: number;
  JobType: number;
  Salary: {
    Min: number;
    Max: number;
    Currency: string;
    Type: number;
    Visibility: number;
  };
  ExperienceRequired: {
    Level: number;
    MinYears: number;
    MaxYears?: number;
  };
  Skills: string[];
  TotalOpenings: number;
  TotalApplicants: number;
  ReferralStatus: number;
  IsFeatured: boolean;
  IsUrgent: boolean;
  Status: number;
  ApplicationDeadline?: string;
  PublishedAt?: string;
  ExternalApplyUrl?: string;
  // ── premium-only ──
  CompanyMeta: PremiumJobCompanyMeta; // always present for premium jobs
}

export interface PremiumJobFilters {
  search?: string;
  workMode?: number[];
  jobType?: number[];
  experienceLevel?: number[];
  salaryMin?: number;
  salaryMax?: number;
  locations?: string[];
  industries?: string[];
  skills?: string[];
}

export interface PaginatedPremiumJobs {
  data: PremiumJobCard[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ─── getPremiumJobs ────────────────────────────────────────────────────────────

const mapPremiumJobRow = (row: any): PremiumJobCard => {
  const cm = row.company_meta ?? {};
  const companyMeta: PremiumJobCompanyMeta = {
    Name: cm.name ?? cm.Name ?? "Unknown",
    LogoUrl: cm.logo_url ?? cm.LogoUrl ?? undefined,
    Size: cm.size ?? cm.Size ?? undefined,
    Industry: cm.industry ?? cm.Industry ?? [],
    Location: cm.location ?? cm.Location ?? undefined,
    Website: cm.website ?? cm.Website ?? undefined,
    Bio: cm.bio ?? cm.Bio ?? undefined,
    SocialLinks: cm.social_links ?? cm.SocialLinks ?? undefined,
  };

  return {
    Id: row.id,
    Title: row.title,
    Location: row.location,
    WorkMode: row.work_mode,
    JobType: row.job_type,
    Salary: {
      Min: row.salary_min,
      Max: row.salary_max,
      Currency: row.salary_currency,
      Type: row.salary_type,
      Visibility: row.salary_visibility,
    },
    ExperienceRequired: {
      Level: row.experience_level,
      MinYears: row.experience_min_years,
      MaxYears: row.experience_max_years ?? undefined,
    },
    Skills: row.skills ?? [],
    TotalOpenings: row.total_openings,
    TotalApplicants: row.total_applicants,
    ReferralStatus: row.referral_status,
    IsFeatured: row.is_featured,
    IsUrgent: row.is_urgent,
    Status: row.status,
    ApplicationDeadline: row.application_deadline ?? undefined,
    PublishedAt: row.published_at ?? undefined,
    ExternalApplyUrl: row.external_apply_url ?? undefined,
    CompanyMeta: companyMeta,
  };
};

const buildPremiumJobsQuery = (
  supabase: ReturnType<typeof createClient>,
  filters: PremiumJobFilters,
) => {
  let query = supabase
    .from("jobs")
    .select(
      `
      id,
      title,
      company_id,
      location,
      work_mode,
      job_type,
      experience_level,
      experience_min_years,
      experience_max_years,
      salary_min,
      salary_max,
      salary_currency,
      salary_type,
      salary_visibility,
      skills,
      total_openings,
      total_applicants,
      referral_status,
      is_featured,
      is_urgent,
      status,
      application_deadline,
      published_at,
      external_apply_url,
      company_meta
      `,
      { count: "exact" },
    )
    .not("company_meta", "is", null) // only premium jobs have company_meta
    .eq("status", JobStatus.Active)
    .order("is_featured", { ascending: false })
    .order("published_at", { ascending: false });

  if (filters.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,location.ilike.%${filters.search}%`,
    );
  }
  if (filters.workMode?.length) query = query.in("work_mode", filters.workMode);
  if (filters.jobType?.length) query = query.in("job_type", filters.jobType);
  if (filters.experienceLevel?.length)
    query = query.in("experience_level", filters.experienceLevel);
  if (filters.salaryMin !== undefined)
    query = query.gte("salary_min", filters.salaryMin);
  if (filters.salaryMax !== undefined)
    query = query.lte("salary_max", filters.salaryMax);
  if (filters.locations?.length) {
    const locationFilters = filters.locations
      .map((l) => `location.ilike.%${l}%`)
      .join(",");
    query = query.or(locationFilters);
  }
  if (filters.skills?.length) query = query.overlaps("skills", filters.skills);

  return query;
};

const applyIndustryFilter = (
  mapped: PremiumJobCard[],
  filters: PremiumJobFilters,
) =>
  filters.industries?.length
    ? mapped.filter((j) =>
        j.CompanyMeta.Industry?.some((i) => filters.industries!.includes(i)),
      )
    : mapped;

export const getPremiumJobs = async (
  filters: PremiumJobFilters = {},
  page: number = 1,
  pageSize: number = 10,
): Promise<PaginatedPremiumJobs> => {
  const supabase = createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const query = buildPremiumJobsQuery(supabase, filters)
    .lte("published_at", cutoff)
    .range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("getPremiumJobs error:", error);
    return { data: [], total: 0, page, pageSize, hasMore: false };
  }

  const mapped = (data ?? []).map(mapPremiumJobRow);
  const filtered = applyIndustryFilter(mapped, filters);

  const total = count ?? 0;
  return {
    data: filtered,
    total,
    page,
    pageSize,
    hasMore: from + mapped.length < total,
  };
};

export const getPremiumPlusJobs = async (
  filters: PremiumJobFilters = {},
  page: number = 1,
  pageSize: number = 10,
): Promise<PaginatedPremiumJobs> => {
  const supabase = createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const query = buildPremiumJobsQuery(supabase, filters).range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("getPremiumPlusJobs error:", error);
    return { data: [], total: 0, page, pageSize, hasMore: false };
  }

  const mapped = (data ?? []).map(mapPremiumJobRow);
  const filtered = applyIndustryFilter(mapped, filters);

  const total = count ?? 0;
  return {
    data: filtered,
    total,
    page,
    pageSize,
    hasMore: from + mapped.length < total,
  };
};

// ─── getPremiumFilterFacets ────────────────────────────────────────────────────
export interface PremiumFilterFacets {
  locations: { label: string; count: number }[];
  industries: { label: string; count: number }[];
}

export const getPremiumFilterFacets =
  async (): Promise<PremiumFilterFacets> => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("jobs")
      .select("location, company_meta")
      .not("company_meta", "is", null)
      .eq("status", JobStatus.Active);

    if (error || !data) return { locations: [], industries: [] };

    const locationCount: Record<string, number> = {};
    const industryCount: Record<string, number> = {};

    for (const row of data as any[]) {
      const loc = row.location as string;
      if (loc) locationCount[loc] = (locationCount[loc] ?? 0) + 1;

      const industries: string[] =
        row.company_meta?.industry ?? row.company_meta?.Industry ?? [];
      for (const ind of industries) {
        industryCount[ind] = (industryCount[ind] ?? 0) + 1;
      }
    }

    const toSorted = (map: Record<string, number>) =>
      Object.entries(map)
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count);

    return {
      locations: toSorted(locationCount),
      industries: toSorted(industryCount),
    };
  };
