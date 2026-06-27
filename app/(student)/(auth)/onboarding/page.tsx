"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Briefcase,
  Check,
  ChevronRight,
  MapPin,
  Phone,
  User,
  Search,
  X,
  Plus,
  ArrowRight,
  BookOpen,
  Sparkles,
  Loader2,
  Upload,
  FileText,
  Zap,
  SkipForward,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GradingSystemEnum } from "@/models/userModel";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentUser, useUpdateJobSeekerMeta } from "@/hooks/useUser";
import { useFileUpload } from "@/hooks/useUpload";
import type { JobSeekerUser, UpdateJobSeekerMetaDTO } from "@/models/userModel";
import {
  FormSkeleton,
  SectionTitle,
  FieldError,
  TagSelector,
  YearPicker,
  GradingSelector,
  SkillInput,
} from "@/components/common/FormComponents";
import {
  BasicValues,
  basicSchema,
  EducationValues,
  educationSchema,
  QUALIFICATIONS,
  COURSES,
  COURSE_TYPES,
  SPECIALIZATIONS,
  STARTING_YEARS,
  PASSING_YEARS,
  LastStepValues,
  lastStepSchema,
  Step,
  SOCIAL_FIELDS,
} from "@/constants/student/SOnboardingConstants";
import {
  extractTextFromPDF,
  parseResumeWithGroq,
  type ParsedResume,
} from "@/lib/resumeParser";
import Image from "next/image";
import { useRouter } from "next/navigation";

// ─── Resume Upload / AI Parse Step ───────────────────────────────────────────

type ParseStatus = "idle" | "extracting" | "parsing" | "done" | "error";

