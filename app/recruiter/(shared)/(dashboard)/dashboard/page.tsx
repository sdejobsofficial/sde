"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Pencil, X, MapPin, Globe, Users, Building2, BadgeCheck,
  Plus, Camera, Link as LinkIcon, Layers, CheckCircle2,
  AlertCircle, Loader2, ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CompanyMeta, VerificationStatus, CompanySize, UpdateCompanyMetaDTO } from "@/models/userModel";
import { useCurrentUser, useUpdateCompanyMeta } from "@/hooks/useUser";
import { useImageUpload } from "@/hooks/useUpload";
import Image from "next/image";
import { FieldError } from "@/components/common/FormComponents";
import {
  COMPANY_SIZES, INDUSTRIES, SOCIAL_FIELDS,
} from "@/constants/company/COnboardingConstants";
import Link from "next/link";

// ─── Schemas ──────────────────────────────────────────────────────────────

const basicSchema = z.object({
  name:     z.string().min(2, "Required"),
  phone:    z.string().length(10, "Must be 10 digits").regex(/^[6-9]\d{9}$/, "Invalid number"),
  location: z.string().min(2, "Required"),
  website:  z.string().url("Invalid URL").optional().or(z.literal("")),
  about:    z.string().min(20, "At least 20 characters").max(600),
});

const detailsSchema = z.object({
  industries: z.array(z.string()).min(1, "Select at least one industry"),
  size:       z.number({ message: "Select a company size" }).optional(),
});

const socialSchema = z.object({
  LinkedIn:  z.string().url("Invalid URL").optional().or(z.literal("")),
  Twitter:   z.string().url("Invalid URL").optional().or(z.literal("")),
  Website:   z.string().url("Invalid URL").optional().or(z.literal("")),
  GitHub:    z.string().url("Invalid URL").optional().or(z.literal("")),
  Portfolio: z.string().url("Invalid URL").optional().or(z.literal("")),
});

type BasicValues   = z.infer<typeof basicSchema>;
type DetailsValues = z.infer<typeof detailsSchema>;
type SocialValues  = z.infer<typeof socialSchema>;
type ModalType     = "basic" | "details" | "social" | "logo" | null;

// ─── Modal wrapper ────────────────────────────────────────────────────────

function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void;
  title: string; children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-card rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-base font-bold text-foreground">{title}</h3>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground/80 hover:bg-muted hover:text-foreground/80 transition-all">
            <X size={15} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ─── Info row ─────────────────────────────────────────────────────────────

function InfoRow({ label, value, onAdd }: {
  label: string; value?: string; onAdd?: () => void;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground/80">{label}</p>
      {value ? (
        <p className="text-sm font-medium text-foreground/90 mt-0.5">{value}</p>
      ) : (
        <button onClick={onAdd}
          className="text-xs text-primary/100 hover:text-primary hover:underline mt-0.5 transition-colors">
          Add {label.toLowerCase()}
        </button>
      )}
    </div>
  );
}

// ─── Profile strength ─────────────────────────────────────────────────────

