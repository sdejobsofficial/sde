// types/job.ts

import { JobDescription } from "@/components/company/CompanyDescriptionRenderer";
import { CompanySize } from "./userModel";

// ─────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────

export enum JobStatus {
  Draft = 0,
  PendingApproval = 1,
  Active = 2,
  Paused = 3,
  Closed = 4,
  Rejected = 5,
}

export enum WorkMode {
  Remote = 0,
  Onsite = 1,
  Hybrid = 2,
}

export enum JobType {
  FullTime = 0,
  PartTime = 1,
  Internship = 2,
  Contract = 3,
  Freelance = 4,
}

export enum SalaryType {
  Monthly = 0,
  Annual = 1,
  Hourly = 2,
  Stipend = 3, // for internships
  Unpaid = 4, // for unpaid internships
}

export enum ExperienceLevel {
  Fresher = 0, // 0 years
  Junior = 1, // 0–2 years
  Mid = 2, // 2–5 years
  Senior = 3, // 5–10 years
  Lead = 4, // 8+ years
  Executive = 5, // C-level / Director
}

export enum FormType {
  Internal = 0, // custom form built inside ReferNest
  External = 1, // redirect to company's own ATS/URL
}

export enum FormFieldType {
  TextInput = 0,
  TextArea = 1,
  Dropdown = 2,
  MultiSelect = 3,
  RadioGroup = 4,
  Checkbox = 5,
  // FilePicker = 6, // resume, portfolio etc.
  DatePicker = 7,
  NumberInput = 8,
  PhoneInput = 9,
  UrlInput = 10,
  RatingPicker = 11,
}

export enum SalaryVisibility {
  Visible = 0,
  HiddenFromCandidates = 1,
  Negotiable = 2,
}

export enum ReferralStatus {
  Open = 0, // company accepts referrals
  Closed = 1, // referrals not accepted for this job
}

// ─────────────────────────────────────────────
// Internal Form Builder Types (JSONB)
// ─────────────────────────────────────────────

export interface FormFieldOption {
  Label: string;
  Value: string;
}

export interface FormField {
  Id: string; // UUID for the field
  Type: FormFieldType;
  Label: string; // e.g. "Why do you want to join?"
  Placeholder?: string;
  Required: boolean;
  Order: number; // display order
  Options?: FormFieldOption[]; // for Dropdown / MultiSelect / RadioGroup
  MaxLength?: number; // for TextInput / TextArea
  MinLength?: number;
  AcceptedFileTypes?: string[]; // for FilePicker e.g. [".pdf", ".docx"]
  MaxFileSizeMb?: number; // for FilePicker
  Min?: number; // for NumberInput / RatingPicker
  Max?: number;
  HelpText?: string; // shown below the field
}

export interface InternalApplicationForm {
  Fields: FormField[];
  IncludeResume: boolean; // auto-add resume field
  IncludeCoverLetter: boolean; // auto-add cover letter field
  IncludeLinkedIn: boolean;
  IncludePortfolio: boolean;
}

// ─────────────────────────────────────────────
// Description (JSONB — WYSIWYG output)
// Stored as TipTap / EditorJS JSON
// ─────────────────────────────────────────────

export interface DescriptionNode {
  Type: string; // "paragraph" | "heading" | "bulletList" | "orderedList" | etc.
  Content?: DescriptionNode[];
  Text?: string;
  Marks?: { Type: string; Attrs?: Record<string, unknown> }[];
  Attrs?: Record<string, unknown>;
}

// ─────────────────────────────────────────────
// Salary Details (nested object)
// ─────────────────────────────────────────────

export interface SalaryRange {
  Min: number;
  Max: number;
  Currency: string; // "INR" | "USD" etc.
  Type: SalaryType;
  Visibility: SalaryVisibility;
}

// ─────────────────────────────────────────────
// Experience Required
// ─────────────────────────────────────────────

export interface ExperienceRequired {
  Level: ExperienceLevel;
  MinYears: number;
  MaxYears?: number;
}

// ─────────────────────────────────────────────
// Core Job Model
// ─────────────────────────────────────────────

export interface Job {
  Id: string; // UUID
  CompanyId: string; // FK → users.id (role = Company)
  PostedBy: string; // FK → users.id (recruiter who posted)

  // ── Content ──
  Title: string;
  Description: JobDescription; // JSONB — WYSIWYG output
  Skills: string[]; // required skills e.g. ["React", "Node.js"]
  Location: string; // city / "Remote"

  // ── Classification ──
  JobType: JobType;
  WorkMode: WorkMode;
  ExperienceRequired: ExperienceRequired;
  Salary: SalaryRange;

  // ── Openings & counts ──
  TotalOpenings: number;
  TotalApplicants: number; // denormalized counter — updated on each apply
  TotalReferrals: number; // referral applications counter
  TotalViews: number; // profile view counter

  // ── Application ──
  FormType: FormType;
  ExternalApplyUrl?: string; // only when FormType = External
  ApplicationForm?: InternalApplicationForm; // only when FormType = Internal — JSONB

  // ── Referrals ──
  ReferralStatus: ReferralStatus;
  ReferralBonus?: string; // e.g. "₹5,000 gift card on successful hire"

  // ── Status & visibility ──
  Status: JobStatus;
  IsFeatured: boolean; // admin can mark as featured
  IsUrgent: boolean; // shows "Urgently hiring" badge

  // ── Deadline ──
  ApplicationDeadline?: string; // ISO timestamp

  // ── Timestamps ──
  CreatedAt: string;
  UpdatedAt: string;
  PublishedAt?: string;
  ClosedAt?: string;
}