function ResumeUploadStep({
  onParsed,
  onSkip,
}: {
  onParsed: (data: ParsedResume, file: File) => void;
  onSkip: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<ParseStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [parsedPreview, setParsedPreview] = useState<ParsedResume | null>(null);

  const statusMessages: Record<ParseStatus, string> = {
    idle: "",
    extracting: "Reading your resume…",
    parsing: "AI is extracting your details…",
    done: "Details extracted! Review and continue.",
    error: errorMsg,
  };

  const handleFile = (f: File) => {
    if (f.type !== "application/pdf") {
      setErrorMsg("Only PDF files are supported.");
      setStatus("error");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setErrorMsg("File must be under 5 MB.");
      setStatus("error");
      return;
    }
    setFile(f);
    setStatus("idle");
    setErrorMsg("");
    setParsedPreview(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const runParsing = async () => {
    if (!file) return;
    try {
      setStatus("extracting");
      const text = await extractTextFromPDF(file);

      setStatus("parsing");
      const parsed = await parseResumeWithGroq(text);

      setParsedPreview(parsed);
      setStatus("done");
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
      setStatus("error");
    }
  };

  const handleContinue = () => {
    if (parsedPreview && file) onParsed(parsedPreview, file);
  };

  const isLoading = status === "extracting" || status === "parsing";

  return (
    <div className="space-y-6">
      <div className="mb-7">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Zap size={14} className="text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">
            Auto-fill with your resume
          </h2>
        </div>
        <p className="text-muted-foreground/80 text-sm mt-1 pl-9">
          Upload your resume and we&apos;ll fill in your details automatically
          using AI
        </p>
      </div>

      {/* Drop Zone */}
      {!file ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            "relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed py-12 px-6 cursor-pointer transition-all",
            dragOver
              ? "border-primary bg-primary/5"
              : "border-gray-200 bg-muted/50/80 hover:border-primary/40 hover:bg-primary/5",
          )}
        >
          <input
            type="file"
            accept=".pdf"
            onChange={handleInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Upload className="text-primary" size={28} />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground/90">
              Drop your resume here
            </p>
            <p className="text-xs text-muted-foreground/80 mt-1">
              or{" "}
              <span className="text-primary font-medium underline underline-offset-2">
                browse to upload
              </span>
            </p>
          </div>
          <p className="text-xs text-gray-300">PDF · Max 5 MB</p>
        </div>
      ) : (
        /* File selected state */
        <div className="space-y-3">
          <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-primary/30 bg-primary/5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FileText className="text-primary" size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground/90 truncate">
                {file.name}
              </p>
              <p className="text-xs text-muted-foreground/80 mt-0.5">
                {(file.size / 1024).toFixed(0)} KB · PDF
              </p>
            </div>
            {status !== "done" && !isLoading && (
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setStatus("idle");
                  setParsedPreview(null);
                }}
                className="w-7 h-7 rounded-lg bg-card border border-gray-200 flex items-center justify-center text-muted-foreground/80 hover:text-red-500 hover:border-red-200 transition-all flex-shrink-0"
              >
                <X size={13} />
              </button>
            )}
            {status === "done" && (
              <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Check size={13} className="text-green-600" strokeWidth={3} />
              </div>
            )}
          </div>

          {/* Status bar */}
          {status !== "idle" && (
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all",
                status === "done" && "bg-green-50 text-green-700",
                status === "error" && "bg-red-50 text-red-600",
                isLoading && "bg-primary/5 text-primary",
              )}
            >
              {isLoading && (
                <Loader2 size={13} className="animate-spin flex-shrink-0" />
              )}
              {status === "done" && (
                <Check size={13} className="flex-shrink-0" strokeWidth={3} />
              )}
              {status === "error" && <X size={13} className="flex-shrink-0" />}
              <span>{statusMessages[status]}</span>
            </div>
          )}

          {/* Parsed preview chips */}
          {status === "done" && parsedPreview && (
            <div className="rounded-2xl border border-gray-100 bg-muted/50/80 p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Extracted details
              </p>
              <div className="flex flex-wrap gap-2">
                {parsedPreview.name && (
                  <PreviewChip label="Name" value={parsedPreview.name} />
                )}
                {parsedPreview.phone && (
                  <PreviewChip label="Phone" value={parsedPreview.phone} />
                )}
                {parsedPreview.location && (
                  <PreviewChip
                    label="Location"
                    value={parsedPreview.location}
                  />
                )}
                {parsedPreview.college && (
                  <PreviewChip label="College" value={parsedPreview.college} />
                )}
                {parsedPreview.course && (
                  <PreviewChip label="Course" value={parsedPreview.course} />
                )}
                {parsedPreview.passingYear && (
                  <PreviewChip
                    label="Graduating"
                    value={parsedPreview.passingYear}
                  />
                )}
                {parsedPreview.skills && parsedPreview.skills.length > 0 && (
                  <PreviewChip
                    label="Skills"
                    value={`${parsedPreview.skills.slice(0, 3).join(", ")}${parsedPreview.skills.length > 3 ? ` +${parsedPreview.skills.length - 3}` : ""}`}
                  />
                )}
              </div>
              <p className="text-xs text-muted-foreground/80 mt-1">
                Review and edit these in the next steps.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="space-y-3 pt-1">
        {status === "done" ? (
          <Button
            type="button"
            onClick={handleContinue}
            className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-md shadow-primary/30 transition-all"
          >
            Continue with autofilled details <ArrowRight size={15} />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={runParsing}
            disabled={!file || isLoading}
            className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-md shadow-primary/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                {statusMessages[status]}
              </>
            ) : (
              <>
                <Sparkles size={15} />
                Extract details with AI
              </>
            )}
          </Button>
        )}

        <button
          type="button"
          onClick={onSkip}
          className="w-full h-10 rounded-xl border border-gray-200 text-muted-foreground text-sm font-medium hover:bg-muted/50 transition-all flex items-center justify-center gap-2"
        >
          <SkipForward size={14} />
          Skip — I&apos;ll fill in manually
        </button>
      </div>
    </div>
  );
}

function PreviewChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 bg-card border border-gray-200 rounded-full px-3 py-1 text-xs">
      <span className="text-muted-foreground/80 font-medium">{label}:</span>
      <span className="text-foreground/80 font-semibold truncate max-w-[140px]">
        {value}
      </span>
    </div>
  );
}

// ─── Basic Step ───────────────────────────────────────────────────────────────

