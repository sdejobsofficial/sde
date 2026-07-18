"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  X,
  Star,
  Calendar,
  Phone,
  Link as LinkIcon,
  Hash,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/useUser";
import { FormFieldType, FormType } from "@/models/jobModel";
import type { FormField } from "@/models/jobModel";
import { useHasApplied, useSubmitApplication } from "@/hooks/useApplication";
import { useJobById } from "@/hooks/useJobs";
import { AnswerType, FieldAnswer } from "@/models/applicationModel";
import Image from "next/image";

// ─── Field type → AnswerType map ──────────────────────────────────────────

const FIELD_TO_ANSWER: Record<FormFieldType, AnswerType> = {
  [FormFieldType.TextInput]: AnswerType.Text,
  [FormFieldType.TextArea]: AnswerType.Text,
  [FormFieldType.Dropdown]: AnswerType.SingleChoice,
  [FormFieldType.MultiSelect]: AnswerType.MultiChoice,
  [FormFieldType.RadioGroup]: AnswerType.SingleChoice,
  [FormFieldType.Checkbox]: AnswerType.Boolean,
  [FormFieldType.DatePicker]: AnswerType.Date,
  [FormFieldType.NumberInput]: AnswerType.Number,
  [FormFieldType.PhoneInput]: AnswerType.Phone,
  [FormFieldType.UrlInput]: AnswerType.Url,
  [FormFieldType.RatingPicker]: AnswerType.Rating,
};

// ─── Individual field renderers ───────────────────────────────────────────

function FieldLabel({ label, required }: { label: string; required: boolean }) {
  return (
    <Label className="text-sm font-medium text-foreground/80">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </Label>
  );
}

function HelpText({ text }: { text?: string }) {
  if (!text) return null;
  return <p className="text-xs text-muted-foreground/80 mt-1">{text}</p>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
      <AlertCircle size={11} />
      {message}
    </p>
  );
}

// ─── Rating picker ────────────────────────────────────────────────────────

function RatingPicker({
  value,
  onChange,
  min = 1,
  max = 5,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={cn(
            "transition-all",
            n <= value
              ? "text-amber-400"
              : "text-gray-200 hover:text-amber-300",
          )}
        >
          <Star size={24} fill={n <= value ? "currentColor" : "none"} />
        </button>
      ))}
      {value > 0 && (
        <span className="text-xs text-muted-foreground ml-1">
          {value}/{max}
        </span>
      )}
    </div>
  );
}

// ─── Dynamic field renderer ───────────────────────────────────────────────

