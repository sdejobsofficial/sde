// models/applicationModel.ts

// ─────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────

export enum ApplicationStatus {
  Submitted = 0,      // just applied
  Seen = 1,           // recruiter opened it
  Shortlisted = 2,    // moved to shortlist
  InterviewScheduled = 3,
  OfferSent = 4,
  Hired = 5,
  Rejected = 6,
  Withdrawn = 7,      // candidate withdrew
}

export enum ApplicationType {
  Direct = 0,         // candidate applied directly
  Referral = 1,       // candidate was referred by someone
}

export enum RejectionReason {
  NotAFit = 0,
  OverQualified = 1,
  UnderQualified = 2,
  PositionFilled = 3,
  NoResponse = 4,
  Other = 5,
}

// ─────────────────────────────────────────────
// Form field answer types (mirrors FormFieldType)
// ─────────────────────────────────────────────

export enum AnswerType {
  Text = 0,
  Number = 1,
  Date = 2,
  SingleChoice = 3,   // dropdown / radio
  MultiChoice = 4,    // multi-select
  Boolean = 5,        // checkbox
  File = 6,           // file upload
  Url = 7,
  Phone = 8,
  Rating = 9,
}

// ─────────────────────────────────────────────
// Nested: form field answer (JSONB)
// ─────────────────────────────────────────────

export interface FieldAnswer {
  FieldId: string;                     // references FormField.Id
  FieldLabel: string;                  // snapshot of label at time of apply
  Type: AnswerType;
  Value: string | number | boolean | string[] | null;
  FileUrl?: string;                    // populated if Type = File (Supabase Storage URL)
  FileName?: string;
  FileSizeBytes?: number;
}

// ─────────────────────────────────────────────
// Nested: auto-included fields snapshot (JSONB)
// These come from the InternalApplicationForm toggles
// ─────────────────────────────────────────────

export interface ApplicationAutoFields {
  ResumeUrl?: string;                  // Supabase Storage URL
  ResumeFileName?: string;
  CoverLetter?: string;                // free-text
  LinkedInUrl?: string;
  PortfolioUrl?: string;
}

// ─────────────────────────────────────────────
// Nested: recruiter notes (JSONB array)
// ─────────────────────────────────────────────

export interface RecruiterNote {
  Id: string;                          // UUID
  AuthorId: string;                    // recruiter user id
  AuthorName: string;                  // snapshot
  Content: string;
  CreatedAt: string;                   // ISO timestamp
}

// ─────────────────────────────────────────────
// Nested: status history (JSONB array)
// ─────────────────────────────────────────────

export interface StatusHistoryEntry {
  Status: ApplicationStatus;
  ChangedBy: string;                   // user id
  ChangedAt: string;                   // ISO timestamp
  Note?: string;                       // optional reason
}

// ─────────────────────────────────────────────
// Core Application Model
// ─────────────────────────────────────────────

export interface Application {
  Id: string;                          // UUID
  JobId: string;                       // FK → jobs.id
  ApplicantId: string;                 // FK → users.id (job seeker)
  CompanyId: string;                   // FK → users.id (company) — denormalized for fast filtering
  ReferredBy?: string;                 // FK → users.id (who referred) — null if direct

  // ── Application type ──
  Type: ApplicationType;

  // ── Status ──
  Status: ApplicationStatus;
  RejectionReason?: RejectionReason;
  RejectionNote?: string;              // recruiter's custom note on rejection

  // ── Candidate snapshot (at time of apply) ──
  // Stored so profile changes don't affect submitted applications
  CandidateName: string;
  CandidateEmail: string;
  CandidatePhone?: string;
  CandidateLocation?: string;
  CandidateAvatarUrl?: string;

  // ── Form responses (JSONB) ──
  AutoFields: ApplicationAutoFields;   // resume, cover letter, linkedin, portfolio
  Answers: FieldAnswer[];              // responses to custom form fields

  // ── Recruiter activity (JSONB) ──
  Notes: RecruiterNote[];
  StatusHistory: StatusHistoryEntry[];
  IsStarred: boolean;                  // recruiter bookmarked this applicant
  RecruiterRating?: number;            // 1–5 internal rating

  // ── Timestamps ──
  CreatedAt: string;
  UpdatedAt: string;
  SeenAt?: string;                     // when recruiter first opened
}

// ─────────────────────────────────────────────
// Discriminated types by application type
// ─────────────────────────────────────────────

export interface DirectApplication extends Application {
  Type: ApplicationType.Direct;
  ReferredBy: undefined;
}

export interface ReferralApplication extends Application {
  Type: ApplicationType.Referral;
  ReferredBy: string;
}

export type AppApplication = DirectApplication | ReferralApplication;

// ─────────────────────────────────────────────
// Lightweight card type (for list views)
// ─────────────────────────────────────────────

export interface ApplicationCard {
  Id: string;
  JobId: string;
  JobTitle: string;
  CompanyId: string;
  CompanyName: string;
  CompanyLogoUrl?: string;
  ApplicantId: string;
  CandidateName: string;
  CandidateEmail: string;
  CandidateAvatarUrl?: string;
  CandidateLocation?: string;
  Type: ApplicationType;
  Status: ApplicationStatus;
  IsStarred: boolean;
  RecruiterRating?: number;
  ResumeUrl?: string;
  CreatedAt: string;
  UpdatedAt: string;
}

// ─────────────────────────────────────────────
// Type Guards
// ─────────────────────────────────────────────

export const IsDirectApplication = (app: AppApplication): app is DirectApplication =>
  app.Type === ApplicationType.Direct;

export const IsReferralApplication = (app: AppApplication): app is ReferralApplication =>
  app.Type === ApplicationType.Referral;

export const IsActive = (app: Application): boolean =>
  ![ApplicationStatus.Rejected, ApplicationStatus.Withdrawn, ApplicationStatus.Hired]
    .includes(app.Status);

export const IsHired = (app: Application): boolean =>
  app.Status === ApplicationStatus.Hired;

export const IsRejected = (app: Application): boolean =>
  app.Status === ApplicationStatus.Rejected;

// ─────────────────────────────────────────────
// DTOs
// ─────────────────────────────────────────────

// What the candidate submits when applying
export interface SubmitApplicationDTO {
  JobId: string;
  ReferredBy?: string;
  AutoFields: ApplicationAutoFields;
  Answers: Omit<FieldAnswer, "FieldLabel">[];  // labels resolved server-side
}

// What the recruiter does to an application
export interface UpdateApplicationStatusDTO {
  Status: ApplicationStatus;
  RejectionReason?: RejectionReason;
  RejectionNote?: string;
  Note?: string;                       // goes into StatusHistory
}

export interface AddRecruiterNoteDTO {
  Content: string;
}

export interface UpdateApplicationDTO {
  IsStarred?: boolean;
  RecruiterRating?: number;
}

// ─────────────────────────────────────────────
// Filter types (for applicant list)
// ─────────────────────────────────────────────

export interface ApplicationFilters {
  jobId?: string;
  status?: ApplicationStatus[];
  type?: ApplicationType;
  isStarred?: boolean;
  search?: string;                     // search by candidate name / email
}

export interface PaginatedApplications {
  Data: ApplicationCard[];
  Total: number;
  Page: number;
  PageSize: number;
  HasMore: boolean;
}