function BasicStep({
  onNext,
  defaultValues,
  isLoading,
}: {
  onNext: (data: BasicValues) => void;
  defaultValues?: Partial<BasicValues>;
  isLoading?: boolean;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BasicValues>({
    resolver: zodResolver(basicSchema),
    mode: "onTouched",
    defaultValues,
  });

  useEffect(() => {
    if (defaultValues) reset(defaultValues);
  }, [defaultValues, reset]);

  if (isLoading) return <FormSkeleton />;

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <SectionTitle
        title="Basic details"
        subtitle="Let recruiters know who you are and where you're from"
      />

      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-foreground/80">
          Full name<span className="text-red-500 ml-0.5">*</span>
        </Label>
        <div className="relative">
          <User
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 pointer-events-none"
            size={14}
          />
          <Input
            placeholder="John Doe"
            {...register("name")}
            className={cn(
              "pl-9 h-10 text-sm rounded-xl border-gray-200 bg-muted/50/80 focus:bg-card transition-all",
              errors.name && "border-red-300",
            )}
          />
        </div>
        <FieldError message={errors.name?.message} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground/80">
            Mobile number<span className="text-red-500 ml-0.5">*</span>
          </Label>
          <div className="flex gap-2">
            <div className="h-10 px-2.5 flex items-center border border-gray-200 bg-muted/50/80 rounded-xl text-xs text-muted-foreground font-medium flex-shrink-0 gap-1">
              <Phone size={12} className="text-muted-foreground/80" /> +91
            </div>
            <Input
              type="tel"
              placeholder="10-digit number"
              {...register("phone")}
              maxLength={10}
              className={cn(
                "h-10 text-sm rounded-xl border-gray-200 bg-muted/50/80 focus:bg-card transition-all",
                errors.phone && "border-red-300",
              )}
            />
          </div>
          <FieldError message={errors.phone?.message} />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground/80">
            Location<span className="text-red-500 ml-0.5">*</span>
          </Label>
          <div className="relative">
            <MapPin
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 pointer-events-none"
              size={14}
            />
            <Input
              placeholder="City, State"
              {...register("location")}
              className={cn(
                "pl-9 h-10 text-sm rounded-xl border-gray-200 bg-muted/50/80 focus:bg-card transition-all",
                errors.location && "border-red-300",
              )}
            />
          </div>
          <FieldError message={errors.location?.message} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-foreground/80">
          Bio{" "}
          <span className="text-muted-foreground/80 font-normal text-xs">(optional)</span>
        </Label>
        <Textarea
          placeholder="Write a short bio about yourself — your goals, interests and what you're looking for..."
          {...register("bio")}
          rows={3}
          className="text-sm rounded-xl border-gray-200 bg-muted/50/80 focus:bg-card resize-none transition-all"
        />
        <FieldError message={errors.bio?.message} />
      </div>

      <Button
        type="submit"
        className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-md shadow-primary/30 transition-all mt-2"
      >
        Save and continue <ArrowRight size={15} />
      </Button>
    </form>
  );
}

// ─── Education Step ───────────────────────────────────────────────────────────