// ─────────────────────────────────────────────
// Discriminated union for form type narrowing
// ─────────────────────────────────────────────

export interface InternalJob extends Job {
  FormType: FormType.Internal;
  ApplicationForm: InternalApplicationForm;
  ExternalApplyUrl: undefined;
}

export interface ExternalJob extends Job {
  FormType: FormType.External;
  ExternalApplyUrl: string;
  ApplicationForm: undefined;
}

export type AppJob = InternalJob | ExternalJob;

// ─────────────────────────────────────────────
// Type Guards
// ─────────────────────────────────────────────

export const IsInternalJob = (job: AppJob): job is InternalJob =>
  job.FormType === FormType.Internal;

export const IsExternalJob = (job: AppJob): job is ExternalJob =>
  job.FormType === FormType.External;

export const IsJobActive = (job: Job): boolean =>
  job.Status === JobStatus.Active;

export const IsJobOpen = (job: Job): boolean =>
  job.Status === JobStatus.Active &&
  job.TotalApplicants < job.TotalOpenings &&
  (!job.ApplicationDeadline || new Date(job.ApplicationDeadline) > new Date());

export const AcceptsReferrals = (job: Job): boolean =>
  job.ReferralStatus === ReferralStatus.Open && IsJobOpen(job);

// ─────────────────────────────────────────────
// DTOs
// ─────────────────────────────────────────────

export interface CreateJobDTO {
  Title: string;
  Description: JobDescription;
  Skills: string[];
  Location: string;
  JobType: JobType;
  WorkMode: WorkMode;
  ExperienceRequired: ExperienceRequired;
  Salary: SalaryRange;
  TotalOpenings: number;
  FormType: FormType;
  ExternalApplyUrl?: string;
  ApplicationForm?: InternalApplicationForm;
  ReferralStatus: ReferralStatus;
  ReferralBonus?: string;
  ApplicationDeadline?: string;
  IsUrgent?: boolean;
}

export interface UpdateJobDTO extends Partial<CreateJobDTO> {
  Status?: JobStatus;
  IsFeatured?: boolean;
}

// ─────────────────────────────────────────────
// Job card (lightweight — for listing pages)
// ─────────────────────────────────────────────

export interface JobCard {
  Id: string;
  Title: string;
  CompanyId: string;
  CompanyName: string;
  CompanyLogoUrl?: string;
  Location: string;
  WorkMode: WorkMode;
  JobType: JobType;
  Salary: Pick<SalaryRange, "Min" | "Max" | "Currency" | "Type" | "Visibility">;
  ExperienceRequired: ExperienceRequired;
  Skills: string[];
  TotalOpenings: number;
  TotalApplicants: number;
  ReferralStatus: ReferralStatus;
  IsFeatured: boolean;
  IsUrgent: boolean;
  Status: JobStatus;
  ApplicationDeadline?: string;
  PublishedAt?: string;
}


export interface JobInteraction {
  Title: string;
  CompanyName?: string;
  Location: string;
  Skills: string[];
  Description: JobDescription;
  JobType: number;
  WorkMode: number;
  ExperienceLevel: number;
  ExperienceMinYears?: number | null;
  ExperienceMaxYears?: number | null;
  SalaryMin: number;
  SalaryMax: number;
  SalaryCurrency: string;
  SalaryType: number;
  SalaryVisibility: number;
  TotalOpenings: number;
  FormType: number;
  ExternalApplyUrl?: string | null;
  ApplicationForm?: unknown | null;
  ReferralStatus: number;
  ReferralBonus?: string | null;
  IsUrgent?: boolean;
  ApplicationDeadline?: string | null;
  Status: JobStatus;
}


export interface CompanyFilters {
  search?: string;
  industries?: string[];
  sizes?: number[];
  locations?: string[];
  hiringOnly?: boolean;
  verifiedOnly?: boolean;
}

export interface CompanyCard {
  Id: string;
  Name: string;
  LogoUrl?: string;
  Location?: string;
  Bio?: string;
  Industries: string[];
  Size?: CompanySize;
  Website?: string;
  VerificationStatus: number;
  ActiveJobs: number;
  SocialLinks?: { LinkedIn?: string; Twitter?: string; Website?: string };
}

export interface PaginatedCompanies {
  data: CompanyCard[];
  total: number;
  hasMore: boolean;
}

export function isTechJob(title: string, skills: string[] = []): boolean {
  const techKeywords = [
    "software", "engineer", "developer", "programmer", "data", "qa", 
    "frontend", "backend", "fullstack", "cloud", "devops", "system", 
    "network", "architect", "analyst", "tech", "technology", "web",
    "coder", "programming", "coding", "it", "design", "security", "database"
  ];
  const lowerTitle = title.toLowerCase();
  const hasTechKeyword = techKeywords.some(kw => lowerTitle.includes(kw));
  
  const techSkills = [
    "react", "node", "python", "sql", "git", "java", "typescript", "ts", "js",
    "javascript", "postgres", "html", "css", "c++", "c#", "ruby", "php", "aws",
    "docker", "kubernetes", "go", "golang", "swift", "kotlin", "rust"
  ];
  const hasTechSkill = skills.some(skill => 
    techSkills.some(ts => skill.toLowerCase().includes(ts))
  );

  const nonTechKeywords = ["marketing", "producer", "video", "sales", "hr", "recruiter", "writer", "content", "finance", "accountant", "operation", "operations", "non-tech", "non tech"];
  const hasNonTechKeyword = nonTechKeywords.some(kw => lowerTitle.includes(kw));
  
  if (hasNonTechKeyword && !lowerTitle.includes("engineer") && !lowerTitle.includes("developer")) {
    return false;
  }
  
  return true;
}