import { z } from "zod";

import { GradingSystemEnum } from "@/models/userModel";

// ─── Types ────────────────────────────────────────────────────────────────

export type Step = "basic" | "education" | "laststep";

export interface StepMeta {
  id: Step;
  label: string;
  sublabel: string;
}

export const STEPS: StepMeta[] = [
  { id: "basic", label: "Basic details", sublabel: "Name, location and bio" },
  {
    id: "education",
    label: "Education",
    sublabel: "Employers prefer to know about your education",
  },
  { id: "laststep", label: "Last step", sublabel: "Resume & social links" },
];

// ─── Static data ──────────────────────────────────────────────────────────

export const QUALIFICATIONS = [
  "10th / Matriculation",
  "12th / Intermediate",
  "Graduation/Diploma",
  "Post Graduation",
  "PhD / Doctorate",
];
export const COURSES = [
  "B.Tech / B.E.",
  "B.Sc",
  "B.Com",
  "B.A.",
  "M.Tech / M.E.",
  "MBA",
  "MCA",
  "BCA",
  "BBA",
  "Other",
];
export const COURSE_TYPES = [
  "Full Time",
  "Part Time",
  "Distance Learning",
  "Online",
];
export const SPECIALIZATIONS = [
  "Computer Science and Engineering",
  "Electronics & Communication",
  "Mechanical Engineering",
  "Civil Engineering",
  "Information Technology",
  "Data Science",
  "MBA Finance",
  "MBA Marketing",
  "Other",
];
export const GRADING_OPTIONS = [
  { label: "Scale 10 Grading System", value: GradingSystemEnum.GPA10 },
  { label: "Scale 4 Grading System", value: GradingSystemEnum.GPA4 },
  { label: "% Marks of 100 Maximum", value: GradingSystemEnum.Percentage },
  { label: "Course Requires a Pass", value: GradingSystemEnum.Pass },
];
export const SKILL_SUGGESTIONS = [
  "React",
  "Node.js",
  "Python",
  "Java",
  "SQL",
  "Machine Learning",
  "UI/UX Design",
  "Data Analysis",
  "JavaScript",
  "TypeScript",
  "AWS",
  "Docker",
  "MongoDB",
  "Git",
  "Communication",
  "Leadership",
];
export const PASSING_YEARS = Array.from(
  { length: 8 },
  (_, i) => new Date().getFullYear() + 3 - i,
);
export const STARTING_YEARS = Array.from(
  { length: 8 },
  (_, i) => new Date().getFullYear() - i,
);

// ─── Zod schemas ──────────────────────────────────────────────────────────

export const basicSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .regex(/^[a-zA-Z\s]+$/, "Only letters allowed"),
  phone: z
    .string()
    .length(10, "Enter a valid 10-digit number"),
  location: z.string().min(2, "Please enter your city / location"),
  bio: z.string().max(300, "Bio must be under 300 characters").optional(),
});

export const educationSchema = z.object({
  qualification: z.string().min(1, "Please select a qualification"),
  course: z.string().min(1, "Please select a course"),
  courseType: z.string().min(1, "Please select course type"),
  specialization: z.string().min(1, "Please select a specialization"),
  college: z.string().min(2, "Please enter your university/institute name"),
  startingYear: z.string().min(4, "Please select starting year"),
  passingYear: z.string().min(4, "Please select passing year"),
  gradingSystem: z.number().min(0, "Please select a grading system"),
  gpa: z.string().optional(),
  skills: z.array(z.string()).min(1, "Add at least one skill"),
});

export const lastStepSchema = z.object({
  resumeUrl: z.string().optional(),
  linkedin: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  github: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  portfolio: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  twitter: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
});

export type BasicValues = z.infer<typeof basicSchema>;
export type EducationValues = z.infer<typeof educationSchema>;
export type LastStepValues = z.infer<typeof lastStepSchema>;

export const SOCIAL_FIELDS: {
  name: keyof LastStepValues;
  label: string;
  placeholder: string;
  icon: string;
  color: string;
}[] = [
  {
    name: "linkedin",
    label: "LinkedIn",
    placeholder: "https://linkedin.com/in/yourname",
    icon: "in",
    color: "bg-[#0077B5]",
  },
  {
    name: "github",
    label: "GitHub",
    placeholder: "https://github.com/yourhandle",
    icon: "gh",
    color: "bg-gray-900",
  },
  {
    name: "portfolio",
    label: "Portfolio",
    placeholder: "https://yourportfolio.com",
    icon: "🌐",
    color: "bg-violet-600",
  },
  {
    name: "twitter",
    label: "Twitter / X",
    placeholder: "https://twitter.com/yourhandle",
    icon: "𝕏",
    color: "bg-gray-800",
  },
  {
    name: "website",
    label: "Website",
    placeholder: "https://yourwebsite.com",
    icon: "🔗",
    color: "bg-indigo-500",
  },
];
