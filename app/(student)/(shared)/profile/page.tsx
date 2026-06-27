"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  X,
  Plus,
  Pencil,
  Upload,
  BookOpen,
  Briefcase,
  GraduationCap,
  Link as LinkIcon,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  ChevronRight,
  FolderOpen,
  Globe,
  Loader2,
  Trash2,
  Camera,
  ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MaritalStatusEnum,
  CategoryEnum,
  PreviousExperience,
  EducationDetails,
  ProjectDetails,
  User,
} from "@/models/userModel";
import { useCurrentUser, useUpdateJobSeekerMeta } from "@/hooks/useUser";
import { useFileUpload, useImageUpload } from "@/hooks/useUpload";
import Image from "next/image";
import { FieldError } from "@/components/common/FormComponents";
import {
  SavingOverlay,
  ProfileCompletion,
  SectionCard,
  Modal,
  ChipSelector,
} from "@/components/student/Profile/ProfilePageComp";
import {
  ModalType,
  EditPayload,
  getJobSeekerMeta,
  ExpValues,
  expSchema,
  EduValues,
  eduSchema,
  ProjValues,
  projSchema,
  SocialValues,
  socialSchema,
  PersonalValues,
  personalSchema,
  buildMeta,
  QUICK_LINKS,
  MARITAL_OPTS,
  CATEGORY_OPTS,
  BasicValues,
  basicSchema,
  SKILL_SUGGESTIONS,
  SOCIAL_FIELDS,
} from "@/constants/student/SProfileConstants";