function ProfileStrength({ name, meta }: { name: string; meta: CompanyMeta | null }) {
  const checks = [
    { label: "Company name",   done: !!name },
    { label: "Location",       done: !!meta?.Location },
    { label: "About section",  done: !!(meta?.Bio && meta.Bio.length >= 20) },
    { label: "Industry",       done: (meta?.Industry ?? []).length > 0 },
    { label: "Company size",   done: meta?.Size !== undefined && meta?.Size !== null },
    { label: "Logo uploaded",  done: !!meta?.AvatarUrl },
    { label: "Social links",   done: !!(meta?.SocialLinks?.LinkedIn || meta?.SocialLinks?.Website) },
  ];
  const done = checks.filter(c => c.done).length;
  const pct  = Math.round((done / checks.length) * 100);

  return (
    <div className="bg-card rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-foreground/90">Profile strength</p>
        <span className={cn("text-sm font-bold", pct === 100 ? "text-green-600" : "text-primary")}>
          {pct}%
        </span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-4">
        <div
          className={cn("h-full rounded-full transition-all duration-700", pct === 100 ? "bg-green-500" : "bg-primary/100")}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="space-y-2">
        {checks.map(({ label, done }) => (
          <div key={label} className="flex items-center gap-2">
            {done
              ? <CheckCircle2 size={13} className="text-green-500 flex-shrink-0" />
              : <AlertCircle  size={13} className="text-gray-300 flex-shrink-0" />}
            <span className={cn("text-xs", done ? "text-muted-foreground font-medium" : "text-muted-foreground/80")}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Saving overlay ───────────────────────────────────────────────────────

function SavingOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-card rounded-2xl px-6 py-4 shadow-xl flex items-center gap-3">
        <Loader2 size={18} className="text-primary animate-spin" />
        <span className="text-sm font-medium text-foreground/80">Saving changes…</span>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default function CompanyProfilePage() {
  const { data: user } = useCurrentUser();
  const { mutateAsync: updateMeta, isPending: isSaving } = useUpdateCompanyMeta();
  const { mutateAsync: uploadImage, isPending: isUploading }  = useImageUpload();

  const [modal, setModal] = useState<ModalType>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const close = () => setModal(null);
  const isSubmitting = isSaving || isUploading;

  // ── Derive values from user ──
  const meta      = (user?.Meta as CompanyMeta) ?? null;
  const name      = user?.Name ?? "";
  const email     = user?.Email ?? "";
  const phone     = user?.Phone ?? "";
  const logoUrl   = logoPreview ?? meta?.AvatarUrl ?? null;
  const location  = meta?.Location ?? "";
  const bio       = meta?.Bio ?? "";
  const website   = meta?.Website ?? "";
  const industries: string[] = Array.isArray(meta?.Industry) ? (meta!.Industry as string[]) : [];
  const sizeEntry = COMPANY_SIZES.find(s => s.value === meta?.Size);
  const verified  = meta?.VerificationStatus === VerificationStatus.Verified;

  // ── Basic form ──
  const basicForm = useForm<BasicValues>({
    resolver: zodResolver(basicSchema),
    defaultValues: { name: "", phone: "", location: "", website: "", about: "" },
    mode: "onTouched",
  });

  // ── Details form ──
  const detailsForm = useForm<DetailsValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues: { industries: [], size: undefined },
    mode: "onTouched",
  });
  const dw = detailsForm.watch();

  // ── Social form ──
  const socialForm = useForm<SocialValues>({
    resolver: zodResolver(socialSchema),
    defaultValues: { LinkedIn: "", Twitter: "", Website: "", GitHub: "", Portfolio: "" },
    mode: "onTouched",
  });

  // ── Prefill all forms once user data loads ──
  useEffect(() => {
    if (!user) return;
    const m = (user.Meta as CompanyMeta) ?? null;
    const safeIndustries: string[] = Array.isArray(m?.Industry) ? (m!.Industry as string[]) : [];

    basicForm.reset({
      name:     user.Name     ?? "",
      phone:    user.Phone    ?? "",
      location: m?.Location   ?? "",
      website:  m?.Website    ?? "",
      about:    m?.Bio        ?? "",
    });

    detailsForm.reset({
      industries: safeIndustries,
      size:       m?.Size ?? undefined,
    });

    socialForm.reset({
      LinkedIn:  m?.SocialLinks?.LinkedIn  ?? "",
      Twitter:   m?.SocialLinks?.Twitter   ?? "",
      Website:   m?.SocialLinks?.Website   ?? "",
      GitHub:    m?.SocialLinks?.GitHub    ?? "",
      Portfolio: m?.SocialLinks?.Portfolio ?? "",
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const toggleIndustry = (ind: string) => {
    const cur: string[] = Array.isArray(dw.industries) ? dw.industries : [];
    detailsForm.setValue(
      "industries",
      cur.includes(ind) ? cur.filter(i => i !== ind) : [...cur, ind],
      { shouldValidate: true },
    );
  };

  // ── Submit: basic info ──
  // ── Helper: merge partial changes onto the full existing meta so no
  //    fields get wiped. The DB stores the entire meta object in one
  //    JSONB cell, so every write must include ALL fields.
  // Spread the full existing meta before applying the patch so no fields
  // are wiped — the DB stores everything in one JSONB cell.
  const buildMeta = (patch: Partial<UpdateCompanyMetaDTO>): UpdateCompanyMetaDTO => ({
    AvatarUrl:   meta?.AvatarUrl,
    Location:    meta?.Location,
    Bio:         meta?.Bio,
    Website:     meta?.Website,
    // Industry is string[] in DB but typed string in DTO — cast to any
    Industry:    (meta?.Industry ?? []) as any,
    Size:        meta?.Size,
    SocialLinks: meta?.SocialLinks ? { ...meta.SocialLinks } : undefined,
    ...patch,
  });

  const handleBasicSave = async (v: BasicValues) => {
    await updateMeta(
      {
        name: v.name,
        phone: Number(v.phone),
        meta: buildMeta({ Location: v.location, Bio: v.about, Website: v.website || undefined }),
      },
      { onSuccess: () => { close(); basicForm.reset(v); } },
    );
  };

  // ── Submit: details ──
  const handleDetailsSave = async (v: DetailsValues) => {
    const safeIndustries: string[] = Array.isArray(v.industries) ? v.industries : [];
    await updateMeta(
      {
        name,
        phone: Number(phone),
        meta: buildMeta({ Industry: safeIndustries as any, Size: v.size as CompanySize }),
      },
      { onSuccess: () => { close(); detailsForm.reset(v); } },
    );
  };

  // ── Submit: social links ──
  const handleSocialSave = async (v: SocialValues) => {
    await updateMeta(
      {
        name,
        phone: Number(phone),
        meta: buildMeta({
          SocialLinks: {
            LinkedIn:  v.LinkedIn  || undefined,
            Twitter:   v.Twitter   || undefined,
            Website:   v.Website   || undefined,
            GitHub:    v.GitHub    || undefined,
            Portfolio: v.Portfolio || undefined,
          },
        }),
      },
      { onSuccess: () => { close(); socialForm.reset(v); } },
    );
  };

  // ── Submit: logo upload ──
  const handleLogoUpload = async (file: File) => {
    const userId = user?.Id;
    if (!userId) return;
    setLogoPreview(URL.createObjectURL(file));
    const avatarUrl = await uploadImage({ file, userId });
    if (avatarUrl) {
      await updateMeta(
        { name, phone: Number(phone), meta: buildMeta({ AvatarUrl: avatarUrl }) },
        { onSuccess: () => close() },
      );
    } else {
      close();
    }
  };

  return (
    <>
      <SavingOverlay visible={isSubmitting} />

      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="flex gap-6 items-start">

          {/* ── Main column ── */}
          <div className="flex-1 space-y-5 min-w-0">

            {/* ── Cover + logo hero ── */}
            <div className="bg-card rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Cover gradient */}
              <div className="h-28 bg-gradient-to-br from-primary/100 via-primary to-purple-700 relative">
                <div className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 25% 60%, white 1.5px, transparent 1.5px), radial-gradient(circle at 75% 30%, white 1.5px, transparent 1.5px)",
                    backgroundSize: "28px 28px",
                  }}
                />
              </div>

              <div className="px-6 pb-6">
                {/* Logo row */}
                <div className="flex items-end justify-between -mt-10 mb-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg bg-card flex items-center justify-center overflow-hidden">
                      {logoUrl ? (
                        <Image src={logoUrl} alt={name} width={80} height={80}
                          className="w-full h-full object-contain" />
                      ) : (
                        <Building2 className="text-primary/40" size={32} />
                      )}
                    </div>
                    {/* Camera button */}
                    <button
                      onClick={() => setModal("logo")}
                      className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-sm hover:bg-primary/90 transition-colors"
                    >
                      <Camera size={11} className="text-primary-foreground" />
                    </button>
                  </div>

                  <Button
                    onClick={() => setModal("basic")}
                    variant="outline"
                    className="h-8 px-4 text-xs rounded-xl border-border text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/10 transition-all flex items-center gap-1.5"
                  >
                    <Pencil size={12} /> Edit profile
                  </Button>
                </div>

                {/* Name + badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-foreground">
                    {name || "Your Company"}
                  </h1>
                  {verified ? (
                    <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full font-medium">
                      <BadgeCheck size={11} /> Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs bg-orange-50 text-orange-500 border border-orange-100 px-2 py-0.5 rounded-full font-medium">
                      <AlertCircle size={11} /> Pending verification
                    </span>
                  )}
                </div>

                {/* Meta chips */}
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  {location && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin size={11} className="text-muted-foreground/80" /> {location}
                    </div>
                  )}
                  {website && (
                    <Link href={website} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-primary hover:underline">
                      <Globe size={11} /> Website
                    </Link>
                  )}
                  {sizeEntry && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users size={11} className="text-muted-foreground/80" /> {sizeEntry.label} employees
                    </div>
                  )}
                </div>

                {/* About */}
                <div className="mt-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">About</p>
                  {bio ? (
                    <p className="text-sm text-muted-foreground leading-relaxed">{bio}</p>
                  ) : (
                    <button onClick={() => setModal("basic")} className="text-xs text-primary/100 hover:underline">
                      + Add company description
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ── Industry & details ── */}
            <div className="bg-card rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Layers size={15} className="text-primary/100" />
                  <h2 className="text-sm font-semibold text-foreground/90">Industry & details</h2>
                </div>
                <button onClick={() => setModal("details")}
                  className="text-xs text-primary hover:underline font-medium flex items-center gap-1">
                  <Pencil size={12} /> Edit
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <p className="text-xs text-muted-foreground/80 mb-2">Industries</p>
                  {industries.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {industries.map((ind: string) => (
                        <span key={ind}
                          className="text-xs bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-full font-medium">
                          {ind}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <button onClick={() => setModal("details")} className="text-xs text-primary/100 hover:underline">
                      + Add industry
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <InfoRow
                    label="Company size"
                    value={sizeEntry ? `${sizeEntry.label} (${sizeEntry.sub})` : undefined}
                    onAdd={() => setModal("details")}
                  />
                  <InfoRow label="Contact number" value={phone || undefined} onAdd={() => setModal("basic")} />
                  <InfoRow label="Email" value={email} />
                </div>
              </div>
            </div>

            {/* ── Social links ── */}
            <div className="bg-card rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <LinkIcon size={15} className="text-primary/100" />
                  <h2 className="text-sm font-semibold text-foreground/90">Social links</h2>
                </div>
                <button onClick={() => setModal("social")}
                  className="text-xs text-primary hover:underline font-medium flex items-center gap-1">
                  <Pencil size={12} /> Edit
                </button>
              </div>

              <div className="space-y-3">
                {SOCIAL_FIELDS.map(({ label, icon, color }) => {
                  const val = meta?.SocialLinks?.[label as keyof typeof meta.SocialLinks];
                  return (
                    <div key={label} className="flex items-center gap-3">
                      <div className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0",
                        color,
                      )}>
                        {icon}
                      </div>
                      {val ? (
                        <a href={val} target="_blank" rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline truncate">
                          {val.replace(/^https?:\/\//, "")}
                        </a>
                      ) : (
                        <button onClick={() => setModal("social")}
                          className="text-xs text-muted-foreground/80 hover:text-primary/100 transition-colors">
                          + Add {label}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Right sidebar ── */}
          <aside className="hidden xl:flex flex-col gap-4 w-64 shrink-0">
            <ProfileStrength name={name} meta={meta} />

            {!verified && (
              <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BadgeCheck size={14} className="text-blue-500" />
                  <p className="text-xs font-semibold text-blue-700">Get verified</p>
                </div>
                <p className="text-xs text-blue-600 leading-relaxed mb-3">
                  Verified companies get 5× more applications and a trust badge on all job posts.
                </p>
                <Button className="w-full h-8 bg-blue-600 hover:bg-blue-700 text-primary-foreground rounded-xl text-xs font-semibold">
                  Request verification
                </Button>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* ════════════ MODALS ════════════ */}

      {/* ── Basic info modal ── */}
      <Modal open={modal === "basic"} onClose={close} title="Edit company info">
        <form className="space-y-4"
          onSubmit={basicForm.handleSubmit(handleBasicSave)}>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Company name</Label>
            <Input {...basicForm.register("name")}
              className="h-10 text-sm rounded-xl border-border bg-muted/50 focus:bg-card" />
            <FieldError message={basicForm.formState.errors.name?.message} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Phone</Label>
              <Input {...basicForm.register("phone")}
                className="h-10 text-sm rounded-xl border-border bg-muted/50 focus:bg-card" />
              <FieldError message={basicForm.formState.errors.phone?.message} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Location</Label>
              <Input {...basicForm.register("location")} placeholder="Bengaluru, KA"
                className="h-10 text-sm rounded-xl border-border bg-muted/50 focus:bg-card" />
              <FieldError message={basicForm.formState.errors.location?.message} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Website</Label>
            <Input {...basicForm.register("website")} type="url" placeholder="https://yourcompany.com"
              className="h-10 text-sm rounded-xl border-border bg-muted/50 focus:bg-card" />
            <FieldError message={basicForm.formState.errors.website?.message} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">About</Label>
            <Textarea {...basicForm.register("about")} rows={4}
              placeholder="Describe your company..."
              className="text-sm rounded-xl border-border bg-muted/50 focus:bg-card resize-none" />
            <div className="flex items-center justify-between">
              <FieldError message={basicForm.formState.errors.about?.message} />
              <span className="text-xs text-muted-foreground/80 ml-auto">
                {basicForm.watch("about")?.length ?? 0}/600
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={close}
              className="flex-1 h-10 rounded-xl border-border text-sm">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}
              className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm disabled:opacity-70 flex items-center justify-center gap-2">
              {isSubmitting
                ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
                : "Save changes"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Details modal ── */}
      <Modal open={modal === "details"} onClose={close} title="Industry & details">
        <form className="space-y-5"
          onSubmit={detailsForm.handleSubmit(handleDetailsSave)}>

          {/* Industries */}
          <div className="space-y-2.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Industries</Label>
            {(Array.isArray(dw.industries) ? dw.industries : []).length > 0 && (
              <div className="flex flex-wrap gap-1.5 px-3 py-2 rounded-xl border border-primary/30 bg-primary/10/50">
                {(Array.isArray(dw.industries) ? dw.industries : []).map((i: string) => (
                  <span key={i}
                    className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-xs px-2.5 py-1 rounded-full font-medium">
                    {i}
                    <button type="button" onClick={() => toggleIndustry(i)}>
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-1.5">
              {INDUSTRIES.filter(i => !(Array.isArray(dw.industries) ? dw.industries : []).includes(i)).map(ind => (
                <button key={ind} type="button" onClick={() => toggleIndustry(ind)}
                  className="text-xs px-3 py-1.5 rounded-full border border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/10 transition-all flex items-center gap-1">
                  <Plus size={10} /> {ind}
                </button>
              ))}
            </div>
            <FieldError message={detailsForm.formState.errors.industries?.message} />
          </div>

          {/* Company size */}
          <div className="space-y-2.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Company size</Label>
            <div className="grid grid-cols-3 gap-2">
              {COMPANY_SIZES.map(({ label, sub, value }) => (
                <button key={value} type="button"
                  onClick={() => detailsForm.setValue("size", value, { shouldValidate: true })}
                  className={cn(
                    "flex flex-col items-center py-2.5 rounded-xl border text-center transition-all",
                    dw.size === value
                      ? "border-primary/100 bg-primary/10 shadow-sm shadow-primary/20"
                      : "border-border bg-muted/50 hover:border-primary/30 hover:bg-primary/10/40",
                  )}>
                  <span className={cn("text-xs font-bold", dw.size === value ? "text-primary/90" : "text-foreground/80")}>
                    {label}
                  </span>
                  <span className="text-xs text-muted-foreground/80 mt-0.5">{sub}</span>
                </button>
              ))}
            </div>
            <FieldError message={detailsForm.formState.errors.size?.message} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={close}
              className="flex-1 h-10 rounded-xl border-border text-sm">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}
              className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm disabled:opacity-70 flex items-center justify-center gap-2">
              {isSubmitting
                ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
                : "Save changes"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Social links modal ── */}
      <Modal open={modal === "social"} onClose={close} title="Social links">
        <form className="space-y-4"
          onSubmit={socialForm.handleSubmit(handleSocialSave)}>
          {SOCIAL_FIELDS.map(({ label, icon, color, placeholder }) => (
            <div key={label} className="flex items-center gap-3">
              <div className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0",
                color,
              )}>
                {icon}
              </div>
              <div className="flex-1">
                <Input type="url" placeholder={placeholder}
                  {...socialForm.register(label as keyof SocialValues)}
                  className={cn(
                    "h-10 text-sm rounded-xl border-border bg-muted/50 focus:bg-card transition-all",
                    socialForm.formState.errors[label as keyof SocialValues] && "border-red-300",
                  )}
                />
                <FieldError message={socialForm.formState.errors[label as keyof SocialValues]?.message} />
              </div>
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={close}
              className="flex-1 h-10 rounded-xl border-border text-sm">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}
              className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm disabled:opacity-70 flex items-center justify-center gap-2">
              {isSubmitting
                ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
                : "Save changes"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Logo modal ── */}
      <Modal open={modal === "logo"} onClose={close} title="Update company logo">
        <div className="space-y-4">
          {/* Drop zone */}
          <div
            onClick={() => logoInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border py-10 cursor-pointer hover:border-primary/40 hover:bg-primary/10/30 transition-all relative"
          >
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async e => {
                const file = e.target.files?.[0];
                if (file) await handleLogoUpload(file);
              }}
            />
            {logoPreview ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-2xl border border-primary/20 bg-card overflow-hidden shadow-sm flex items-center justify-center">
                  <img src={logoPreview} alt="Preview" className="w-full h-full object-contain" />
                </div>
                <p className="text-xs text-primary font-medium">Click to change</p>
              </div>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <ImageIcon className="text-primary" size={24} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground/80">Click to upload logo</p>
                  <p className="text-xs text-muted-foreground/80 mt-0.5">PNG · JPG · SVG — Recommended 400×400px</p>
                </div>
              </>
            )}
          </div>

          {isUploading && (
            <div className="flex items-center justify-center gap-2 text-xs text-primary">
              <Loader2 size={13} className="animate-spin" /> Uploading…
            </div>
          )}

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={close}
              className="flex-1 h-10 rounded-xl border-border text-sm">
              Cancel
            </Button>
            <Button
              disabled={!logoPreview || isSubmitting}
              onClick={async () => {
                if (logoInputRef.current?.files?.[0]) {
                  await handleLogoUpload(logoInputRef.current.files[0]);
                }
              }}
              className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-2">
              {isUploading
                ? <><Loader2 size={14} className="animate-spin" /> Uploading…</>
                : "Save logo"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}