function EducationStep({
  onNext,
  onBack,
  defaultValues,
  isLoading,
}: {
  onNext: (data: EducationValues) => void;
  onBack: () => void;
  defaultValues?: Partial<EducationValues>;
  isLoading?: boolean;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EducationValues>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      skills: [],
      qualification: "",
      course: "",
      courseType: "",
      specialization: "",
      college: "",
      startingYear: "",
      passingYear: "",
      ...defaultValues,
    },
    mode: "onTouched",
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        skills: [],
        qualification: "",
        course: "",
        courseType: "",
        specialization: "",
        college: "",
        startingYear: "",
        passingYear: "",
        ...defaultValues,
      });
    }
  }, [defaultValues, reset]);

  const w = watch();
  if (isLoading) return <FormSkeleton />;

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <SectionTitle
        title="Education details"
        subtitle="These details help recruiters identify your background"
      />

      <TagSelector
        label="Highest qualification/Degree currently pursuing"
        required
        options={QUALIFICATIONS}
        value={w.qualification}
        onChange={(v) =>
          setValue("qualification", v as string, { shouldValidate: true })
        }
        error={errors.qualification?.message}
      />

      <TagSelector
        label="Course"
        required
        options={COURSES}
        value={w.course}
        onChange={(v) =>
          setValue("course", v as string, { shouldValidate: true })
        }
        error={errors.course?.message}
      />

      <TagSelector
        label="Course type"
        required
        options={COURSE_TYPES}
        value={w.courseType}
        onChange={(v) =>
          setValue("courseType", v as string, { shouldValidate: true })
        }
        error={errors.courseType?.message}
      />

      <TagSelector
        label="Specialization"
        required
        options={SPECIALIZATIONS}
        value={w.specialization}
        onChange={(v) =>
          setValue("specialization", v as string, { shouldValidate: true })
        }
        error={errors.specialization?.message}
      />

      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-foreground/80">
          University / Institute<span className="text-red-500 ml-0.5">*</span>
        </Label>
        <div className="relative">
          <Input
            placeholder="Eg. National Institute of Technology (NIT)"
            {...register("college")}
            className={cn(
              "pr-9 h-10 text-sm rounded-xl border-gray-200 bg-muted/50/80 focus:bg-card transition-all",
              errors.college && "border-red-300",
            )}
          />
          <Search
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 pointer-events-none"
            size={14}
          />
        </div>
        <FieldError message={errors.college?.message} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <YearPicker
          label="Starting year"
          required
          years={STARTING_YEARS}
          value={w.startingYear}
          onChange={(v) =>
            setValue("startingYear", v, { shouldValidate: true })
          }
          error={errors.startingYear?.message}
        />
        <YearPicker
          label="Passing year"
          required
          years={PASSING_YEARS}
          value={w.passingYear}
          onChange={(v) => setValue("passingYear", v, { shouldValidate: true })}
          error={errors.passingYear?.message}
        />
      </div>

      <GradingSelector
        value={w.gradingSystem}
        onChange={(v) => setValue("gradingSystem", v, { shouldValidate: true })}
        error={errors.gradingSystem?.message}
      />

      {(w.gradingSystem === GradingSystemEnum.GPA4 ||
        w.gradingSystem === GradingSystemEnum.GPA10) && (
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground/80">
            {w.gradingSystem === GradingSystemEnum.GPA4
              ? "CGPA out of 4"
              : "CGPA out of 10"}
            <span className="text-red-500 ml-0.5">*</span>
          </Label>
          <Input
            type="number"
            step="0.01"
            placeholder={
              w.gradingSystem === GradingSystemEnum.GPA4
                ? "e.g. 3.4"
                : "e.g. 8.5"
            }
            {...register("gpa")}
            className="h-10 text-sm rounded-xl border-gray-200 bg-muted/50/80 focus:bg-card transition-all"
          />
          <p className="text-xs text-muted-foreground/80">
            CGPA is the marks obtained from all the GPAs
          </p>
        </div>
      )}

      {w.gradingSystem === GradingSystemEnum.Percentage && (
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground/80">
            Percentage<span className="text-red-500 ml-0.5">*</span>
          </Label>
          <Input
            type="number"
            step="0.01"
            placeholder="e.g. 82.5"
            {...register("gpa")}
            className="h-10 text-sm rounded-xl border-gray-200 bg-muted/50/80 focus:bg-card transition-all"
          />
        </div>
      )}

      <SkillInput
        value={w.skills}
        onChange={(v) => setValue("skills", v, { shouldValidate: true })}
        error={errors.skills?.message}
      />

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1 h-11 rounded-xl border-gray-200 text-muted-foreground hover:bg-muted/50 text-sm font-medium transition-all"
        >
          Back
        </Button>
        <Button
          type="submit"
          className="flex-[2] h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-md shadow-primary/30 transition-all"
        >
          Save and continue <ArrowRight size={15} />
        </Button>
      </div>
    </form>
  );
}

// ─── Last Step ────────────────────────────────────────────────────────────────