export default function StudentProfilePage() {
  const { data: user } = useCurrentUser();
  const { mutateAsync: updateMeta, isPending: isSaving } =
    useUpdateJobSeekerMeta();
  const { mutateAsync: uploadFile, isPending: isUploading } = useFileUpload();
  const { mutateAsync: uploadImage, isPending: isUploadingImage } =
    useImageUpload();

  const [modal, setModal] = useState<ModalType>(null);
  const [editTarget, setEditTarget] = useState<EditPayload>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const meta = getJobSeekerMeta(user as User);
  const name = user?.Name ?? "Your Name";
  const email = user?.Email ?? "";
  const phone = user?.Phone ?? "";
  const location = meta?.Location ?? "";
  const avatarUrl = avatarPreview ?? meta?.AvatarUrl ?? null;
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isSubmitting = isSaving || isUploading || isUploadingImage;

  const completionPct = Math.min(
    100,
    [
      !!name,
      !!phone,
      !!location,
      skills.length > 0,
      (meta?.Education ?? []).length > 0,
      (meta?.PreviousExperience ?? []).length > 0,
      !!meta?.ResumeUrl,
      !!meta?.AvatarUrl,
    ].filter(Boolean).length * 12,
  );

  // ── Forms — all parameterised with their Zod-inferred types ──
  const basicForm = useForm<BasicValues>({
    resolver: zodResolver(basicSchema),
    defaultValues: { name: "", phone: "", location: "", bio: "" },
  });
  const expForm = useForm<ExpValues>({
    resolver: zodResolver(expSchema),
    defaultValues: {
      CompanyName: "",
      Role: "",
      StartDate: "",
      EndDate: "",
      CurrentlyWorking: false,
      Description: "",
    },
  });
  const eduForm = useForm<EduValues>({
    resolver: zodResolver(eduSchema),
    defaultValues: {
      College: "",
      Course: "",
      Specialization: "",
      StartingYear: "",
      GraduationYear: "",
      GPA: "",
    },
  });
  const projForm = useForm<ProjValues>({
    resolver: zodResolver(projSchema),
    defaultValues: { Title: "", Description: "", Link: "" },
  });
  const socialForm = useForm<SocialValues>({
    resolver: zodResolver(socialSchema),
    defaultValues: {
      LinkedIn: "",
      GitHub: "",
      Portfolio: "",
      Twitter: "",
      Website: "",
    },
  });
  const personalForm = useForm<PersonalValues>({
    resolver: zodResolver(personalSchema),
    defaultValues: {
      DateOfBirth: "",
      MaritalStatus: undefined,
      Category: undefined,
      PermanentAddress: "",
      CurrentAddress: "",
    },
  });

  // ── Prefill once user loads ──
  useEffect(() => {
    if (!user) return;
    const m = getJobSeekerMeta(user);

    basicForm.reset({
      name: user.Name ?? "",
      phone: user.Phone ?? "",
      location: m?.Location ?? "",
      bio: m?.Bio ?? "",
    });
    socialForm.reset({
      LinkedIn: m?.SocialLinks?.LinkedIn ?? "",
      GitHub: m?.SocialLinks?.GitHub ?? "",
      Portfolio: m?.SocialLinks?.Portfolio ?? "",
      Twitter: m?.SocialLinks?.Twitter ?? "",
      Website: m?.SocialLinks?.Website ?? "",
    });
    personalForm.reset({
      DateOfBirth: m?.PersonalDetails?.DateOfBirth ?? "",
      MaritalStatus: m?.PersonalDetails?.MaritalStatus,
      Category: m?.PersonalDetails?.Category,
      PermanentAddress: m?.PersonalDetails?.PermanentAddress ?? "",
      CurrentAddress: m?.PersonalDetails?.CurrentAddress ?? "",
    });
    setSkills(m?.Skills ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const close = () => {
    setModal(null);
    setEditTarget(null);
  };

  const openEditExp = (i: number) => {
    const exp = (meta?.PreviousExperience ?? [])[i];
    if (!exp) return;
    expForm.reset({
      CompanyName: exp.CompanyName,
      Role: exp.Role,
      StartDate: exp.StartDate,
      EndDate: exp.EndDate ?? "",
      CurrentlyWorking: exp.CurrentlyWorking ?? false,
      Description: exp.Description ?? "",
    });
    setEditTarget({ type: "experience", index: i });
    setModal("experience");
  };

  const openEditEdu = (i: number) => {
    const edu = (meta?.Education ?? [])[i];
    if (!edu) return;
    // All EducationDetails fields are typed — String() conversion is explicit and safe
    eduForm.reset({
      College: edu.College ?? "",
      Course: edu.Course ?? "",
      Specialization: edu.Specialization ?? "",
      StartingYear: edu.StartingYear != null ? String(edu.StartingYear) : "",
      GraduationYear:
        edu.GraduationYear != null ? String(edu.GraduationYear) : "",
      GPA: edu.GPA != null ? String(edu.GPA) : "",
    });
    setEditTarget({ type: "education", index: i });
    setModal("education");
  };

  const openEditProj = (i: number) => {
    const proj = (meta?.Projects ?? [])[i];
    if (!proj) return;
    projForm.reset({
      Title: proj.Title,
      Description: proj.Description,
      Link: proj.Link ?? "",
    });
    setEditTarget({ type: "projects", index: i });
    setModal("projects");
  };

  const openAddModal = (type: ModalType) => {
    if (type === "experience")
      expForm.reset({
        CompanyName: "",
        Role: "",
        StartDate: "",
        EndDate: "",
        CurrentlyWorking: false,
        Description: "",
      });
    if (type === "education")
      eduForm.reset({
        College: "",
        Course: "",
        Specialization: "",
        StartingYear: "",
        GraduationYear: "",
        GPA: "",
      });
    if (type === "projects")
      projForm.reset({ Title: "", Description: "", Link: "" });
    if (type === "resume") setResumeFile(null);
    setEditTarget(null);
    setModal(type);
  };

  const addSkill = (s: string) => {
    const t = s.trim();
    if (t && !skills.includes(t)) setSkills((p) => [...p, t]);
    setSkillInput("");
  };
  const removeSkill = (s: string) => setSkills((p) => p.filter((x) => x !== s));

  // ── Save handlers — parameter types come from Zod inference ──

  const handleBasicSave = async (v: BasicValues) => {
    await updateMeta(
      buildMeta(meta, { Location: v.location, Bio: v.bio || undefined }),
    );
    close();
  };

  const handleSkillsSave = async () => {
    await updateMeta(buildMeta(meta, { Skills: skills }));
    close();
  };

  const handleSocialSave = async (v: SocialValues) => {
    await updateMeta(
      buildMeta(meta, {
        SocialLinks: {
          LinkedIn: v.LinkedIn || undefined,
          GitHub: v.GitHub || undefined,
          Portfolio: v.Portfolio || undefined,
          Twitter: v.Twitter || undefined,
          Website: v.Website || undefined,
        },
      }),
    );
    close();
  };

  const handlePersonalSave = async (v: PersonalValues) => {
    await updateMeta(
      buildMeta(meta, {
        PersonalDetails: {
          DateOfBirth: v.DateOfBirth || undefined,
          MaritalStatus: v.MaritalStatus,
          Category: v.Category,
          PermanentAddress: v.PermanentAddress || undefined,
          CurrentAddress: v.CurrentAddress || undefined,
        },
      }),
    );
    close();
  };

  const handleExpSave = async (v: ExpValues) => {
    const existing: PreviousExperience[] = [
      ...(meta?.PreviousExperience ?? []),
    ];
    const entry: PreviousExperience = {
      CompanyName: v.CompanyName,
      Role: v.Role,
      StartDate: v.StartDate,
      EndDate: v.CurrentlyWorking ? undefined : v.EndDate || undefined,
      CurrentlyWorking: v.CurrentlyWorking ?? false,
      Description: v.Description || undefined,
    };
    if (editTarget?.type === "experience") {
      existing[editTarget.index] = entry;
    } else {
      existing.push(entry);
    }
    await updateMeta(buildMeta(meta, { PreviousExperience: existing }));
    close();
  };

  const handleDeleteExp = async (i: number) => {
    const updated: PreviousExperience[] = (
      meta?.PreviousExperience ?? []
    ).filter((_, idx) => idx !== i);
    await updateMeta(buildMeta(meta, { PreviousExperience: updated }));
  };

  const handleEduSave = async (v: EduValues) => {
    const existing: EducationDetails[] = [
      ...(meta?.Education ?? []),
    ] as EducationDetails[];
    const entry: EducationDetails = {
      College: v.College,
      Course: v.Course,
      Specialization: v.Specialization || undefined,
      StartingYear: v.StartingYear ? Number(v.StartingYear) : undefined,
      GraduationYear: v.GraduationYear ? Number(v.GraduationYear) : undefined,
      GPA: v.GPA ? Number(v.GPA) : undefined,
      // Required string fields on EducationDetails with sensible defaults
      CourseType: "",
      HighestQualificaiton: "",
    };
    if (editTarget?.type === "education") {
      existing[editTarget.index] = entry;
    } else {
      existing.push(entry);
    }
    await updateMeta(buildMeta(meta, { Education: existing }));
    close();
  };

  const handleDeleteEdu = async (i: number) => {
    const updated = (meta?.Education ?? []).filter(
      (_, idx) => idx !== i,
    ) as EducationDetails[];
    await updateMeta(buildMeta(meta, { Education: updated }));
  };

  const handleProjSave = async (v: ProjValues) => {
    const existing: ProjectDetails[] = [...(meta?.Projects ?? [])];
    const entry: ProjectDetails = {
      Title: v.Title,
      Description: v.Description,
      Link: v.Link || undefined,
    };
    if (editTarget?.type === "projects") {
      existing[editTarget.index] = entry;
    } else {
      existing.push(entry);
    }
    await updateMeta(buildMeta(meta, { Projects: existing }));
    close();
  };

  const handleDeleteProj = async (i: number) => {
    const updated: ProjectDetails[] = (meta?.Projects ?? []).filter(
      (_, idx) => idx !== i,
    );
    await updateMeta(buildMeta(meta, { Projects: updated }));
  };

  const handleResumeSave = async () => {
    if (!resumeFile || !user?.Id) return;
    const url = await uploadFile({ file: resumeFile, userId: user.Id });
    if (url) await updateMeta(buildMeta(meta, { ResumeUrl: url }));
    close();
  };

  const handleAvatarUpload = async (file: File) => {
    if (!user?.Id) return;
    setAvatarPreview(URL.createObjectURL(file));
    const uploadedUrl = await uploadImage({ file, userId: user.Id });
    if (uploadedUrl) {
      await updateMeta(buildMeta(meta, { AvatarUrl: uploadedUrl }));
    }
    close();
  };

  return (
    <>
      <SavingOverlay visible={isSubmitting} />

      <div className="min-h-screen bg-muted/50/80">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
          <div className="flex gap-6 items-start">
            {/* ── Left sidebar ── */}
            <aside className="hidden lg:flex flex-col gap-4 w-56 flex-shrink-0 sticky top-20">
              <div className="bg-card rounded-2xl border border-gray-100 shadow-sm p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Quick links
                </p>
                <nav className="space-y-0.5">
                  {QUICK_LINKS.map(({ label, id }) => (
                    <a
                      key={id}
                      href={`#${id}`}
                      className="flex items-center justify-between px-2 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all group"
                    >
                      {label}
                      <ChevronRight
                        size={12}
                        className="text-gray-300 group-hover:text-primary transition-colors"
                      />
                    </a>
                  ))}
                </nav>
              </div>
              <ProfileCompletion percent={completionPct} />
            </aside>

            {/* ── Main content ── */}
            <div className="flex-1 space-y-4 min-w-0">
              {/* Hero card */}
              <div className="bg-card rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-start gap-5">
                  {/* Avatar with camera button */}
                  <div className="relative flex-shrink-0">
                    <div className="relative w-20 h-20">
                      <svg
                        className="absolute inset-0 w-full h-full -rotate-90"
                        viewBox="0 0 88 88"
                      >
                        <circle
                          cx="44"
                          cy="44"
                          r="40"
                          fill="none"
                          stroke="#ede9fe"
                          strokeWidth="4"
                        />
                        <circle
                          cx="44"
                          cy="44"
                          r="40"
                          fill="none"
                          stroke="#7c3aed"
                          strokeWidth="4"
                          strokeDasharray={`${2 * Math.PI * 40}`}
                          strokeDashoffset={`${2 * Math.PI * 40 * (1 - completionPct / 100)}`}
                          strokeLinecap="round"
                          className="transition-all duration-700"
                        />
                      </svg>
                      <div className="absolute inset-1.5 rounded-full overflow-hidden border-2 border-white bg-primary/20 flex items-center justify-center">
                        {avatarUrl ? (
                          <Image
                            src={avatarUrl}
                            alt={name}
                            width={68}
                            height={68}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-primary/90 font-bold text-xl">
                            {initials}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setModal("avatar")}
                      className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-sm hover:bg-primary/90 transition-colors z-10"
                      title="Update profile photo"
                    >
                      <Camera size={11} className="text-primary-foreground" />
                    </button>
                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-xs font-bold text-primary bg-card px-1.5 py-0.5 rounded-full border border-primary/20 shadow-sm">
                      {completionPct}%
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-xl font-bold text-foreground">
                        {name}
                      </h1>
                      <button
                        onClick={() => setModal("basic")}
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground/80 hover:text-primary hover:bg-primary/10 transition-all"
                      >
                        <Pencil size={12} />
                      </button>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5">
                      {location && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin size={12} className="text-muted-foreground/80" />
                          {location}
                        </div>
                      )}
                      {phone && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Phone size={12} className="text-muted-foreground/80" />
                          {phone}
                          <CheckCircle2 size={11} className="text-green-500" />
                        </div>
                      )}
                      {email && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground col-span-2 truncate">
                          <Mail size={12} className="text-muted-foreground/80" />
                          {email}
                          <CheckCircle2 size={11} className="text-green-500" />
                        </div>
                      )}
                    </div>
                    {meta?.Bio && (
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                        {meta.Bio}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Resume */}
              <SectionCard
                id="resume"
                title="Resume"
                badge="Add 10%"
                onAdd={() => openAddModal("resume")}
                addLabel="Upload"
                isEmpty={!meta?.ResumeUrl}
                emptyText="Upload your resume to let recruiters know about your experience"
              >
                {meta?.ResumeUrl && (
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-primary/20 bg-primary/10/50">
                    <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
                      <BookOpen className="text-primary" size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground/90">
                        resume.pdf
                      </p>
                      <p className="text-xs text-muted-foreground/80">Uploaded</p>
                    </div>
                    <button
                      onClick={() => openAddModal("resume")}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      Update
                    </button>
                  </div>
                )}
              </SectionCard>

              {/* Skills */}
              <SectionCard
                id="skills"
                title="Key skills"
                badge="Add 8%"
                onAdd={() => openAddModal("skills")}
                onEdit={
                  skills.length > 0 ? () => openAddModal("skills") : undefined
                }
                isEmpty={skills.length === 0}
                emptyText="Recruiters look for candidates with specific key skills"
              >
                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary/90 border border-primary/20 font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </SectionCard>

              {/* Education — map infers EducationDetails from the typed meta field */}
              <SectionCard
                id="education"
                title="Education"
                badge="Add 10%"
                subtitle="Add your educational qualifications"
                onAdd={() => openAddModal("education")}
                isEmpty={(meta?.Education ?? []).length === 0}
                emptyText="Add your education details to improve recruiter trust"
              >
                <div className="space-y-3">
                  {(meta?.Education ?? []).map((edu, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 bg-muted/50/50"
                    >
                      <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="text-primary" size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground/90">
                          {edu.Course}
                        </p>
                        <p className="text-xs text-muted-foreground">{edu.College}</p>
                        {edu.Specialization && (
                          <p className="text-xs text-muted-foreground/80">
                            {edu.Specialization}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground/80 mt-0.5">
                          {edu.StartingYear} — {edu.GraduationYear ?? "Present"}
                          {edu.GPA != null ? ` · ${edu.GPA} GPA` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => openEditEdu(i)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground/80 hover:text-primary hover:bg-primary/10 transition-all"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteEdu(i)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground/80 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              {/* Experience — map infers PreviousExperience */}
              <SectionCard
                id="experience"
                title="Employment"
                subtitle="Your employment details help recruiters understand your experience"
                onAdd={() => openAddModal("experience")}
                addLabel="Add employment"
                isEmpty={(meta?.PreviousExperience ?? []).length === 0}
                emptyText="Add your work experience to stand out to recruiters"
              >
                <div className="space-y-3">
                  {(meta?.PreviousExperience ?? []).map((exp, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 bg-muted/50/50"
                    >
                      <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="text-blue-500" size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground/90">
                          {exp.Role}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {exp.CompanyName}
                        </p>
                        <p className="text-xs text-muted-foreground/80 mt-0.5">
                          {exp.StartDate} —{" "}
                          {exp.CurrentlyWorking ? "Present" : exp.EndDate}
                        </p>
                        {exp.Description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {exp.Description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => openEditExp(i)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground/80 hover:text-primary hover:bg-primary/10 transition-all"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteExp(i)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground/80 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              {/* Projects — map infers ProjectDetails */}
              <SectionCard
                id="projects"
                title="Projects"
                onAdd={() => openAddModal("projects")}
                addLabel="Add project"
                isEmpty={(meta?.Projects ?? []).length === 0}
                emptyText="Showcase your work — add projects you have built"
              >
                <div className="space-y-3">
                  {(meta?.Projects ?? []).map((proj, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 bg-muted/50/50"
                    >
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                        <FolderOpen className="text-emerald-500" size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground/90">
                          {proj.Title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {proj.Description}
                        </p>
                        {proj.Link && (
                          <a
                            href={proj.Link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline mt-1 flex items-center gap-1"
                          >
                            <Globe size={11} /> View project
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => openEditProj(i)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground/80 hover:text-primary hover:bg-primary/10 transition-all"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteProj(i)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground/80 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              {/* Social links */}
              <SectionCard
                id="social"
                title="Social links"
                subtitle="Help recruiters find your work online"
                onEdit={() => setModal("social")}
                onAdd={
                  !meta?.SocialLinks ? () => setModal("social") : undefined
                }
                isEmpty={
                  !meta?.SocialLinks ||
                  Object.values(meta.SocialLinks).every((v) => !v)
                }
                emptyText="Add your LinkedIn, GitHub, portfolio and other profiles"
              >
                <div className="space-y-2">
                  {meta?.SocialLinks &&
                    (
                      Object.entries(meta.SocialLinks) as [
                        keyof typeof meta.SocialLinks,
                        string | undefined,
                      ][]
                    ).map(([key, val]) =>
                      val ? (
                        <div key={key} className="flex items-center gap-2">
                          <LinkIcon size={12} className="text-muted-foreground/80" />
                          <span className="text-xs text-muted-foreground w-20 flex-shrink-0">
                            {key}
                          </span>
                          <a
                            href={val}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline truncate"
                          >
                            {val}
                          </a>
                        </div>
                      ) : null,
                    )}
                </div>
              </SectionCard>

              {/* Personal details */}
              <SectionCard
                id="personal"
                title="Personal details"
                subtitle="This information is important for employers to know you better"
                onEdit={() => setModal("personal")}
                onAdd={
                  !meta?.PersonalDetails?.DateOfBirth
                    ? () => setModal("personal")
                    : undefined
                }
              >
                <div className="grid grid-cols-2 gap-4">
                  {(
                    [
                      {
                        label: "Date of birth",
                        value: meta?.PersonalDetails?.DateOfBirth,
                      },
                      {
                        label: "Marital status",
                        value: MARITAL_OPTS.find(
                          (o) =>
                            o.value === meta?.PersonalDetails?.MaritalStatus,
                        )?.label,
                      },
                      {
                        label: "Category",
                        value: CATEGORY_OPTS.find(
                          (o) => o.value === meta?.PersonalDetails?.Category,
                        )?.label,
                      },
                      {
                        label: "Current address",
                        value: meta?.PersonalDetails?.CurrentAddress,
                      },
                      {
                        label: "Permanent address",
                        value: meta?.PersonalDetails?.PermanentAddress,
                      },
                    ] satisfies { label: string; value: string | undefined }[]
                  ).map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs text-muted-foreground/80">{label}</p>
                      <p
                        className={cn(
                          "text-sm mt-0.5",
                          value
                            ? "text-foreground/90 font-medium"
                            : "text-primary/100 text-xs cursor-pointer hover:underline",
                        )}
                        onClick={
                          !value ? () => setModal("personal") : undefined
                        }
                      >
                        {value ?? `Add ${label.toLowerCase()}`}
                      </p>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          </div>
        </div>
      </div>

      {/* ════════ MODALS ════════ */}

      {/* Basic info */}
      <Modal open={modal === "basic"} onClose={close} title="Edit basic info">
        <form
          className="space-y-4"
          onSubmit={basicForm.handleSubmit(handleBasicSave)}
        >
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Full name
            </Label>
            <Input
              {...basicForm.register("name")}
              className="h-10 text-sm rounded-xl border-gray-200 bg-muted/50 focus:bg-card"
            />
            <FieldError message={basicForm.formState.errors.name?.message} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Phone
              </Label>
              <Input
                {...basicForm.register("phone")}
                className="h-10 text-sm rounded-xl border-gray-200 bg-muted/50 focus:bg-card"
              />
              <FieldError message={basicForm.formState.errors.phone?.message} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Location
              </Label>
              <Input
                {...basicForm.register("location")}
                className="h-10 text-sm rounded-xl border-gray-200 bg-muted/50 focus:bg-card"
              />
              <FieldError
                message={basicForm.formState.errors.location?.message}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Bio
            </Label>
            <Textarea
              {...basicForm.register("bio")}
              rows={3}
              className="text-sm rounded-xl border-gray-200 bg-muted/50 focus:bg-card resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={close}
              className="flex-1 h-10 rounded-xl border-gray-200 text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Saving…
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Avatar */}
      <Modal
        open={modal === "avatar"}
        onClose={close}
        title="Update profile photo"
      >
        <div className="space-y-4">
          <div
            onClick={() => avatarInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 py-10 cursor-pointer hover:border-primary/40 hover:bg-primary/10/30 transition-all"
          >
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) await handleAvatarUpload(file);
              }}
            />
            {avatarPreview ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-full border-2 border-primary/30 overflow-hidden shadow-sm">
                  <img
                    src={avatarPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs text-primary font-medium">
                  Click to change
                </p>
              </div>
            ) : meta?.AvatarUrl ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-full border-2 border-primary/20 overflow-hidden shadow-sm">
                  <img
                    src={meta.AvatarUrl}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Click to update photo</p>
              </div>
            ) : (
              <>
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                  <ImageIcon className="text-primary" size={24} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground/80">
                    Click to upload a photo
                  </p>
                  <p className="text-xs text-muted-foreground/80 mt-0.5">
                    PNG · JPG · WEBP — Recommended 400×400 px
                  </p>
                </div>
              </>
            )}
          </div>
          {isUploadingImage && (
            <div className="flex items-center justify-center gap-2 text-xs text-primary">
              <Loader2 size={13} className="animate-spin" /> Uploading…
            </div>
          )}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={close}
              className="flex-1 h-10 rounded-xl border-gray-200 text-sm"
            >
              Cancel
            </Button>
            <Button
              disabled={isUploadingImage}
              onClick={() => avatarInputRef.current?.click()}
              className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isUploadingImage ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Uploading…
                </>
              ) : (
                <>
                  <Camera size={14} />{" "}
                  {meta?.AvatarUrl ? "Change photo" : "Upload photo"}
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Resume */}
      <Modal
        open={modal === "resume"}
        onClose={close}
        title="Upload resume"
        badge="Add 10%"
      >
        <div className="space-y-4">
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
                const f = e.dataTransfer.files[0];
                if (f) setResumeFile(f);
              }}
              className={cn(
                "relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-10 px-6 cursor-pointer transition-all",
                dragOver
                  ? "border-primary bg-primary/10"
                  : "border-gray-200 bg-muted/50/80 hover:border-primary/40 hover:bg-primary/10/40",
              )}
            >
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setResumeFile(f);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Upload className="text-primary/100" size={22} />
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
                <BookOpen className="text-primary" size={18} />
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
                className="w-7 h-7 rounded-lg bg-card border border-gray-200 flex items-center justify-center text-muted-foreground/80 hover:text-red-500 hover:border-red-200 transition-all flex-shrink-0"
              >
                <X size={13} />
              </button>
            </div>
          )}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={close}
              className="flex-1 h-10 rounded-xl border-gray-200 text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleResumeSave}
              disabled={!resumeFile || isSubmitting}
              className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Uploading…
                </>
              ) : (
                "Upload"
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Skills */}
      <Modal
        open={modal === "skills"}
        onClose={close}
        title="Key skills"
        badge="Add 8%"
      >
        <div className="space-y-4">
          <div className="min-h-[90px] rounded-xl border p-3 bg-muted/50 focus-within:bg-card focus-within:border-primary transition-all border-gray-200">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {skills.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 bg-primary/20 text-primary/90 text-xs px-2.5 py-1 rounded-full font-medium"
                >
                  {s}
                  <button type="button" onClick={() => removeSkill(s)}>
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addSkill(skillInput);
                }
              }}
              placeholder="Type a skill and press Enter…"
              className="w-full bg-transparent text-sm text-foreground/80 placeholder:text-muted-foreground/80 outline-none"
            />
          </div>
          <div>
            <p className="text-xs text-muted-foreground/80 mb-2">Suggestions</p>
            <div className="flex flex-wrap gap-2">
              {SKILL_SUGGESTIONS.filter((s) => !skills.includes(s)).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addSkill(s)}
                  className="text-xs px-3 py-1.5 rounded-full border border-gray-200 bg-card text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/10 transition-all flex items-center gap-1"
                >
                  <Plus size={11} /> {s}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={close}
              className="flex-1 h-10 rounded-xl border-gray-200 text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSkillsSave}
              disabled={isSubmitting}
              className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Saving…
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Education */}
      <Modal
        open={modal === "education"}
        onClose={close}
        title={
          editTarget?.type === "education" ? "Edit education" : "Add education"
        }
        badge="Add 10%"
      >
        <form
          className="space-y-4"
          onSubmit={eduForm.handleSubmit(handleEduSave)}
        >
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              University / Institute <span className="text-red-500">*</span>
            </Label>
            <Input
              {...eduForm.register("College")}
              placeholder="Eg. IIT Delhi"
              className="h-10 text-sm rounded-xl border-gray-200 bg-muted/50 focus:bg-card"
            />
            <FieldError message={eduForm.formState.errors.College?.message} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Course <span className="text-red-500">*</span>
              </Label>
              <Input
                {...eduForm.register("Course")}
                placeholder="B.Tech / B.E."
                className="h-10 text-sm rounded-xl border-gray-200 bg-muted/50 focus:bg-card"
              />
              <FieldError message={eduForm.formState.errors.Course?.message} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Specialization
              </Label>
              <Input
                {...eduForm.register("Specialization")}
                placeholder="Computer Science"
                className="h-10 text-sm rounded-xl border-gray-200 bg-muted/50 focus:bg-card"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Starting year
              </Label>
              <Input
                type="number"
                {...eduForm.register("StartingYear")}
                placeholder="2020"
                className="h-10 text-sm rounded-xl border-gray-200 bg-muted/50 focus:bg-card"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Passing year
              </Label>
              <Input
                type="number"
                {...eduForm.register("GraduationYear")}
                placeholder="2024"
                className="h-10 text-sm rounded-xl border-gray-200 bg-muted/50 focus:bg-card"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              GPA / Percentage
            </Label>
            <Input
              {...eduForm.register("GPA")}
              placeholder="e.g. 8.5 or 85%"
              className="h-10 text-sm rounded-xl border-gray-200 bg-muted/50 focus:bg-card"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={close}
              className="flex-1 h-10 rounded-xl border-gray-200 text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Saving…
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Experience */}
      <Modal
        open={modal === "experience"}
        onClose={close}
        title={
          editTarget?.type === "experience"
            ? "Edit employment"
            : "Add employment"
        }
      >
        <form
          className="space-y-4"
          onSubmit={expForm.handleSubmit(handleExpSave)}
        >
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Company name <span className="text-red-500">*</span>
            </Label>
            <Input
              {...expForm.register("CompanyName")}
              placeholder="Google, Amazon…"
              className="h-10 text-sm rounded-xl border-gray-200 bg-muted/50 focus:bg-card"
            />
            <FieldError
              message={expForm.formState.errors.CompanyName?.message}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Role / Designation <span className="text-red-500">*</span>
            </Label>
            <Input
              {...expForm.register("Role")}
              placeholder="Software Engineer"
              className="h-10 text-sm rounded-xl border-gray-200 bg-muted/50 focus:bg-card"
            />
            <FieldError message={expForm.formState.errors.Role?.message} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Start date <span className="text-red-500">*</span>
              </Label>
              <Input
                type="month"
                {...expForm.register("StartDate")}
                className="h-10 text-sm rounded-xl border-gray-200 bg-muted/50 focus:bg-card"
              />
              <FieldError
                message={expForm.formState.errors.StartDate?.message}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                End date
              </Label>
              <Input
                type="month"
                {...expForm.register("EndDate")}
                disabled={expForm.watch("CurrentlyWorking")}
                className="h-10 text-sm rounded-xl border-gray-200 bg-muted/50 focus:bg-card disabled:opacity-40"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              {...expForm.register("CurrentlyWorking")}
              className="rounded"
            />
            I currently work here
          </label>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Description
            </Label>
            <Textarea
              {...expForm.register("Description")}
              rows={3}
              placeholder="Describe your role and achievements…"
              className="text-sm rounded-xl border-gray-200 bg-muted/50 focus:bg-card resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={close}
              className="flex-1 h-10 rounded-xl border-gray-200 text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Saving…
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Projects */}
      <Modal
        open={modal === "projects"}
        onClose={close}
        title={editTarget?.type === "projects" ? "Edit project" : "Add project"}
      >
        <form
          className="space-y-4"
          onSubmit={projForm.handleSubmit(handleProjSave)}
        >
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Project title <span className="text-red-500">*</span>
            </Label>
            <Input
              {...projForm.register("Title")}
              placeholder="E-commerce Platform"
              className="h-10 text-sm rounded-xl border-gray-200 bg-muted/50 focus:bg-card"
            />
            <FieldError message={projForm.formState.errors.Title?.message} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              {...projForm.register("Description")}
              rows={3}
              placeholder="What did you build and what technologies did you use?"
              className="text-sm rounded-xl border-gray-200 bg-muted/50 focus:bg-card resize-none"
            />
            <FieldError
              message={projForm.formState.errors.Description?.message}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Project link
            </Label>
            <Input
              {...projForm.register("Link")}
              type="url"
              placeholder="https://github.com/you/project"
              className="h-10 text-sm rounded-xl border-gray-200 bg-muted/50 focus:bg-card"
            />
            <FieldError message={projForm.formState.errors.Link?.message} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={close}
              className="flex-1 h-10 rounded-xl border-gray-200 text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Saving…
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Social links — SOCIAL_FIELDS drives both the config and register() key types */}
      <Modal open={modal === "social"} onClose={close} title="Social links">
        <form
          className="space-y-4"
          onSubmit={socialForm.handleSubmit(handleSocialSave)}
        >
          {SOCIAL_FIELDS.map(({ name, icon, color, placeholder }) => (
            <div key={name} className="flex items-center gap-3">
              <div
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0",
                  color,
                )}
              >
                {icon}
              </div>
              <div className="flex-1">
                <Input
                  type="url"
                  placeholder={placeholder}
                  {...socialForm.register(name)}
                  className={cn(
                    "h-10 text-sm rounded-xl border-gray-200 bg-muted/50 focus:bg-card transition-all",
                    socialForm.formState.errors[name] && "border-red-300",
                  )}
                />
                <FieldError
                  message={socialForm.formState.errors[name]?.message}
                />
              </div>
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={close}
              className="flex-1 h-10 rounded-xl border-gray-200 text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Saving…
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Personal details — ChipSelector is explicitly typed with the enum */}
      <Modal
        open={modal === "personal"}
        onClose={close}
        title="Personal details"
      >
        <form
          className="space-y-5"
          onSubmit={personalForm.handleSubmit(handlePersonalSave)}
        >
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Date of birth
            </Label>
            <Input
              type="date"
              {...personalForm.register("DateOfBirth")}
              className="h-10 text-sm rounded-xl border-gray-200 bg-muted/50 focus:bg-card"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Marital status
            </Label>
            <ChipSelector<MaritalStatusEnum>
              options={MARITAL_OPTS}
              value={personalForm.watch("MaritalStatus")}
              onChange={(v) => personalForm.setValue("MaritalStatus", v)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Category
            </Label>
            <ChipSelector<CategoryEnum>
              options={CATEGORY_OPTS}
              value={personalForm.watch("Category")}
              onChange={(v) => personalForm.setValue("Category", v)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Current address
            </Label>
            <Textarea
              {...personalForm.register("CurrentAddress")}
              rows={2}
              placeholder="Flat no, Street, City, State, PIN"
              className="text-sm rounded-xl border-gray-200 bg-muted/50 focus:bg-card resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Permanent address
            </Label>
            <Textarea
              {...personalForm.register("PermanentAddress")}
              rows={2}
              placeholder="Flat no, Street, City, State, PIN"
              className="text-sm rounded-xl border-gray-200 bg-muted/50 focus:bg-card resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={close}
              className="flex-1 h-10 rounded-xl border-gray-200 text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Saving…
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
