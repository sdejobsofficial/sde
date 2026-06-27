"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  MapPin,
  Link as LinkIcon,
  Calendar,
  Type,
  Eye,
  Send,
  Trash2,
  Copy,
  Check,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  JobType,
  WorkMode,
  ExperienceLevel,
  SalaryType,
  SalaryVisibility,
  FormType,
  FormFieldType,
  ReferralStatus,
  JobStatus,
} from "@/models/jobModel";
import { useCreateJob, useJobById, useUpdateJob } from "@/hooks/useJobs";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import type { JobInteraction } from "@/models/jobModel";
import { useCurrentUser } from "@/hooks/useUser";
import { VerificationStatus } from "@/models/userModel";
import {
  applicationSchema,
  ApplicationValues,
  basicsSchema,
  BasicsValues,
  EXP_LEVEL_OPTIONS,
  experienceSchema,
  ExperienceValues,
  FIELD_TYPE_OPTIONS,
  FormField,
  JOB_TYPE_OPTIONS,
  SALARY_TYPE_OPTIONS,
  salarySchema,
  SalaryValues,
  Step,
  STEPS,
  WORK_MODE_OPTIONS,
} from "@/constants/company/CJobFormContants";
import {
  PillSelector,
  SectionTitle,
  SkillInput,
  Stepper,
} from "@/components/company/CompanyJobForm";
import { FieldError } from "@/components/common/FormComponents";
import Link from "next/link";
import Image from "next/image";
import { DescriptionEditor } from "@/components/company/CompanyDescriptionEditor";