function DynamicField({
  field,
  value,
  onChange,
  error,
}: {
  field: FormField;
  value: any;
  onChange: (v: any) => void;
  error?: string;
}) {
  const base =
    "h-10 text-sm rounded-xl border-border bg-muted/50/80 focus:bg-card focus:border-primary transition-all";
  const errClass = error ? "border-red-300" : "";

  switch (field.Type) {
    case FormFieldType.TextInput:
      return (
        <Input
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.Placeholder}
          className={cn(base, errClass)}
        />
      );

    case FormFieldType.TextArea:
      return (
        <Textarea
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.Placeholder}
          rows={4}
          className={cn(
            "text-sm rounded-xl border-border bg-muted/50/80 focus:bg-card focus:border-primary resize-none transition-all",
            errClass,
          )}
        />
      );

    case FormFieldType.Dropdown:
      return (
        <select
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full h-10 px-3 text-sm rounded-xl border border-border bg-muted/50/80 focus:bg-card focus:border-primary outline-none transition-all",
            errClass,
          )}
        >
          <option value="">Select an option</option>
          {(field.Options ?? []).map((opt) => (
            <option key={opt.Value} value={opt.Value}>
              {opt.Label}
            </option>
          ))}
        </select>
      );

    case FormFieldType.RadioGroup:
      return (
        <div className="space-y-2">
          {(field.Options ?? []).map((opt) => (
            <label
              key={opt.Value}
              className="flex items-center gap-3 cursor-pointer group p-2.5 rounded-xl hover:bg-primary/10 transition-all"
            >
              <div
                onClick={() => onChange(opt.Value)}
                className={cn(
                  "w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
                  value === opt.Value
                    ? "border-primary bg-primary"
                    : "border-gray-300 group-hover:border-primary",
                )}
              >
                {value === opt.Value && (
                  <span className="w-1.5 h-1.5 rounded-full bg-card" />
                )}
              </div>
              <span className="text-sm text-foreground/80 group-hover:text-primary/90 transition-colors">
                {opt.Label}
              </span>
            </label>
          ))}
        </div>
      );

    case FormFieldType.MultiSelect:
      const selected: string[] = Array.isArray(value) ? value : [];
      return (
        <div className="space-y-2">
          {(field.Options ?? []).map((opt) => {
            const checked = selected.includes(opt.Value);
            return (
              <label
                key={opt.Value}
                className="flex items-center gap-3 cursor-pointer group p-2.5 rounded-xl hover:bg-primary/10 transition-all"
              >
                <div
                  onClick={() =>
                    onChange(
                      checked
                        ? selected.filter((v) => v !== opt.Value)
                        : [...selected, opt.Value],
                    )
                  }
                  className={cn(
                    "w-4 h-4 rounded flex items-center justify-center border transition-all flex-shrink-0",
                    checked
                      ? "bg-primary border-primary"
                      : "border-gray-300 group-hover:border-primary",
                  )}
                >
                  {checked && (
                    <svg
                      viewBox="0 0 10 10"
                      className="w-2.5 h-2.5 text-primary-foreground"
                      fill="none"
                    >
                      <path
                        d="M1.5 5l2.5 2.5 4.5-4.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-foreground/80 group-hover:text-primary/90 transition-colors">
                  {opt.Label}
                </span>
              </label>
            );
          })}
        </div>
      );

    case FormFieldType.Checkbox:
      return (
        <label className="flex items-center gap-3 cursor-pointer group">
          <div
            onClick={() => onChange(!value)}
            className={cn(
              "w-5 h-5 rounded-lg flex items-center justify-center border-2 transition-all flex-shrink-0",
              value
                ? "bg-primary border-primary"
                : "border-gray-300 group-hover:border-primary",
            )}
          >
            {value && (
              <svg
                viewBox="0 0 10 10"
                className="w-3 h-3 text-primary-foreground"
                fill="none"
              >
                <path
                  d="M1.5 5l2.5 2.5 4.5-4.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors">
            {field.Placeholder || "Yes"}
          </span>
        </label>
      );

    case FormFieldType.DatePicker:
      return (
        <div className="relative">
          <Calendar
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 pointer-events-none"
            size={14}
          />
          <Input
            type="date"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className={cn("pl-9", base, errClass)}
          />
        </div>
      );

    case FormFieldType.NumberInput:
      return (
        <div className="relative">
          <Hash
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 pointer-events-none"
            size={14}
          />
          <Input
            type="number"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.Placeholder}
            min={field.Min}
            max={field.Max}
            className={cn("pl-9", base, errClass)}
          />
        </div>
      );

    case FormFieldType.PhoneInput:
      return (
        <div className="relative">
          <Phone
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 pointer-events-none"
            size={14}
          />
          <Input
            type="tel"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.Placeholder || "+91 XXXXX XXXXX"}
            className={cn("pl-9", base, errClass)}
          />
        </div>
      );

    case FormFieldType.UrlInput:
      return (
        <div className="relative">
          <LinkIcon
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 pointer-events-none"
            size={14}
          />
          <Input
            type="url"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.Placeholder || "https://"}
            className={cn("pl-9", base, errClass)}
          />
        </div>
      );

    case FormFieldType.RatingPicker:
      return (
        <RatingPicker
          value={value ?? 0}
          onChange={onChange}
          min={field.Min ?? 1}
          max={field.Max ?? 5}
        />
      );

    default:
      return null;
  }
}

