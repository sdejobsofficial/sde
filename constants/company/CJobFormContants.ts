import {
  JobType,
  WorkMode,
  ExperienceLevel,
  SalaryType,
  FormFieldType,
  SalaryVisibility,
  FormType,
  ReferralStatus,
} from "@/models/jobModel";
import {
  LucideIcon,
  Briefcase,
  Users,
  DollarSign,
  FileText,
  Globe,
  Building,
  Laptop,
  Type,
  AlignLeft,
  ChevronDown,
  List,
  ToggleLeft,
  CheckSquare,
  Calendar,
  PhoneIcon,
  LinkIcon,
  Hash,
  Star,
} from "lucide-react";
import * as z from "zod";

export type Step = "basics" | "experience" | "salary" | "application";

export const STEPS: {
  id: Step;
  label: string;
  sublabel: string;
  icon: LucideIcon;
}[] = [
  {
    id: "basics",
    label: "Job basics",
    sublabel: "Title, description & skills",
    icon: Briefcase,
  },
  {
    id: "experience",
    label: "Experience",
    sublabel: "Who you're looking for",
    icon: Users,
  },
  {
    id: "salary",
    label: "Compensation",
    sublabel: "Salary & visibility",
    icon: DollarSign,
  },
  {
    id: "application",
    label: "Application",
    sublabel: "How candidates apply",
    icon: FileText,
  },
];

export const SKILL_SUGGESTIONS = [
  "React",
  "Node.js",
  "Python",
  "TypeScript",
  "Java",
  "SQL",
  "AWS",
  "Docker",
  "MongoDB",
  "PostgreSQL",
  "Figma",
  "Product Management",
  "Machine Learning",
  "Data Analysis",
  "Go",
  "Kubernetes",
  "Redis",
];

export const JOB_TYPE_OPTIONS = [
  { label: "Full Time", value: JobType.FullTime },
  { label: "Part Time", value: JobType.PartTime },
  { label: "Internship", value: JobType.Internship },
  { label: "Contract", value: JobType.Contract },
  { label: "Freelance", value: JobType.Freelance },
];

export const WORK_MODE_OPTIONS = [
  { label: "Remote", value: WorkMode.Remote, icon: Globe },
  { label: "On-site", value: WorkMode.Onsite, icon: Building },
  { label: "Hybrid", value: WorkMode.Hybrid, icon: Laptop },
];

export const EXP_LEVEL_OPTIONS = [
  { label: "Fresher", sub: "0 yrs", value: ExperienceLevel.Fresher },
  { label: "Junior", sub: "0–2 yrs", value: ExperienceLevel.Junior },
  { label: "Mid", sub: "2–5 yrs", value: ExperienceLevel.Mid },
  { label: "Senior", sub: "5–10 yrs", value: ExperienceLevel.Senior },
  { label: "Lead", sub: "8+ yrs", value: ExperienceLevel.Lead },
  { label: "Executive", sub: "C-level", value: ExperienceLevel.Executive },
];

export const SALARY_TYPE_OPTIONS = [
  { label: "Monthly", value: SalaryType.Monthly },
  { label: "Annual", value: SalaryType.Annual },
  { label: "Hourly", value: SalaryType.Hourly },
  { label: "Stipend", value: SalaryType.Stipend },
];

export const FIELD_TYPE_OPTIONS: {
  label: string;
  icon: LucideIcon;
  value: FormFieldType;
  desc: string;
}[] = [
  {
    label: "Text input",
    icon: Type,
    value: FormFieldType.TextInput,
    desc: "Single line text",
  },
  {
    label: "Text area",
    icon: AlignLeft,
    value: FormFieldType.TextArea,
    desc: "Multi-line text",
  },
  {
    label: "Dropdown",
    icon: ChevronDown,
    value: FormFieldType.Dropdown,
    desc: "Pick one option",
  },
  {
    label: "Multi-select",
    icon: List,
    value: FormFieldType.MultiSelect,
    desc: "Pick multiple",
  },
  {
    label: "Radio group",
    icon: ToggleLeft,
    value: FormFieldType.RadioGroup,
    desc: "Select one",
  },
  {
    label: "Checkbox",
    icon: CheckSquare,
    value: FormFieldType.Checkbox,
    desc: "Yes / No",
  },
  {
    label: "Date picker",
    icon: Calendar,
    value: FormFieldType.DatePicker,
    desc: "Pick a date",
  },
  {
    label: "Number input",
    icon: Hash,
    value: FormFieldType.NumberInput,
    desc: "Numeric value",
  },
  {
    label: "Phone number",
    icon: PhoneIcon,
    value: FormFieldType.PhoneInput,
    desc: "Phone format",
  },
  {
    label: "URL input",
    icon: LinkIcon,
    value: FormFieldType.UrlInput,
    desc: "Link / website",
  },
  {
    label: "Rating",
    icon: Star,
    value: FormFieldType.RatingPicker,
    desc: "Star rating",
  },
];

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder: string;
  required: boolean;
  helpText: string;
  options: string[];
  acceptedFileTypes: string;
  maxFileSizeMb: number;
  min?: number;
  max?: number;
}

export const basicsSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  companyName: z.string().min(2, "Company name must be at least 2 characters").max(100, "Company name must be 100 characters or less"),
  location: z.string().min(2, "Enter a location"),
  jobType: z.number({ error: "Select job type" }).min(0, "Select job type"),
  workMode: z.number({ error: "Select work mode" }).min(0, "Select work mode"),
});

export const experienceSchema = z.object({
  experienceLevel: z
    .number({ error: "Select experience level" })
    .min(0, "Select experience level"),
  experienceMinYears: z.number({error: "Enter minimum years"}).min(0, "Enter minimum years"),
  experienceMaxYears: z.number({error: "Enter maximum years"}).min(0, "Enter maximum years"),
  totalOpenings: z.number().min(1, "At least 1 opening"),
});

export const salarySchema = z
  .object({
    salaryMin: z.number({ error: "Enter minimum salary" }).min(0, "Enter minimum salary"),
    salaryMax: z.number({ error: "Enter maximum salary" }).min(0, "Enter maximum salary"),
    salaryCurrency: z.string(),
    salaryType: z.number(),
    salaryVisibility: z.number(),
  })
  .refine((d) => d.salaryMax >= d.salaryMin, {
    message: "Max salary must be ≥ min salary",
    path: ["salaryMax"],
  });

export const applicationSchema = z
  .object({
    formType: z.number(),
    externalApplyUrl: z
      .string()
      .url("Enter valid URL")
      .optional()
      .or(z.literal("")),
    referralStatus: z.number(),
    referralBonus: z.string().optional(),
    applicationDeadline: z.string().optional(),
    isUrgent: z.boolean(),
  })
  .refine((d) => d.formType !== FormType.External || !!d.externalApplyUrl, {
    message: "External apply URL is required",
    path: ["externalApplyUrl"],
  });

export type BasicsValues = z.infer<typeof basicsSchema>;
export type ExperienceValues = z.infer<typeof experienceSchema>;
export type SalaryValues = z.infer<typeof salarySchema>;
export type ApplicationValues = z.infer<typeof applicationSchema>;