function LastStep({
  onSubmit: onDone,
  onBack,
  loading,
  defaultValues,
  isLoading,
  preselectedFile,
}: {
  onSubmit: (data: LastStepValues, resumeFile: File | null) => void;
  onBack: () => void;
  loading?: boolean;
  defaultValues?: Partial<LastStepValues>;
  isLoading?: boolean;
  preselectedFile?: File | null;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<LastStepValues>({
    resolver: zodResolver(lastStepSchema),
    defaultValues: {
      resumeUrl: "",
      linkedin: "",
      github: "",
      portfolio: "",
      twitter: "",
      website: "",
      ...defaultValues,
    },
    mode: "onTouched",
  });

  useEffect(() => {
    if (defaultValues)
      reset({
        resumeUrl: "",
        linkedin: "",
        github: "",
        portfolio: "",
        twitter: "",
        website: "",
        ...defaultValues,
      });
  }, [defaultValues, reset]);

  // Pre-select the resume file uploaded in the AI step
  const [resumeFile, setResumeFile] = useState<File | null>(
    preselectedFile ?? null,
  );
  const [dragOver, setDragOver] = useState(false);
  const w = watch();

  // If AI step provided a file, mark the URL field as non-empty
  useEffect(() => {
    if (preselectedFile) {
      setValue("resumeUrl", preselectedFile.name);
    }
  }, [preselectedFile, setValue]);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      setResumeFile(file);
      setValue("resumeUrl", file.name);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setResumeFile(file);
      setValue("resumeUrl", file.name);
    }
  };

  const removeResume = () => {
    setResumeFile(null);
    setValue("resumeUrl", "");
  };

  const handleFormSubmit = (data: LastStepValues) => {
    onDone(data, resumeFile);
  };

  if (isLoading) return <FormSkeleton />;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-7">
      <SectionTitle
        title="Resume & social links"
        subtitle="Help recruiters learn more about your work and connect with you"
      />

      <div className="space-y-2.5">
        <Label className="text-sm font-medium text-foreground/80">
          Resume / CV{" "}
          <span className="text-muted-foreground/80 font-normal text-xs">
            (PDF only, max 5MB)
          </span>
        </Label>

        {!resumeFile && defaultValues?.resumeUrl && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-primary/20 bg-primary/5 text-xs text-primary mb-2">
            <BookOpen size={13} />
            <span className="truncate">Current resume on file</span>
            <a
              href={defaultValues.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto underline underline-offset-2 hover:text-primary/90 transition-colors flex-shrink-0"
            >
              View
            </a>
          </div>
        )}

        {/* AI-uploaded file badge */}
        {resumeFile && preselectedFile && resumeFile === preselectedFile && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-green-200 bg-green-50 text-xs text-green-700 mb-1">
            <Sparkles size={12} />
            <span>Resume from AI autofill step — already attached</span>
          </div>
        )}

        {!resumeFile ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
            className={cn(
              "relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-10 px-6 cursor-pointer transition-all",
              dragOver
                ? "border-primary bg-primary/5"
                : "border-gray-200 bg-muted/50/80 hover:border-primary/40 hover:bg-primary/5",
            )}
          >
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="text-primary" size={22} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground/80">
                {defaultValues?.resumeUrl
                  ? "Upload a new resume to replace"
                  : "Drag & drop your resume here"}
              </p>
              <p className="text-xs text-muted-foreground/80 mt-1">
                or{" "}
                <span className="text-primary font-medium underline underline-offset-2">
                  browse to upload
                </span>
              </p>
            </div>
            <p className="text-xs text-gray-300">PDF format · Max 5MB</p>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-primary/30 bg-primary/5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <BookOpen className="text-primary" size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground/90 truncate">
                {resumeFile.name}
              </p>
              <p className="text-xs text-muted-foreground/80 mt-0.5">
                {(resumeFile.size / 1024).toFixed(0)} KB · PDF
              </p>
            </div>
            <button
              type="button"
              onClick={removeResume}
              className="w-7 h-7 rounded-lg bg-card border border-gray-200 flex items-center justify-center text-muted-foreground/80 hover:text-red-500 hover:border-red-200 transition-all flex-shrink-0"
            >
              <X size={13} />
            </button>
          </div>
        )}

        {resumeFile && (
          <label className="inline-flex items-center gap-1.5 text-xs text-primary cursor-pointer hover:text-primary/90 transition-colors mt-1">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileInput}
              className="hidden"
            />
            <Plus size={12} />
            Replace resume
          </label>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium text-foreground/80">
            Social links{" "}
            <span className="text-muted-foreground/80 font-normal text-xs">
              (optional)
            </span>
          </Label>
          <p className="text-xs text-muted-foreground/80 mt-1">
            Add your profiles so recruiters can verify your work
          </p>
        </div>

        <div className="space-y-3">
          {SOCIAL_FIELDS.map(({ name, label, placeholder, icon, color }) => (
            <div key={name} className="flex items-center gap-3">
              <div
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-primary-foreground text-xs font-bold",
                  color,
                )}
              >
                {icon}
              </div>
              <div className="flex-1 space-y-0">
                <div className="relative">
                  <Input
                    type="url"
                    placeholder={placeholder}
                    {...register(name)}
                    className={cn(
                      "h-10 text-sm rounded-xl border-gray-200 bg-muted/50/80 focus:bg-card transition-all pr-9",
                      errors[name] && "border-red-300",
                    )}
                  />
                  {w[name] && (
                    <button
                      type="button"
                      onClick={() => setValue(name, "")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-muted-foreground transition-colors"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
                {errors[name] && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors[name]?.message}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground/80 bg-muted/50 rounded-xl px-4 py-3 border border-gray-100">
        💡 You can always update your resume and social links later from your
        profile page.
      </p>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={loading}
          className="flex-1 h-11 rounded-xl border-gray-200 text-muted-foreground hover:bg-muted/50 text-sm font-medium transition-all disabled:opacity-50"
        >
          Back
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="flex-[2] h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-md shadow-primary/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="animate-spin h-4 w-4" />
              Completing profile...
            </span>
          ) : (
            <>
              Complete profile <Sparkles size={14} />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

// ─── Stepper ──────────────────────────────────────────────────────────────────

type ExtendedStep = "resume" | Step;

const EXTENDED_STEPS: { id: ExtendedStep; label: string; sublabel: string }[] =
  [
    {
      id: "resume",
      label: "Resume upload",
      sublabel: "Auto-fill with AI",
    },
    { id: "basic", label: "Basic details", sublabel: "Name, location and bio" },
    {
      id: "education",
      label: "Education",
      sublabel: "Employers prefer to know about your education",
    },
    { id: "laststep", label: "Last step", sublabel: "Resume & social links" },
  ];

function Stepper({ current }: { current: ExtendedStep }) {
  const currentIdx = EXTENDED_STEPS.findIndex((s) => s.id === current);

  return (
    <nav className="flex flex-col gap-0" aria-label="Onboarding steps">
      {EXTENDED_STEPS.map((step, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        const pending = i > currentIdx;

        return (
          <div key={step.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all duration-300 z-10",
                  done && "bg-primary border-primary text-primary-foreground",
                  active && "bg-card border-primary text-primary",
                  pending && "bg-card border-gray-200 text-gray-300",
                )}
              >
                {done ? (
                  <Check size={13} strokeWidth={3} />
                ) : (
                  <span
                    className={cn(
                      "text-xs font-bold",
                      active ? "text-primary" : "text-gray-300",
                    )}
                  >
                    {i + 1}
                  </span>
                )}
              </div>
              {i < EXTENDED_STEPS.length - 1 && (
                <div
                  className={cn(
                    "w-0.5 flex-1 my-1 min-h-[36px] rounded-full transition-all duration-500",
                    done ? "bg-primary" : "bg-gray-200",
                  )}
                />
              )}
            </div>

            <div
              className={cn("pb-8", i === EXTENDED_STEPS.length - 1 && "pb-0")}
            >
              <p
                className={cn(
                  "text-sm font-semibold leading-tight mt-1",
                  active && "text-foreground",
                  done && "text-muted-foreground",
                  pending && "text-gray-300",
                )}
              >
                {step.label}
              </p>
              {active && (
                <p className="text-xs text-muted-foreground/80 mt-1 leading-snug max-w-[160px]">
                  {step.sublabel}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StudentOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<ExtendedStep>("resume");
  const [basicData, setBasicData] = useState<BasicValues | null>(null);
  const [educationData, setEducationData] = useState<EducationValues | null>(
    null,
  );

  // Data seeded from AI parsing — merged with server defaults below
  const [aiData, setAiData] = useState<ParsedResume | null>(null);
  // Resume file from the upload/parse step (carried into LastStep)
  const [resumeFileFromAI, setResumeFileFromAI] = useState<File | null>(null);

  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const { mutateAsync: updateJobSeekerMeta, isPending } =
    useUpdateJobSeekerMeta();
  const { mutateAsync: uploadFile, isPending: isUploading } = useFileUpload();

  const jobSeeker = user as JobSeekerUser | undefined;
  const meta = jobSeeker?.Meta;
  const edu = meta?.Education?.[0];

  // ── Prefill defaults: server data merged with (higher-priority) AI data ──

  const basicDefaults: Partial<BasicValues> = {
    name: aiData?.name ?? jobSeeker?.Name ?? "",
    phone: aiData?.phone ?? jobSeeker?.Phone?.replace(/^\+91/, "") ?? "",
    location: aiData?.location ?? meta?.Location ?? "",
    bio: aiData?.bio ?? meta?.Bio ?? "",
  };

  const educationDefaults: Partial<EducationValues> = {
    college: aiData?.college ?? edu?.College ?? "",
    course: aiData?.course ?? edu?.Course ?? "",
    specialization: aiData?.specialization ?? edu?.Specialization ?? "",
    startingYear:
      aiData?.startingYear ??
      (edu?.StartingYear ? String(edu.StartingYear) : ""),
    passingYear:
      aiData?.passingYear ??
      (edu?.GraduationYear ? String(edu.GraduationYear) : ""),
    gradingSystem: aiData?.gradingSystem ?? edu?.GradingSystem,
    gpa: aiData?.gpa ?? (edu?.GPA ? String(edu.GPA) : ""),
    skills: aiData?.skills?.length ? aiData.skills : (meta?.Skills ?? []),
    courseType: aiData?.courseType ?? edu?.CourseType,
    qualification: aiData?.qualification ?? edu?.HighestQualificaiton,
  };

  const lastStepDefaults: Partial<LastStepValues> = {
    resumeUrl: meta?.ResumeUrl ?? "",
    linkedin: aiData?.linkedin ?? meta?.SocialLinks?.LinkedIn ?? "",
    github: aiData?.github ?? meta?.SocialLinks?.GitHub ?? "",
    portfolio: aiData?.portfolio ?? meta?.SocialLinks?.Portfolio ?? "",
    twitter: aiData?.twitter ?? meta?.SocialLinks?.Twitter ?? "",
    website: aiData?.website ?? meta?.SocialLinks?.Website ?? "",
  };

  // ── Step handlers ────────────────────────────────────────────────────────

  const handleResumeParsed = (data: ParsedResume, file: File) => {
    setAiData(data);
    setResumeFileFromAI(file);
    setStep("basic");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleResumeSkip = () => {
    setStep("basic");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBasicNext = (data: BasicValues) => {
    setBasicData(data);
    setStep("education");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEducationNext = (data: EducationValues) => {
    setEducationData(data);
    setStep("laststep");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLastStepSubmit = async (
    lastData: LastStepValues,
    resumeFile: File | null,
  ) => {
    if (!basicData || !educationData || !jobSeeker?.Id) return;

    let resumeUrl = lastData.resumeUrl;
    if (resumeFile) {
      resumeUrl = await uploadFile({ file: resumeFile, userId: jobSeeker.Id });
    }

    const payload: UpdateJobSeekerMetaDTO = {
      Location: basicData.location,
      Bio: basicData.bio,
      Skills: educationData.skills,
      ResumeUrl: resumeUrl || undefined,
      Education: [
        {
          College: educationData.college,
          Course: educationData.course,
          Specialization: educationData.specialization,
          StartingYear: educationData.startingYear
            ? Number(educationData.startingYear)
            : undefined,
          GraduationYear: educationData.passingYear
            ? Number(educationData.passingYear)
            : undefined,
          GradingSystem: educationData.gradingSystem as GradingSystemEnum,
          GPA: educationData.gpa ? Number(educationData.gpa) : undefined,
          HighestQualificaiton: educationData.qualification,
          CourseType: educationData.courseType,
        },
      ],
      SocialLinks: {
        LinkedIn: lastData.linkedin || undefined,
        GitHub: lastData.github || undefined,
        Portfolio: lastData.portfolio || undefined,
        Twitter: lastData.twitter || undefined,
        Website: lastData.website || undefined,
      },
    };

    await updateJobSeekerMeta(payload);
    router.push("/profile");
  };

  const isSubmitting = isUploading || isPending;

  // Mobile step label uses extended steps
  const currentExtIdx = EXTENDED_STEPS.findIndex((s) => s.id === step);

  return (
    <div className="min-h-screen bg-muted/50/80 flex flex-col">
      {/* Header */}
      <header className="w-full bg-card border-b border-gray-100 px-6 lg:px-10 py-4 flex items-center gap-3">
              <Image
                src="/icon.png"
                alt="ReferNest Logo"
                width={32}
                height={32}
                className="rounded-md"
              />
        <span className="font-bold text-lg text-foreground tracking-tight">
          SDE Jobs & <span className="text-primary">Internships</span>
        </span>
        <span className="ml-2 text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-medium">
          Profile setup
        </span>
      </header>

      <main className="flex-1 flex justify-center px-4 py-10">
        <div className="w-full max-w-3xl flex gap-8 items-start">
          {/* ── Left Stepper ── */}
          <aside className="hidden lg:block w-52 flex-shrink-0 pt-1 sticky top-10">
            <Stepper current={step} />
          </aside>

          {/* ── Form Card ── */}
          <div className="flex-1 bg-card rounded-3xl shadow-lg shadow-sm/80 border border-gray-100 p-8">
            {/* Mobile step indicator */}
            <div className="flex lg:hidden items-center gap-1.5 mb-6 text-xs text-muted-foreground/80 flex-wrap">
              {EXTENDED_STEPS.map((s, i) => (
                <div key={s.id} className="flex items-center gap-1.5">
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold",
                      s.id === step
                        ? "bg-primary text-primary-foreground"
                        : currentExtIdx > i
                          ? "bg-primary/30 text-primary/90"
                          : "bg-muted text-muted-foreground/80",
                    )}
                  >
                    {currentExtIdx > i ? <Check size={10} /> : i + 1}
                  </div>
                  <span
                    className={s.id === step ? "text-foreground font-medium" : ""}
                  >
                    {s.label}
                  </span>
                  {i < EXTENDED_STEPS.length - 1 && <ChevronRight size={12} />}
                </div>
              ))}
            </div>

            {step === "resume" && (
              <ResumeUploadStep
                onParsed={handleResumeParsed}
                onSkip={handleResumeSkip}
              />
            )}
            {step === "basic" && (
              <BasicStep
                onNext={handleBasicNext}
                defaultValues={basicDefaults}
                isLoading={isUserLoading}
              />
            )}
            {step === "education" && (
              <EducationStep
                onNext={handleEducationNext}
                onBack={() => setStep("basic")}
                defaultValues={educationDefaults}
                isLoading={isUserLoading}
              />
            )}
            {step === "laststep" && (
              <LastStep
                onSubmit={handleLastStepSubmit}
                onBack={() => setStep("education")}
                loading={isSubmitting}
                defaultValues={lastStepDefaults}
                isLoading={isUserLoading}
                preselectedFile={resumeFileFromAI}
              />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-gray-100 py-5 text-center">
        <p className="text-xs text-gray-300">
          All rights reserved © {new Date().getFullYear()} SDE Jobs & Internships
        </p>
      </footer>
    </div>
  );
}