// ─── Success screen ───────────────────────────────────────────────────────

function SuccessScreen({
  jobTitle,
  companyName,
  jobId,
}: {
  jobTitle: string;
  companyName: string;
  jobId: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center max-w-md mx-auto">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
        <CheckCircle2 className="text-green-500" size={36} />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">
        Application submitted!
      </h2>
      <p className="text-muted-foreground text-sm leading-relaxed mb-8">
        Your application for{" "}
        <span className="font-semibold text-foreground/80">{jobTitle}</span> at{" "}
        <span className="font-semibold text-foreground/80">{companyName}</span> has
        been submitted successfully. The recruiter will review your profile and
        get back to you.
      </p>
      <div className="flex gap-3">
        <Link href="/jobs">
          <Button
            variant="outline"
            className="h-10 px-5 rounded-xl border-border text-sm font-medium hover:bg-muted/50"
          >
            Browse more jobs
          </Button>
        </Link>
        <Link href="/applications">
          <Button className="h-10 px-5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-medium shadow-md shadow-primary/30">
            View my applications
          </Button>
        </Link>
      </div>
    </div>
  );
}

// ─── Main apply page ──────────────────────────────────────────────────────

export default function ApplyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: job, isLoading: jobLoading } = useJobById(id);
  const { data: user } = useCurrentUser();
  const { data: alreadyApplied } = useHasApplied(id);
  const { mutateAsync: submitApplication, isPending } = useSubmitApplication();

  // ── State for auto fields ──
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [linkedInUrl, setLinkedInUrl] = useState(
    (user?.Meta)?.SocialLinks?.LinkedIn ?? "",
  );
  const [portfolioUrl, setPortfolioUrl] = useState(
    (user?.Meta)?.SocialLinks?.Portfolio ?? "",
  );

  // ── State for dynamic field answers ──
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const form = job?.ApplicationForm;
  const fields: FormField[] = form?.Fields ?? [];

  const updateAnswer = (fieldId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) setErrors((prev) => ({ ...prev, [fieldId]: "" }));
  };

  // ── Validate required fields ──
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (form?.IncludeResume && !resumeFile) {
      newErrors["__resume"] = "Resume is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const fieldAnswers: Omit<FieldAnswer, "FieldLabel">[] = fields.map(
      (field) => ({
        FieldId: field.Id,
        Type: FIELD_TO_ANSWER[field.Type],
        Value: answers[field.Id] ?? null,
      }),
    );

    await submitApplication({
      JobId: id,
      AutoFields: {
        ResumeUrl: undefined, // TODO: upload resumeFile to Supabase Storage
        ResumeFileName: resumeFile?.name,
        CoverLetter: coverLetter || undefined,
        LinkedInUrl: linkedInUrl || undefined,
        PortfolioUrl: portfolioUrl || undefined,
      },
      Answers: fieldAnswers,
    });

    setSubmitted(true);
  };

  // ── Loading ──
  if (jobLoading) {
    return (
      <div className="min-h-screen bg-muted/50/80 flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-xl px-6">
          <div className="h-8 bg-muted rounded w-1/2" />
          <div className="h-64 bg-card rounded-2xl border border-gray-100" />
        </div>
      </div>
    );
  }

  if (!job || job.FormType !== FormType.Internal) {
    return (
      <div className="min-h-screen bg-muted/50/80 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="text-gray-300 mx-auto mb-3" size={32} />
          <p className="text-sm text-muted-foreground">
            This job does not have an internal form.
          </p>
          <Link href={`/jobs/${id}`}>
            <Button
              variant="outline"
              className="mt-4 h-9 px-4 rounded-xl text-sm"
            >
              ← Back to job
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const meta = user?.Meta as any;
  const companyName = (job as any).CompanyName ?? "Company";

  return (
    <div className="min-h-screen bg-muted/50/80">
      {/* Header */}
      <div className="bg-card border-b border-gray-100 shadow-sm py-4 px-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link
            href={`/jobs/${id}`}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground/80 hover:bg-muted transition-all"
          >
            <ArrowLeft size={16} />
          </Link>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-xl border border-gray-100 bg-muted/50 flex items-center justify-center overflow-hidden flex-shrink-0">
              {(job as any).CompanyLogoUrl ? (
                <Image
                  src={(job as any).CompanyLogoUrl}
                  alt=""
                  className="w-full h-full object-contain"
                  width={36}
                  height={36}
                />
              ) : (
                <Building2 size={15} className="text-gray-300" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground truncate">
                {job.Title}
              </p>
              <p className="text-xs text-muted-foreground">{companyName}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {submitted ? (
          <div className="bg-card rounded-3xl border border-gray-100 shadow-sm">
            <SuccessScreen
              jobTitle={job.Title}
              companyName={companyName}
              jobId={id}
            />
          </div>
        ) : alreadyApplied ? (
          <div className="bg-card rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-16 px-8 text-center">
            <CheckCircle2 className="text-primary mb-4" size={40} />
            <h2 className="text-lg font-bold text-foreground mb-2">
              Already applied
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              You have already submitted an application for this job.
            </p>
            <div className="flex gap-3">
              <Link href="/jobs">
                <Button
                  variant="outline"
                  className="h-9 px-4 rounded-xl text-sm border-border"
                >
                  Browse jobs
                </Button>
              </Link>
              <Link href="/applications">
                <Button className="h-9 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm shadow-md shadow-primary/30">
                  My applications
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="bg-card rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Form header */}
              <div className="px-7 py-5 border-b border-gray-50">
                <h1 className="text-lg font-bold text-foreground">
                  Apply for this position
                </h1>
                <p className="text-sm text-muted-foreground/80 mt-0.5">
                  Fill in the details below to submit your application
                </p>
              </div>

              <div className="px-7 py-6 space-y-7">
                {/* ── Candidate info snapshot ── */}
                <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-2xl border border-primary/20">
                  <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center flex-shrink-0 text-primary/90 font-bold text-sm">
                    {user?.Name?.slice(0, 2).toUpperCase() ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground/90">
                      {user?.Name ?? "Your Name"}
                    </p>
                    <p className="text-xs text-muted-foreground">{user?.Email}</p>
                  </div>
                  <Link href="/profile">
                    <Button
                      variant="outline"
                      className="h-7 px-3 text-xs rounded-lg border-primary/30 text-primary hover:bg-primary/20"
                    >
                      Edit profile
                    </Button>
                  </Link>
                </div>

                {/* ── Auto fields ── */}

                {/* Resume */}
                {form?.IncludeResume && (
                  <div className="space-y-2">
                    <FieldLabel label="Resume / CV" required={true} />
                    <p className="text-xs text-muted-foreground/80">
                      PDF or Word document, max 5MB
                    </p>

                    {!resumeFile ? (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragOver(true);
                        }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragOver(false);
                          const file = e.dataTransfer.files[0];
                          if (file) {
                            setResumeFile(file);
                            setErrors((p) => ({ ...p, __resume: "" }));
                          }
                        }}
                        className={cn(
                          "relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-10 px-6 cursor-pointer transition-all",
                          dragOver
                            ? "border-primary bg-primary/10"
                            : errors["__resume"]
                              ? "border-red-300 bg-red-50/30"
                              : "border-border bg-muted/50/80 hover:border-primary/40 hover:bg-primary/10/40",
                        )}
                      >
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setResumeFile(file);
                              setErrors((p) => ({ ...p, __resume: "" }));
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                          <Briefcase className="text-primary/100" size={22} />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-foreground/80">
                            Drag & drop your resume here
                          </p>
                          <p className="text-xs text-muted-foreground/80 mt-1">
                            or{" "}
                            <span className="text-primary font-medium underline underline-offset-2">
                              browse to upload
                            </span>
                          </p>
                        </div>
                        <p className="text-xs text-gray-300">
                          PDF · DOC · DOCX · Max 5MB
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-primary/30 bg-primary/10">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <Briefcase className="text-primary" size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground/90 truncate">
                            {resumeFile.name}
                          </p>
                          <p className="text-xs text-muted-foreground/80 mt-0.5">
                            {(resumeFile.size / 1024).toFixed(0)} KB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setResumeFile(null)}
                          className="w-7 h-7 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground/80 hover:text-red-500 hover:border-red-200 transition-all flex-shrink-0"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    )}

                    {resumeFile && (
                      <label className="inline-flex items-center gap-1.5 text-xs text-primary cursor-pointer hover:text-primary/90 transition-colors mt-1">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setResumeFile(file);
                              setErrors((p) => ({ ...p, __resume: "" }));
                            }
                          }}
                          className="hidden"
                        />
                        <Plus size={12} />
                        Replace resume
                      </label>
                    )}

                    <FieldError message={errors["__resume"]} />
                  </div>
                )}

                {/* Cover letter */}
                {form?.IncludeCoverLetter && (
                  <div className="space-y-2">
                    <FieldLabel label="Cover letter" required={false} />
                    <Textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Tell the recruiter why you're excited about this role and what makes you a great fit..."
                      rows={5}
                      className="text-sm rounded-xl border-border bg-muted/50/80 focus:bg-card focus:border-primary resize-none transition-all"
                    />
                  </div>
                )}

                {/* LinkedIn */}
                {form?.IncludeLinkedIn && (
                  <div className="space-y-2">
                    <FieldLabel label="LinkedIn profile" required={false} />
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#0077B5] bg-[#0077B5]/10 px-1.5 py-0.5 rounded">
                        in
                      </span>
                      <Input
                        type="url"
                        value={linkedInUrl}
                        onChange={(e) => setLinkedInUrl(e.target.value)}
                        placeholder="https://linkedin.com/in/yourname"
                        className="pl-10 h-10 text-sm rounded-xl border-border bg-muted/50/80 focus:bg-card focus:border-primary transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Portfolio */}
                {form?.IncludePortfolio && (
                  <div className="space-y-2">
                    <FieldLabel label="Portfolio / Website" required={false} />
                    <div className="relative">
                      <LinkIcon
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 pointer-events-none"
                        size={14}
                      />
                      <Input
                        type="url"
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                        placeholder="https://yourportfolio.com"
                        className="pl-9 h-10 text-sm rounded-xl border-border bg-muted/50/80 focus:bg-card focus:border-primary transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* ── Custom fields ── */}
                {fields.length > 0 && (
                  <>
                    {(form?.IncludeResume ||
                      form?.IncludeCoverLetter ||
                      form?.IncludeLinkedIn ||
                      form?.IncludePortfolio) && (
                      <div className="h-px bg-muted" />
                    )}
                    {fields.map((field) => (
                      <div key={field.Id} className="space-y-2">
                        <FieldLabel
                          label={field.Label}
                          required={field.Required}
                        />
                        <DynamicField
                          field={field}
                          value={answers[field.Id]}
                          onChange={(v: any) => updateAnswer(field.Id, v)}
                          error={errors[field.Id]}
                        />
                        <HelpText text={field.HelpText} />
                        <FieldError message={errors[field.Id]} />
                      </div>
                    ))}
                  </>
                )}

                {/* ── Divider ── */}
                <div className="h-px bg-muted" />

                {/* ── Submit ── */}
                <div className="flex gap-3">
                  <Link href={`/jobs/${id}`} className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-11 rounded-xl border-border text-muted-foreground hover:bg-muted/50 text-sm font-medium"
                    >
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="flex-[2] h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-primary/30 transition-all"
                  >
                    {isPending ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8z"
                          />
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      <>
                        Submit application <ArrowRight size={15} />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}