function BasicsStep({
  onNext,
  defaultValues,
  description,
  onDescriptionChange,
  skills,
  onSkillsChange,
}: {
  onNext: (data: BasicsValues) => void;
  defaultValues?: Partial<BasicsValues>;
  description: string;
  onDescriptionChange: (v: string) => void;
  skills: string[];
  onSkillsChange: (v: string[]) => void;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BasicsValues>({
    resolver: zodResolver(basicsSchema),
    defaultValues: {
      jobType: JobType.FullTime, // default so PillSelector is never undefined
      workMode: WorkMode.Remote,
      ...defaultValues,
    },
    mode: "onTouched",
  });
  const w = watch();

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <SectionTitle
        title="Job basics"
        subtitle="Core information about this role"
      />

      {/* Title */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-foreground/80">
          Job title <span className="text-red-500 ml-0.5">*</span>
        </Label>
        <Input
          {...register("title")}
          placeholder="e.g. Senior Frontend Engineer"
          className={cn(
            "h-10 text-sm rounded-xl border-gray-200 bg-muted/50 focus:bg-card focus:border-primary transition-all",
            errors.title && "border-red-300",
          )}
        />
        <FieldError message={errors.title?.message} />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-foreground/80">
          Job description <span className="text-red-500 ml-0.5">*</span>
        </Label>
        <DescriptionEditor value={description} onChange={onDescriptionChange} />
      </div>

      {/* Skills */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-foreground/80">
          Required skills <span className="text-red-500 ml-0.5">*</span>
        </Label>
        <SkillInput value={skills} onChange={onSkillsChange} />
      </div>

      {/* Location */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-foreground/80">
          Location <span className="text-red-500 ml-0.5">*</span>
        </Label>
        <div className="relative">
          <MapPin
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 pointer-events-none"
            size={14}
          />
          <Input
            {...register("location")}
            placeholder="e.g. Bengaluru, KA or Remote"
            className={cn(
              "pl-9 h-10 text-sm rounded-xl border-gray-200 bg-muted/50 focus:bg-card focus:border-primary transition-all",
              errors.location && "border-red-300",
            )}
          />
        </div>
        <FieldError message={errors.location?.message} />
      </div>

      {/* Job type + Work mode */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground/80">Job type</Label>
        <input
          type="hidden"
          {...register("jobType", { valueAsNumber: true })}
        />
        <PillSelector
          options={JOB_TYPE_OPTIONS}
          value={w.jobType as JobType}
          onChange={(v) => setValue("jobType", v, { shouldValidate: true })}
          cols={3}
        />
        <FieldError message={errors.jobType?.message} />
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground/80">Work mode</Label>
        <input
          type="hidden"
          {...register("workMode", { valueAsNumber: true })}
        />
        <PillSelector
          options={WORK_MODE_OPTIONS}
          value={w.workMode as WorkMode}
          onChange={(v) => setValue("workMode", v, { shouldValidate: true })}
          cols={3}
        />
        <FieldError message={errors.workMode?.message} />
      </div>

      <Button
        type="submit"
        className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-md shadow-primary/30 transition-all mt-2"
      >
        Continue <ArrowRight size={15} />
      </Button>
    </form>
  );
}

function ExperienceStep({
  onNext,
  onBack,
  defaultValues,
}: {
  onNext: (data: ExperienceValues) => void;
  onBack: () => void;
  defaultValues?: Partial<ExperienceValues>;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ExperienceValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      experienceLevel: ExperienceLevel.Fresher,
      totalOpenings: 1,
      experienceMinYears: undefined,
      experienceMaxYears: undefined,
      ...defaultValues,
    },
    mode: "onSubmit", // ← change this
  });
  const w = watch();

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <SectionTitle
        title="Experience & openings"
        subtitle="Who you're looking for"
      />

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground/80">
          Experience level
        </Label>
        <input
          type="hidden"
          {...register("experienceLevel", { valueAsNumber: true })}
        />
        <PillSelector
          options={EXP_LEVEL_OPTIONS}
          value={w.experienceLevel as ExperienceLevel}
          onChange={(v) =>
            setValue("experienceLevel", v, { shouldValidate: true })
          }
          cols={6}
        />
        <FieldError message={errors.experienceLevel?.message} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground/80">
            Min years <span className="text-red-500 ml-0.5">*</span>
          </Label>
          <Input
            type="number"
            {...register("experienceMinYears", { valueAsNumber: true })}
            min={0}
            className="h-10 text-sm rounded-xl border-gray-200 bg-muted/50 focus:bg-card focus:border-primary"
          />
          <FieldError message={errors.totalOpenings?.message} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground/80">
            Max years <span className="text-red-500 ml-0.5">*</span>
          </Label>
          <Input
            type="number"
            {...register("experienceMaxYears", { valueAsNumber: true })}
            min={0}
            className="h-10 text-sm rounded-xl border-gray-200 bg-muted/50 focus:bg-card focus:border-primary"
          />
          <FieldError message={errors.totalOpenings?.message} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground/80">
            Openings <span className="text-red-500 ml-0.5">*</span>
          </Label>
          <Input
            type="number"
            {...register("totalOpenings", { valueAsNumber: true })}
            min={1}
            className={cn(
              "h-10 text-sm rounded-xl border-gray-200 bg-muted/50 focus:bg-card focus:border-primary",
              errors.totalOpenings && "border-red-300",
            )}
          />
          <FieldError message={errors.totalOpenings?.message} />
        </div>
      </div>

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
          Continue <ArrowRight size={15} />
        </Button>
      </div>
    </form>
  );
}

function SalaryStep({
  onNext,
  onBack,
  defaultValues,
}: {
  onNext: (data: SalaryValues) => void;
  onBack: () => void;
  defaultValues?: Partial<SalaryValues>;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SalaryValues>({
    resolver: zodResolver(salarySchema),
    defaultValues: {
      salaryCurrency: "INR",
      salaryType: SalaryType.Annual,
      salaryVisibility: SalaryVisibility.Visible,
      salaryMin: undefined, // let user fill
      salaryMax: undefined,
      ...defaultValues,
    },
    mode: "onSubmit",
  });
  const w = watch();

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <SectionTitle
        title="Salary & compensation"
        subtitle="Be transparent — jobs with salary ranges get more applicants"
      />

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground/80">Salary type</Label>
        <input
          type="hidden"
          {...register("salaryType", { valueAsNumber: true })}
        />
        <PillSelector
          options={SALARY_TYPE_OPTIONS}
          value={w.salaryType as SalaryType}
          onChange={(v) => setValue("salaryType", v)}
          cols={4}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground/80">Currency</Label>
          <select
            {...register("salaryCurrency")}
            className="w-full h-10 px-3 text-sm rounded-xl border border-gray-200 bg-muted/50 focus:bg-card focus:border-primary outline-none transition-all"
          >
            {["INR", "USD", "EUR", "GBP", "AED"].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground/80">
            Min <span className="text-red-500 ml-0.5">*</span>
          </Label>
          <Input
            type="number"
            {...register("salaryMin", { valueAsNumber: true })}
            min={0}
            className={cn(
              "h-10 text-sm rounded-xl border-gray-200 bg-muted/50 focus:bg-card focus:border-primary",
              errors.salaryMin && "border-red-300",
            )}
          />

          <FieldError message={errors.salaryMin?.message} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground/80">
            Max <span className="text-red-500 ml-0.5">*</span>
          </Label>
          <Input
            type="number"
            {...register("salaryMax", { valueAsNumber: true })}
            min={0}
            className={cn(
              "h-10 text-sm rounded-xl border-gray-200 bg-muted/50 focus:bg-card focus:border-primary",
              errors.salaryMax && "border-red-300",
            )}
          />
          <FieldError message={errors.salaryMax?.message} />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground/80">
          Salary visibility
        </Label>
        <PillSelector
          options={[
            { label: "Show salary", value: SalaryVisibility.Visible },
            { label: "Negotiable", value: SalaryVisibility.Negotiable },
            { label: "Hidden", value: SalaryVisibility.HiddenFromCandidates },
          ]}
          value={w.salaryVisibility as SalaryVisibility}
          onChange={(v) => setValue("salaryVisibility", v)}
          cols={3}
        />
      </div>

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
          Continue <ArrowRight size={15} />
        </Button>
      </div>
    </form>
  );
}

function FormFieldCard({
  field,
  index,
  total,
  onChange,
  onRemove,
  onDuplicate,
  onMoveUp,
  onMoveDown,
}: {
  field: FormField;
  index: number;
  total: number;
  onChange: (f: FormField) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [newOption, setNewOption] = useState("");
  const fieldConfig = FIELD_TYPE_OPTIONS.find((f) => f.value === field.type);
  const FieldIcon = fieldConfig?.icon ?? Type;
  const hasOptions = [
    FormFieldType.Dropdown,
    FormFieldType.MultiSelect,
    FormFieldType.RadioGroup,
  ].includes(field.type);

  const addOption = () => {
    const t = newOption.trim();
    if (t && !field.options.includes(t))
      onChange({ ...field, options: [...field.options, t] });
    setNewOption("");
  };

  return (
    <div className="bg-card rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-muted/50/50">
        <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
          <FieldIcon size={13} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground/90 truncate">
            {field.label || "Untitled field"}
          </p>
          <p className="text-xs text-muted-foreground/80">{fieldConfig?.label}</p>
        </div>
        {field.required && (
          <span className="text-xs bg-red-50 text-red-500 border border-red-100 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
            Required
          </span>
        )}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground/80 hover:text-muted-foreground hover:bg-muted disabled:opacity-30 transition-all"
          >
            <ChevronUp size={13} />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground/80 hover:text-muted-foreground hover:bg-muted disabled:opacity-30 transition-all"
          >
            <ChevronDown size={13} />
          </button>
          <button
            type="button"
            onClick={onDuplicate}
            className="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground/80 hover:text-primary hover:bg-primary/10 transition-all"
          >
            <Copy size={13} />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground/80 hover:text-red-500 hover:bg-red-50 transition-all"
          >
            <Trash2 size={13} />
          </button>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground/80 hover:text-muted-foreground hover:bg-muted transition-all"
          >
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Field type
            </Label>
            <div className="grid grid-cols-4 gap-1.5">
              {FIELD_TYPE_OPTIONS.map(({ label, icon: Icon, value }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onChange({ ...field, type: value })}
                  className={cn(
                    "flex flex-col items-center py-2 px-1 rounded-xl border text-center transition-all",
                    field.type === value
                      ? "border-primary/100 bg-primary/10"
                      : "border-gray-100 hover:border-primary/30 hover:bg-primary/10/30",
                  )}
                >
                  <Icon
                    size={14}
                    className={
                      field.type === value ? "text-primary" : "text-muted-foreground/80"
                    }
                  />
                  <span
                    className={cn(
                      "text-xs mt-1 leading-tight",
                      field.type === value
                        ? "text-primary/90 font-medium"
                        : "text-muted-foreground",
                    )}
                  >
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Label <span className="text-red-400">*</span>
              </Label>
              <Input
                value={field.label}
                onChange={(e) => onChange({ ...field, label: e.target.value })}
                placeholder="e.g. Why do you want to join?"
                className="h-9 text-sm rounded-xl border-gray-200 bg-muted/50 focus:bg-card"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Placeholder
              </Label>
              <Input
                value={field.placeholder}
                onChange={(e) =>
                  onChange({ ...field, placeholder: e.target.value })
                }
                placeholder="e.g. Your answer here..."
                className="h-9 text-sm rounded-xl border-gray-200 bg-muted/50 focus:bg-card"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Help text
            </Label>
            <Input
              value={field.helpText}
              onChange={(e) => onChange({ ...field, helpText: e.target.value })}
              placeholder="Optional hint shown below the field"
              className="h-9 text-sm rounded-xl border-gray-200 bg-muted/50 focus:bg-card"
            />
          </div>

          {hasOptions && (
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Options
              </Label>
              <div className="space-y-1.5">
                {field.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0" />
                    <Input
                      value={opt}
                      onChange={(e) => {
                        const opts = [...field.options];
                        opts[i] = e.target.value;
                        onChange({ ...field, options: opts });
                      }}
                      className="h-8 text-sm rounded-lg border-gray-200 bg-muted/50 focus:bg-card flex-1"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        onChange({
                          ...field,
                          options: field.options.filter((_, j) => j !== i),
                        })
                      }
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground/80 hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border border-dashed border-gray-300 flex-shrink-0" />
                  <Input
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addOption();
                      }
                    }}
                    placeholder="Add option and press Enter"
                    className="h-8 text-sm rounded-lg border-dashed border-gray-200 bg-muted/50 focus:bg-card flex-1"
                  />
                  <button
                    type="button"
                    onClick={addOption}
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground/80 hover:text-primary hover:bg-primary/10 transition-all"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* {field.type === FormFieldType.FilePicker && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Accepted types
                </Label>
                <Input
                  value={field.acceptedFileTypes}
                  onChange={(e) =>
                    onChange({ ...field, acceptedFileTypes: e.target.value })
                  }
                  placeholder=".pdf,.doc,.docx"
                  className="h-9 text-sm rounded-xl border-gray-200 bg-muted/50 focus:bg-card"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Max size (MB)
                </Label>
                <Input
                  type="number"
                  value={field.maxFileSizeMb}
                  onChange={(e) =>
                    onChange({
                      ...field,
                      maxFileSizeMb: Number(e.target.value),
                    })
                  }
                  className="h-9 text-sm rounded-xl border-gray-200 bg-muted/50 focus:bg-card"
                />
              </div>
            </div>
          )} */}

          {[FormFieldType.NumberInput, FormFieldType.RatingPicker].includes(
            field.type,
          ) && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Min value
                  </Label>
                  <Input
                    type="number"
                    value={field.min ?? ""}
                    onChange={(e) =>
                      onChange({ ...field, min: Number(e.target.value) })
                    }
                    className="h-9 text-sm rounded-xl border-gray-200 bg-muted/50 focus:bg-card"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Max value
                  </Label>
                  <Input
                    type="number"
                    value={field.max ?? ""}
                    onChange={(e) =>
                      onChange({ ...field, max: Number(e.target.value) })
                    }
                    className="h-9 text-sm rounded-xl border-gray-200 bg-muted/50 focus:bg-card"
                  />
                </div>
              </div>
            )}

          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-xs font-medium text-foreground/80">
                Required field
              </p>
              <p className="text-xs text-muted-foreground/80">
                Candidates must fill this to submit
              </p>
            </div>
            <button
              type="button"
              onClick={() => onChange({ ...field, required: !field.required })}
              className={cn(
                "w-10 h-6 rounded-full transition-all duration-200 relative flex-shrink-0",
                field.required ? "bg-primary" : "bg-gray-200",
              )}
            >
              <span
                className={cn(
                  "absolute top-1 w-4 h-4 rounded-full bg-card shadow-sm transition-all duration-200",
                  field.required ? "left-5" : "left-1",
                )}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ApplicationStep({
  onSubmit: onDone,
  onBack,
  defaultValues,
  formFields,
  onFormFieldsChange,
  includeResume,
  onToggleResume,
  includeCoverLetter,
  onToggleCoverLetter,
  includeLinkedIn,
  onToggleLinkedIn,
  includePortfolio,
  onTogglePortfolio,
  isLoading,
}: {
  onSubmit: (data: ApplicationValues) => void;
  onBack: () => void;
  defaultValues?: Partial<ApplicationValues>;
  formFields: FormField[];
  onFormFieldsChange: (f: FormField[]) => void;
  includeResume: boolean;
  onToggleResume: () => void;
  includeCoverLetter: boolean;
  onToggleCoverLetter: () => void;
  includeLinkedIn: boolean;
  onToggleLinkedIn: () => void;
  includePortfolio: boolean;
  onTogglePortfolio: () => void;
  isLoading?: boolean;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ApplicationValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      formType: FormType.Internal,
      referralStatus: ReferralStatus.Open,
      isUrgent: false,
      ...defaultValues,
    },
    mode: "onTouched",
  });
  const w = watch();
  const isInternal = w.formType === FormType.Internal;

  const addField = () => {
    const newField: FormField = {
      id: crypto.randomUUID(),
      type: FormFieldType.TextInput,
      label: "",
      placeholder: "",
      required: false,
      helpText: "",
      options: [],
      acceptedFileTypes: ".pdf,.doc,.docx",
      maxFileSizeMb: 5,
    };
    onFormFieldsChange([...formFields, newField]);
  };

  const updateField = (id: string, updated: FormField) =>
    onFormFieldsChange(formFields.map((f) => (f.id === id ? updated : f)));
  const removeField = (id: string) =>
    onFormFieldsChange(formFields.filter((f) => f.id !== id));
  const duplicateField = (id: string) => {
    const f = formFields.find((x) => x.id === id);
    if (!f) return;
    const idx = formFields.findIndex((x) => x.id === id);
    const dup = { ...f, id: crypto.randomUUID() };
    const next = [...formFields];
    next.splice(idx + 1, 0, dup);
    onFormFieldsChange(next);
  };
  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const a = [...formFields];
    [a[idx - 1], a[idx]] = [a[idx], a[idx - 1]];
    onFormFieldsChange(a);
  };
  const moveDown = (idx: number) => {
    if (idx === formFields.length - 1) return;
    const a = [...formFields];
    [a[idx + 1], a[idx]] = [a[idx], a[idx + 1]];
    onFormFieldsChange(a);
  };

  const ToggleRow = ({
    label,
    desc,
    checked,
    onToggle,
  }: {
    label: string;
    desc: string;
    checked: boolean;
    onToggle: () => void;
  }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div>
        <p className="text-sm font-medium text-foreground/80">{label}</p>
        <p className="text-xs text-muted-foreground/80">{desc}</p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "w-10 h-6 rounded-full transition-all duration-200 relative flex-shrink-0",
          checked ? "bg-primary" : "bg-gray-200",
        )}
      >
        <span
          className={cn(
            "absolute top-1 w-4 h-4 rounded-full bg-card shadow-sm transition-all duration-200",
            checked ? "left-5" : "left-1",
          )}
        />
      </button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onDone)} className="space-y-6">
      <SectionTitle
        title="Application settings"
        subtitle="How candidates will apply for this role"
      />

      {/* Application method */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground/80">
          Application method
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              label: "Internal form",
              sub: "Build a custom form inside ReferNest",
              value: FormType.Internal,
            },
            {
              label: "External link",
              sub: "Redirect to your own ATS or careers page",
              value: FormType.External,
            },
          ].map(({ label, sub, value }) => (
            <button
              key={value}
              type="button"
              onClick={() => setValue("formType", value)}
              className={cn(
                "flex flex-col items-start p-4 rounded-xl border text-left transition-all",
                w.formType === value
                  ? "border-primary/100 bg-primary/10 shadow-sm"
                  : "border-gray-200 bg-muted/50/80 hover:border-primary/30 hover:bg-primary/10/30",
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
                    w.formType === value
                      ? "border-primary/100 bg-primary/100"
                      : "border-gray-300",
                  )}
                >
                  {w.formType === value && (
                    <Check size={9} strokeWidth={3} className="text-primary-foreground" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-sm font-semibold",
                    w.formType === value ? "text-primary/90" : "text-foreground/80",
                  )}
                >
                  {label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground/80 ml-6">{sub}</p>
            </button>
          ))}
        </div>
      </div>

      {/* External URL */}
      {!isInternal && (
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground/80">
            External apply URL <span className="text-red-500 ml-0.5">*</span>
          </Label>
          <div className="relative">
            <LinkIcon
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 pointer-events-none"
              size={14}
            />
            <Input
              {...register("externalApplyUrl")}
              type="url"
              placeholder="https://yourcompany.com/careers/job-123"
              className={cn(
                "pl-9 h-10 text-sm rounded-xl border-gray-200 bg-muted/50 focus:bg-card focus:border-primary transition-all",
                errors.externalApplyUrl && "border-red-300",
              )}
            />
          </div>
          <FieldError message={errors.externalApplyUrl?.message} />
        </div>
      )}

      {/* Deadline */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-foreground/80">
          Application deadline
        </Label>
        <div className="relative">
          <Calendar
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 pointer-events-none"
            size={14}
          />
          <Input
            type="date"
            {...register("applicationDeadline")}
            className="pl-9 h-10 text-sm rounded-xl border-gray-200 bg-muted/50 focus:bg-card focus:border-primary transition-all w-56"
          />
        </div>
      </div>

      {/* Referrals + urgent toggles */}
      <div className="grid grid-cols-2 gap-4">
        {/* <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-muted/50/50">
          <div>
            <p className="text-sm font-medium text-foreground/80">
              Accept referrals
            </p>
            <p className="text-xs text-muted-foreground/80">
              Allow candidates to be referred
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setValue(
                "referralStatus",
                w.referralStatus === ReferralStatus.Open
                  ? ReferralStatus.Closed
                  : ReferralStatus.Open,
              )
            }
            className={cn(
              "w-10 h-6 rounded-full transition-all duration-200 relative flex-shrink-0",
              w.referralStatus === ReferralStatus.Open
                ? "bg-primary"
                : "bg-gray-200",
            )}
          >
            <span
              className={cn(
                "absolute top-1 w-4 h-4 rounded-full bg-card shadow-sm transition-all duration-200",
                w.referralStatus === ReferralStatus.Open ? "left-5" : "left-1",
              )}
            />
          </button>
        </div> */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-muted/50/50">
          <div>
            <p className="text-sm font-medium text-foreground/80">Mark as urgent</p>
            <p className="text-xs text-muted-foreground/80">
              Shows &quot;Urgently hiring&quot; badge
            </p>
          </div>
          <button
            type="button"
            onClick={() => setValue("isUrgent", !w.isUrgent)}
            className={cn(
              "w-10 h-6 rounded-full transition-all duration-200 relative flex-shrink-0",
              w.isUrgent ? "bg-red-500" : "bg-gray-200",
            )}
          >
            <span
              className={cn(
                "absolute top-1 w-4 h-4 rounded-full bg-card shadow-sm transition-all duration-200",
                w.isUrgent ? "left-5" : "left-1",
              )}
            />
          </button>
        </div>
      </div>

      {/* Referral bonus */}
      {/* {w.referralStatus === ReferralStatus.Open && (
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground/80">
            Referral bonus
          </Label>
          <Input
            {...register("referralBonus")}
            placeholder="e.g. ₹5,000 gift card on successful hire"
            className="h-10 text-sm rounded-xl border-gray-200 bg-muted/50 focus:bg-card focus:border-primary transition-all"
          />
        </div>
      )} */}

      {/* Internal form builder */}
      {isInternal && (
        <div className="space-y-4 pt-2">
          <div className="border-t border-gray-100 pt-5">
            <p className="text-sm font-bold text-foreground">
              Application form builder
            </p>
            <p className="text-xs text-muted-foreground/80 mt-0.5">
              Design the form candidates fill when they apply
            </p>
          </div>

          <div className="bg-primary/10/60 rounded-2xl border border-primary/20 p-4">
            <p className="text-xs font-semibold text-primary/90 uppercase tracking-wide mb-3">
              Auto-include fields
            </p>
            <ToggleRow
              label="Resume / CV"
              desc="Automatically ask for resume upload"
              checked={includeResume}
              onToggle={onToggleResume}
            />
            <ToggleRow
              label="Cover letter"
              desc="Optional cover letter text field"
              checked={includeCoverLetter}
              onToggle={onToggleCoverLetter}
            />
            <ToggleRow
              label="LinkedIn profile"
              desc="Ask for candidate's LinkedIn URL"
              checked={includeLinkedIn}
              onToggle={onToggleLinkedIn}
            />
            <ToggleRow
              label="Portfolio / URL"
              desc="Ask for portfolio or personal site"
              checked={includePortfolio}
              onToggle={onTogglePortfolio}
            />
          </div>

          {formFields.length > 0 && (
            <div className="space-y-3">
              {formFields.map((field, idx) => (
                <FormFieldCard
                  key={field.id}
                  field={field}
                  index={idx}
                  total={formFields.length}
                  onChange={(updated) => updateField(field.id, updated)}
                  onRemove={() => removeField(field.id)}
                  onDuplicate={() => duplicateField(field.id)}
                  onMoveUp={() => moveUp(idx)}
                  onMoveDown={() => moveDown(idx)}
                />
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={addField}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed border-gray-200 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/10/30 transition-all"
          >
            <Plus size={16} /> Add a custom field
          </button>

          {formFields.length > 0 && (
            <div className="flex items-start gap-2 bg-muted/50 rounded-xl px-4 py-3 border border-gray-100">
              <Eye size={13} className="text-muted-foreground/80 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                This is the form candidates will fill when applying. Fields
                marked required must be completed before submission.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
          className="flex-1 h-11 rounded-xl border-gray-200 text-muted-foreground hover:bg-muted/50 text-sm font-medium transition-all disabled:opacity-50"
        >
          Back
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-[2] h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-md shadow-primary/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
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
              Publishing job...
            </span>
          ) : (
            <>
              <Send size={14} /> Publish job
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export default function PostJobPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-muted/50 flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <PostJobContent />
    </Suspense>
  );
}

function PostJobContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const { data: user, isLoading: isUserLoading } = useCurrentUser();

  const [step, setStep] = useState<Step>("basics");

  // Accumulated data per step
  const [basicsData, setBasicsData] = useState<BasicsValues | null>(null);
  const [experienceData, setExperienceData] = useState<ExperienceValues | null>(
    null,
  );
  const [salaryData, setSalaryData] = useState<SalaryValues | null>(null);

  // Shared state that spans steps
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [includeResume, setIncludeResume] = useState(true);
  const [includeCoverLetter, setIncludeCoverLetter] = useState(false);
  const [includeLinkedIn, setIncludeLinkedIn] = useState(false);
  const [includePortfolio, setIncludePortfolio] = useState(false);

  const { data: job, isLoading: isLoadingJob } = useJobById(id || "");
  const { mutateAsync: createJob, isPending: creating } = useCreateJob();
  const { mutateAsync: updateJob, isPending: updating } = useUpdateJob(id || "");
  const isPending = creating || updating;

  // Pre-populate fields if editing
  useEffect(() => {
    if (job && !basicsData) {
      setBasicsData({
        title: job.Title,
        location: job.Location,
        jobType: job.JobType,
        workMode: job.WorkMode,
      });
      setExperienceData({
        experienceLevel: (job as any).ExperienceLevel,
        experienceMinYears: (job as any).ExperienceMinYears,
        experienceMaxYears: (job as any).ExperienceMaxYears,
        totalOpenings: job.TotalOpenings,
      });
      setSalaryData({
        salaryType: (job as any).SalaryType,
        salaryCurrency: (job as any).SalaryCurrency,
        salaryMin: (job as any).SalaryMin,
        salaryMax: (job as any).SalaryMax,
        salaryVisibility: (job as any).SalaryVisibility,
      });
      setDescription(job.Description as string);
      setSkills(job.Skills);

      if (job.ApplicationForm) {
        setFormFields(
          job.ApplicationForm.Fields.map((f: any) => ({
            id: f.Id,
            type: f.Type,
            label: f.Label,
            placeholder: f.Placeholder || "",
            required: f.Required,
            helpText: f.HelpText || "",
            options: f.Options?.map((o: any) => o.Value) || [],
            acceptedFileTypes: f.AcceptedFileTypes?.join(",") || "",
            maxFileSizeMb: f.MaxFileSizeMb || 5,
            min: f.Min || undefined,
            max: f.Max || undefined,
          }))
        );
        setIncludeResume(job.ApplicationForm.IncludeResume);
        setIncludeCoverLetter(job.ApplicationForm.IncludeCoverLetter);
        setIncludeLinkedIn(job.ApplicationForm.IncludeLinkedIn);
        setIncludePortfolio(job.ApplicationForm.IncludePortfolio);
      }
    }
  }, [job, basicsData]);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const handleBasicsNext = (data: BasicsValues) => {
    setBasicsData(data);
    setStep("experience");
    scrollTop();
  };

  const handleExperienceNext = (data: ExperienceValues) => {
    setExperienceData(data);
    setStep("salary");
    scrollTop();
  };

  const handleSalaryNext = (data: SalaryValues) => {
    setSalaryData(data);
    setStep("application");
    scrollTop();
  };

  const handleApplicationSubmit = async (appData: ApplicationValues) => {
    if (!basicsData || !experienceData || !salaryData) return;

    const payload: JobInteraction = {
      Title: basicsData.title,
      Location: basicsData.location,
      JobType: basicsData.jobType,
      WorkMode: basicsData.workMode,
      Description: description,
      Skills: skills,
      ExperienceLevel: experienceData.experienceLevel,
      ExperienceMinYears: experienceData.experienceMinYears,
      ExperienceMaxYears: experienceData.experienceMaxYears,
      TotalOpenings: experienceData.totalOpenings,
      SalaryType: salaryData.salaryType,
      SalaryMin: salaryData.salaryMin,
      SalaryMax: salaryData.salaryMax,
      SalaryCurrency: salaryData.salaryCurrency,
      SalaryVisibility: salaryData.salaryVisibility,
      FormType: appData.formType,
      ReferralStatus: appData.referralStatus,
      ReferralBonus: appData.referralBonus || undefined,
      ApplicationDeadline: appData.applicationDeadline || undefined,
      IsUrgent: appData.isUrgent,
      ExternalApplyUrl: appData.externalApplyUrl || undefined,
      Status: JobStatus.Active,
      ApplicationForm:
        appData.formType === FormType.Internal
          ? {
            Fields: formFields.map((f, i) => ({
              Id: f.id,
              Type: f.type,
              Label: f.label,
              Placeholder: f.placeholder || undefined,
              Required: f.required,
              Order: i,
              HelpText: f.helpText || undefined,
              Options: f.options.map((o) => ({ Label: o, Value: o })),
              AcceptedFileTypes: f.acceptedFileTypes
                ? f.acceptedFileTypes.split(",")
                : undefined,
              MaxFileSizeMb: f.maxFileSizeMb,
              Min: f.min,
              Max: f.max,
            })),
            IncludeResume: includeResume,
            IncludeCoverLetter: includeCoverLetter,
            IncludeLinkedIn: includeLinkedIn,
            IncludePortfolio: includePortfolio,
          }
          : undefined,
    };

    if (id) {
      await updateJob(payload as any);
    } else {
      await createJob(payload);
    }
  };

  const currentIdx = STEPS.findIndex((s) => s.id === step);

  if (id && isLoadingJob) {
    return (
      <div className="min-h-screen bg-muted/50 flex items-center justify-center">
        Loading job details...
      </div>
    );
  }

  if (id && !job) {
    return (
      <div className="min-h-screen bg-muted/50 flex items-center justify-center">
        Job not found.
      </div>
    );
  }

  // Prevent rendering form until initial data is populated
  if (id && job && !basicsData) return null;

  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-muted/50 flex items-center justify-center">
        Loading user data...
      </div>
    );
  }

  if (user && user.Role === 1 && (user.Meta as any)?.VerificationStatus !== VerificationStatus.Verified) {
    return (
      <div className="min-h-screen bg-muted/50 flex flex-col items-center justify-center p-4">
        <div className="bg-card p-8 rounded-3xl shadow-sm border border-gray-100 max-w-md text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <X size={32} />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Profile Not Verified</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Your company profile needs to be verified by an admin before you can post or edit jobs. Please wait for verification.
          </p>
          <Link href="/recruiter/dashboard" className="inline-flex items-center justify-center w-full h-11 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-all">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/50/80 flex flex-col">
      {/* Header */}
      <header className="w-full bg-card border-b border-gray-100 px-6 lg:px-10 py-4 flex items-center gap-3">
        <div className="shrink-0">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/icon.png"
              alt="ReferNest Logo"
              width={32}
              height={32}
              className="rounded-md"
            />
            <span className="font-bold text-base text-foreground tracking-tight">
              SDE Jobs & <span className="text-primary">Internships</span>
            </span>
          </Link>
        </div>
        <span className="ml-2 text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-medium">
          {id ? "Edit job" : "Post a job"}
        </span>
      </header>

      <main className="flex-1 flex justify-center px-4 py-10">
        <div className="w-full max-w-3xl flex gap-8 items-start">
          {/* Left stepper */}
          <aside className="hidden lg:block w-52 shrink-0 pt-1 sticky top-10">
            <Stepper current={step} />
          </aside>

          {/* Form card */}
          <div className="flex-1 bg-card rounded-3xl shadow-lg shadow-sm/80 border border-gray-100 p-8">
            {/* Mobile step indicator */}
            <div className="flex lg:hidden items-center gap-2 mb-6 text-xs text-muted-foreground/80">
              {STEPS.map((s, i) => (
                <div key={s.id} className="flex items-center gap-1.5">
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold",
                      s.id === step
                        ? "bg-primary text-primary-foreground"
                        : currentIdx > i
                          ? "bg-primary/30 text-primary/90"
                          : "bg-muted text-muted-foreground/80",
                    )}
                  >
                    {currentIdx > i ? <Check size={10} /> : i + 1}
                  </div>
                  <span
                    className={s.id === step ? "text-foreground font-medium" : ""}
                  >
                    {s.label}
                  </span>
                  {i < STEPS.length - 1 && <ChevronRight size={12} />}
                </div>
              ))}
            </div>

            {step === "basics" && (
              <BasicsStep
                onNext={handleBasicsNext}
                defaultValues={basicsData ?? undefined}
                description={description}
                onDescriptionChange={setDescription}
                skills={skills}
                onSkillsChange={setSkills}
              />
            )}

            {step === "experience" && (
              <ExperienceStep
                onNext={handleExperienceNext}
                onBack={() => {
                  setStep("basics");
                  scrollTop();
                }}
                defaultValues={experienceData ?? undefined}
              />
            )}

            {step === "salary" && (
              <SalaryStep
                onNext={handleSalaryNext}
                onBack={() => {
                  setStep("experience");
                  scrollTop();
                }}
                defaultValues={salaryData ?? undefined}
              />
            )}

            {step === "application" && (
              <ApplicationStep
                onSubmit={handleApplicationSubmit}
                onBack={() => {
                  setStep("salary");
                  scrollTop();
                }}
                formFields={formFields}
                onFormFieldsChange={setFormFields}
                includeResume={includeResume}
                onToggleResume={() => setIncludeResume((v) => !v)}
                includeCoverLetter={includeCoverLetter}
                onToggleCoverLetter={() => setIncludeCoverLetter((v) => !v)}
                includeLinkedIn={includeLinkedIn}
                onToggleLinkedIn={() => setIncludeLinkedIn((v) => !v)}
                includePortfolio={includePortfolio}
                onTogglePortfolio={() => setIncludePortfolio((v) => !v)}
                isLoading={isPending}
              />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-gray-100 py-5 text-center">
        <p className="text-xs text-gray-300">
          All rights reserved © {new Date().getFullYear()} SDE Jobs &
          Internships.
        </p>
      </footer>
    </div>
  );
}
