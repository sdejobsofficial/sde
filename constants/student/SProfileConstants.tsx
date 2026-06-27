import {
  MaritalStatusEnum,
  CategoryEnum,
  JobSeekerMeta,
  IsJobSeeker,
  UpdateJobSeekerMetaDTO,
  User,
} from "@/models/userModel";
import * as z from "zod";

export type ModalType =
  | "basic"
  | "resume"
  | "skills"
  | "education"
  | "experience"
  | "projects"
  | "social"
  | "personal"
  | "avatar"
  | null;

export type EditPayload =
  | { type: "education"; index: number }
  | { type: "experience"; index: number }
  | { type: "projects"; index: number }
  | null;

export const basicSchema = z.object({
  name: z.string().min(2, "Required"),
  phone: z.string().min(10, "Required"),
  location: z.string().min(2, "Required"),
  bio: z.string().optional(),
});

export const expSchema = z.object({
  CompanyName: z.string().min(1, "Required"),
  Role: z.string().min(1, "Required"),
  StartDate: z.string().min(1, "Required"),
  EndDate: z.string().optional(),
  CurrentlyWorking: z.boolean().optional(),
  Description: z.string().optional(),
});

export const eduSchema = z.object({
  College: z.string().min(1, "Required"),
  Course: z.string().min(1, "Required"),
  Specialization: z.string().optional(),
  StartingYear: z.string().optional(),
  GraduationYear: z.string().optional(),
  GPA: z.string().optional(),
});

export const projSchema = z.object({
  Title: z.string().min(1, "Required"),
  Description: z.string().min(1, "Required"),
  Link: z.string().url("Enter valid URL").optional().or(z.literal("")),
});

export const socialSchema = z.object({
  LinkedIn: z.string().url("Invalid URL").optional().or(z.literal("")),
  GitHub: z.string().url("Invalid URL").optional().or(z.literal("")),
  Portfolio: z.string().url("Invalid URL").optional().or(z.literal("")),
  Twitter: z.string().url("Invalid URL").optional().or(z.literal("")),
  Website: z.string().url("Invalid URL").optional().or(z.literal("")),
});

export const personalSchema = z.object({
  DateOfBirth: z.string().optional(),
  MaritalStatus: z.nativeEnum(MaritalStatusEnum).optional(),
  Category: z.nativeEnum(CategoryEnum).optional(),
  PermanentAddress: z.string().optional(),
  CurrentAddress: z.string().optional(),
});

export type BasicValues = z.infer<typeof basicSchema>;
export type ExpValues = z.infer<typeof expSchema>;
export type EduValues = z.infer<typeof eduSchema>;
export type ProjValues = z.infer<typeof projSchema>;
export type SocialValues = z.infer<typeof socialSchema>;
export type PersonalValues = z.infer<typeof personalSchema>;

export const MARITAL_OPTS: { label: string; value: MaritalStatusEnum }[] = [
  { label: "Single", value: MaritalStatusEnum.Single },
  { label: "Married", value: MaritalStatusEnum.Married },
  { label: "Divorced", value: MaritalStatusEnum.Divorced },
  { label: "Widowed", value: MaritalStatusEnum.Widowed },
  { label: "Separated", value: MaritalStatusEnum.Separated },
  { label: "Other", value: MaritalStatusEnum.Other },
];

export const CATEGORY_OPTS: { label: string; value: CategoryEnum }[] = [
  { label: "General", value: CategoryEnum.General },
  { label: "SC", value: CategoryEnum.ScheduleCaste },
  { label: "ST", value: CategoryEnum.ScheduleTribe },
  { label: "OBC", value: CategoryEnum.OtherBackwardClass },
  { label: "Other", value: CategoryEnum.Other },
];

export const SKILL_SUGGESTIONS = [
  "React",
  "Node.js",
  "Python",
  "Java",
  "SQL",
  "TypeScript",
  "Machine Learning",
  "AWS",
  "Docker",
  "MongoDB",
  "Git",
  "UI/UX",
] as const;

export const QUICK_LINKS = [
  { label: "Resume", id: "resume" },
  { label: "Key skills", id: "skills" },
  { label: "Education", id: "education" },
  { label: "Experience", id: "experience" },
  { label: "Projects", id: "projects" },
  { label: "Social links", id: "social" },
  { label: "Personal details", id: "personal" },
] as const;

export type SocialField = {
  name: keyof SocialValues;
  icon: string;
  color: string;
  placeholder: string;
};

export const SOCIAL_FIELDS: SocialField[] = [
  {
    name: "LinkedIn",
    icon: "in",
    color: "bg-[#0077B5]",
    placeholder: "https://linkedin.com/in/you",
  },
  {
    name: "GitHub",
    icon: "gh",
    color: "bg-gray-900",
    placeholder: "https://github.com/you",
  },
  {
    name: "Portfolio",
    icon: "🌐",
    color: "bg-violet-600",
    placeholder: "https://yourportfolio.com",
  },
  {
    name: "Twitter",
    icon: "𝕏",
    color: "bg-gray-800",
    placeholder: "https://twitter.com/you",
  },
  {
    name: "Website",
    icon: "🔗",
    color: "bg-indigo-500",
    placeholder: "https://yourwebsite.com",
  },
];

export function getJobSeekerMeta(
  user: User | undefined,
): JobSeekerMeta | undefined {
  if (!user || !IsJobSeeker(user)) return undefined;
  return user.Meta ?? undefined;
}

export function buildMeta(
  existing: JobSeekerMeta | undefined,
  patch: Partial<UpdateJobSeekerMetaDTO>,
): UpdateJobSeekerMetaDTO {
  return {
    AvatarUrl: existing?.AvatarUrl,
    Location: existing?.Location,
    Bio: existing?.Bio,
    Education: existing?.Education ?? [],
    Skills: existing?.Skills ?? [],
    ResumeUrl: existing?.ResumeUrl,
    SocialLinks: existing?.SocialLinks
      ? { ...existing.SocialLinks }
      : undefined,
    Projects: existing?.Projects ?? [],
    LanguageProficiency: existing?.LanguageProficiency ?? [],
    PreviousExperience: existing?.PreviousExperience ?? [],
    PersonalDetails: existing?.PersonalDetails,
    ...patch,
  };
}
