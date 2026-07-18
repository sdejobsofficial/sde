"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  MapPin,
  Globe,
  X,
  Plus,
  ArrowRight,
  ArrowLeft,
  Building2,
  Sparkles,
  Phone,
  Check,
  ChevronRight,
  ImageIcon,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUpdateCompanyMeta, useCurrentUser } from "@/hooks/useUser";
import { useImageUpload } from "@/hooks/useUpload";
import { FieldError, PillButton } from "@/components/common/FormComponents";
import {
  InfoValues,
  infoSchema,
  DetailsValues,
  detailsSchema,
  INDUSTRIES,
  COMPANY_SIZES,
  HIRING_TYPES,
  BrandValues,
  brandSchema,
  SOCIAL_FIELDS,
  STEPS,
} from "@/constants/company/COnboardingConstants";
import type { CompanyUser } from "@/models/userModel";
import { useRouter } from "next/navigation";
import Image from "next/image";

// ─── Step 1: Company Info ─────────────────────────────────────────────────

function InfoStep({
  onNext,
  defaultValues,
}: {
  onNext: (d: InfoValues) => void;
  defaultValues?: Partial<InfoValues>;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InfoValues>({
    resolver: zodResolver(infoSchema),
    defaultValues: defaultValues ?? {},
    mode: "onTouched",
  });

  const seeded = useRef(false);
  useEffect(() => {
    if (!seeded.current && defaultValues?.companyName) {
      reset(defaultValues);
      seeded.current = true;
    }
  }, [defaultValues?.companyName]);

  return (
    <form
      onSubmit={handleSubmit(onNext)}
      className="space-y-5 h-full flex flex-col"
    >
      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {/* Company name */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Company name <span className="text-red-400">*</span>
          </Label>
          <div className="relative">
            <Building2
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 pointer-events-none"
              size={14}
            />
            <Input
              placeholder="Acme Corp"
              {...register("companyName")}
              readOnly
              className={cn(
                "pl-9 h-10 text-sm rounded-xl border-border bg-muted/50 focus:bg-card focus:border-primary transition-all",
                errors.companyName && "border-red-300",
              )}
            />
          </div>
          <FieldError message={errors.companyName?.message} />
        </div>

        {/* Phone + Location */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Contact no. <span className="text-red-400">*</span>
            </Label>
            <div className="flex gap-2">
              <div className="h-10 px-2.5 flex items-center border border-border bg-muted/50 rounded-xl text-xs text-muted-foreground font-medium flex-shrink-0 gap-1 select-none">
                <Phone size={11} className="text-muted-foreground/80" /> +91
              </div>
              <Input
                type="tel"
                placeholder="10 digits"
                maxLength={10}
                readOnly
                {...register("phone")}
                className={cn(
                  "h-10 text-sm rounded-xl border-border bg-muted/50 focus:bg-card focus:border-primary transition-all",
                  errors.phone && "border-red-300",
                )}
              />
            </div>
            <FieldError message={errors.phone?.message} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Headquarters <span className="text-red-400">*</span>
            </Label>
            <div className="relative">
              <MapPin
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 pointer-events-none"
                size={14}
              />
              <Input
                placeholder="Bengaluru, KA"
                {...register("location")}
                className={cn(
                  "pl-9 h-10 text-sm rounded-xl border-border bg-muted/50 focus:bg-card focus:border-primary transition-all",
                  errors.location && "border-red-300",
                )}
              />
            </div>
            <FieldError message={errors.location?.message} />
          </div>
        </div>

        {/* Website */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Company website{" "}
            <span className="text-muted-foreground/80 font-normal normal-case text-xs">
              (optional)
            </span>
          </Label>
          <div className="relative">
            <Globe
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 pointer-events-none"
              size={14}
            />
            <Input
              type="url"
              placeholder="https://yourcompany.com"
              {...register("website")}
              className={cn(
                "pl-9 h-10 text-sm rounded-xl border-border bg-muted/50 focus:bg-card focus:border-primary transition-all",
                errors.website && "border-red-300",
              )}
            />
          </div>
          <FieldError message={errors.website?.message} />
        </div>

        {/* About */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            About the company <span className="text-red-400">*</span>
          </Label>
          <Textarea
            placeholder="Tell job seekers about your company — your mission, culture, what you build and what makes you a great place to work..."
            {...register("about")}
            rows={4}
            className={cn(
              "text-sm rounded-xl border-border bg-muted/50 focus:bg-card focus:border-primary resize-none transition-all",
              errors.about && "border-red-300",
            )}
          />
          <FieldError message={errors.about?.message} />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-md shadow-primary/30 transition-all flex-shrink-0"
      >
        Continue <ArrowRight size={15} />
      </Button>
    </form>
  );
}

// ─── Step 2: Company Details ──────────────────────────────────────────────

function DetailsStep({
  onNext,
  onBack,
  defaultValues,
}: {
  onNext: (d: DetailsValues) => void;
  onBack: () => void;
  defaultValues?: Partial<DetailsValues>;
}) {
  const {
    handleSubmit,
    setValue,
    watch,
    register,
    formState: { errors },
  } = useForm<DetailsValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues: { industries: [], hiringFor: [], ...defaultValues },
    mode: "onTouched",
  });
  const w = watch();

  const toggleArr = (field: "industries" | "hiringFor", val: string) => {
    const cur: string[] = w[field] ?? [];
    setValue(
      field,
      cur.includes(val) ? cur.filter((v) => v !== val) : [...cur, val],
      { shouldValidate: true },
    );
  };

  return (
    <form
      onSubmit={handleSubmit(onNext)}
      className="space-y-5 h-full flex flex-col"
    >
      <div className="flex-1 space-y-5 overflow-y-auto pr-1">
        {/* Industry */}
        <div className="space-y-2.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Industry / Domain <span className="text-red-400">*</span>
          </Label>
          {(w.industries ?? []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 px-3 py-2 rounded-xl border border-primary/30 bg-primary/10/60">
              {(w.industries ?? []).map((i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-xs px-2.5 py-1 rounded-full font-medium"
                >
                  {i}
                  <button
                    type="button"
                    onClick={() => toggleArr("industries", i)}
                    className="hover:text-primary/30"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-1.5">
            {INDUSTRIES.filter((i) => !(w.industries ?? []).includes(i)).map(
              (i) => (
                <PillButton
                  key={i}
                  label={i}
                  selected={false}
                  onClick={() => toggleArr("industries", i)}
                  icon={<Plus size={10} />}
                />
              ),
            )}
          </div>
          <FieldError message={errors.industries?.message} />
        </div>

        {/* Company size */}
        <div className="space-y-2.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Company size <span className="text-red-400">*</span>
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {COMPANY_SIZES.map(({ label, sub, value }) => (
              <button
                key={value}
                type="button"
                onClick={() =>
                  setValue("size", value, { shouldValidate: true })
                }
                className={cn(
                  "flex flex-col items-center py-3 rounded-xl border text-center transition-all duration-150",
                  w.size === value
                    ? "border-primary/100 bg-primary/10 shadow-sm shadow-primary/20"
                    : "border-border bg-muted/50/80 hover:border-primary/30 hover:bg-primary/10/30",
                )}
              >
                <span
                  className={cn(
                    "text-sm font-bold",
                    w.size === value ? "text-primary/90" : "text-foreground/90",
                  )}
                >
                  {label}
                </span>
                <span className="text-xs text-muted-foreground/80 mt-0.5">{sub}</span>
              </button>
            ))}
          </div>
          <FieldError message={errors.size?.message} />
        </div>

        {/* Hiring for */}
        <div className="space-y-2.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Hiring for <span className="text-red-400">*</span>
          </Label>
          <div className="flex flex-wrap gap-1.5">
            {HIRING_TYPES.map((h) => (
              <PillButton
                key={h}
                label={h}
                selected={(w.hiringFor ?? []).includes(h)}
                onClick={() => toggleArr("hiringFor", h)}
              />
            ))}
          </div>
          <FieldError message={errors.hiringFor?.message} />
        </div>

        {/* Founded */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Founded year{" "}
            <span className="text-muted-foreground/80 font-normal normal-case text-xs">
              (optional)
            </span>
          </Label>
          <Input
            type="number"
            placeholder="e.g. 2015"
            {...register("founded")}
            className="h-10 text-sm rounded-xl border-border bg-muted/50 focus:bg-card focus:border-primary transition-all w-36"
          />
        </div>
      </div>

      <div className="flex gap-3 flex-shrink-0">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1 h-11 rounded-xl border-border text-muted-foreground text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-muted/50 transition-all"
        >
          <ArrowLeft size={14} /> Back
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

// ─── Step 3: Brand & Social ───────────────────────────────────────────────

function BrandStep({
  onSubmit: onDone,
  onBack,
  loading,
  // logoFile: the raw File for upload; logoPreview: local blob URL for display
  logoFile,
  logoPreview,
  onLogoChange,
}: {
  onSubmit: (d: BrandValues) => void;
  onBack: () => void;
  loading?: boolean;
  logoFile: File | null;
  logoPreview: string | null;
  onLogoChange: (file: File) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BrandValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: { linkedin: "", twitter: "", website: "" },
    mode: "onTouched",
  });
  const w = watch();

  const handleFileSelect = (f: File) => {
    if (f.type.startsWith("image/")) onLogoChange(f);
  };

  return (
    <form
      onSubmit={handleSubmit(onDone)}
      className="space-y-5 h-full flex flex-col"
    >
      <div className="flex-1 space-y-5 overflow-y-auto pr-1">
        {/* Logo */}
        <div className="space-y-2.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Company logo{" "}
            <span className="text-muted-foreground/80 font-normal normal-case text-xs">
              (recommended 400×400)
            </span>
          </Label>

          {!logoPreview ? (
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
                if (f) handleFileSelect(f);
              }}
              onClick={() => fileRef.current?.click()}
              className={cn(
                "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-8 cursor-pointer transition-all",
                dragOver
                  ? "border-primary bg-primary/10"
                  : "border-border bg-muted/50 hover:border-primary/40 hover:bg-primary/10/30",
              )}
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileSelect(f);
                }}
              />
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                <ImageIcon className="text-primary" size={22} />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground/80">
                  Drag & drop or click to upload
                </p>
                <p className="text-xs text-muted-foreground/80 mt-0.5">
                  PNG · JPG · SVG — Max 2MB
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 p-4 rounded-2xl border border-primary/30 bg-primary/10/40">
              <div className="w-16 h-16 rounded-xl border border-primary/20 bg-card overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground/90">
                  Logo ready to upload
                </p>
                <p className="text-xs text-muted-foreground/80 mt-0.5">
                  {logoFile
                    ? `${(logoFile.size / 1024).toFixed(0)} KB · ${logoFile.type.split("/")[1].toUpperCase()}`
                    : "Looking great!"}
                </p>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="text-xs text-primary hover:underline mt-1 transition-colors"
                >
                  Change logo
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileSelect(f);
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Social links */}
        <div className="space-y-3">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Social links{" "}
            <span className="text-muted-foreground/80 font-normal normal-case text-xs">
              (optional)
            </span>
          </Label>
          {SOCIAL_FIELDS.map(({ name, label, icon, color, placeholder }) => (
            <div key={name} className="flex items-center gap-3">
              <div
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0",
                  color,
                )}
              >
                {icon}
              </div>
              <div className="flex-1 relative">
                <Input
                  type="url"
                  placeholder={placeholder}
                  {...register(name)}
                  className={cn(
                    "h-10 text-sm rounded-xl border-border bg-muted/50 focus:bg-card focus:border-primary pr-8 transition-all",
                    errors[name] && "border-red-300",
                  )}
                />
                {w[name] && (
                  <button
                    type="button"
                    onClick={() => setValue(name, "")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-muted-foreground transition-colors"
                  >
                    <X size={12} />
                  </button>
                )}
                <FieldError message={errors[name]?.message} />
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground/80 bg-muted/50 rounded-xl px-4 py-3 border border-gray-100">
          💡 You can update your logo and links anytime from your company
          settings.
        </p>
      </div>

      <div className="flex gap-3 flex-shrink-0">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={loading}
          className="flex-1 h-11 rounded-xl border-border text-muted-foreground text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-muted/50 transition-all disabled:opacity-50"
        >
          <ArrowLeft size={14} /> Back
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="flex-[2] h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-md shadow-primary/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="animate-spin h-4 w-4" />
              {/* Label changes based on which async step is running — parent controls `loading` */}
              Finishing up...
            </span>
          ) : (
            <>
              <Sparkles size={14} /> Complete setup
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────

export default function CompanyOnboardingPage() {
  const { data: user } = useCurrentUser();
  const router = useRouter();
  const { mutateAsync: updateCompanyMeta, isPending: isSaving } =
    useUpdateCompanyMeta();
  const { mutateAsync: uploadImage, isPending: isUploading } = useImageUpload();

  const [step, setStep] = useState(0);
  const [infoData, setInfoData] = useState<Partial<InfoValues>>({});
  const [detailsData, setDetailsData] = useState<Partial<DetailsValues>>({});

  // Keep both the raw File (for upload) and the object URL (for preview) separate
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const company = user as CompanyUser | undefined;

  const handleLogoChange = (file: File) => {
    setLogoFile(file);
    // Create a local object URL just for preview — never stored in DB
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleInfoNext = (data: InfoValues) => {
    setInfoData(data);
    setStep(1);
  };

  const handleDetailsNext = (data: DetailsValues) => {
    setDetailsData(data);
    setStep(2);
  };

  const handleBrandSubmit = async (data: BrandValues) => {
    const userId = company?.Id;
    if (!userId) return;

    // ── 1. Upload logo if one was selected, otherwise no avatar ──
    let avatarUrl: string | undefined;
    if (logoFile) {
      avatarUrl = await uploadImage({ file: logoFile, userId });
    }

    // ── 2. Save all company meta with the real uploaded URL ──
    await updateCompanyMeta({
      name: infoData.companyName ?? "",
      phone: Number(infoData.phone),
      meta: {
        ...infoData,
        ...detailsData,
        SocialLinks: {
          LinkedIn: data.linkedin || undefined,
          Twitter: data.twitter || undefined,
          Website: data.website || undefined,
        },
        // Only set AvatarUrl if we actually uploaded something;
        // if no logo was chosen, omit so existing value isn't overwritten
        ...(avatarUrl ? { AvatarUrl: avatarUrl } : {}),
      },
    });
    router.push("/recruiter/dashboard");
  };

  // Button is disabled during both upload and save
  const isSubmitting = isUploading || isSaving;

  return (
    <div className="min-h-screen bg-muted/50 flex flex-col">
      {/* ── Top bar ── */}
      <header className="bg-card border-b border-gray-100 px-6 lg:px-10 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
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
          <span className="ml-1 text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-medium">
            Company setup
          </span>
        </div>

        {/* Horizontal step pills */}
        <div className="hidden md:flex items-center gap-2">
          {STEPS.map((s, i) => {
            const done = i < step;
            const active = i === step;
            const Icon = s.icon;
            return (
              <div key={s.id} className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    active &&
                      "bg-primary text-primary-foreground shadow-sm shadow-primary/30",
                    done && "bg-primary/20 text-primary",
                    !active && !done && "text-muted-foreground/80",
                  )}
                >
                  {done ? (
                    <Check size={12} strokeWidth={3} />
                  ) : (
                    <Icon size={12} />
                  )}
                  {s.label}
                </div>
                {i < STEPS.length - 1 && (
                  <ChevronRight
                    size={13}
                    className={cn(done ? "text-primary/40" : "text-gray-200")}
                  />
                )}
              </div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground/80">
          Step {step + 1} of {STEPS.length}
        </p>
      </header>

      {/* ── Form panel ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-xl mx-auto px-6 py-8">
            {/* Step heading */}
            <div className="mb-7">
              {(() => {
                const s = STEPS[step];
                const Icon = s.icon;
                return (
                  <>
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full border border-primary/20 mb-3">
                      <Icon size={12} />
                      Step {step + 1} — {s.label}
                    </div>
                    <h2 className="text-2xl font-bold text-foreground tracking-tight">
                      {
                        [
                          "Tell us about your company",
                          "Company details",
                          "Brand & social links",
                        ][step]
                      }
                    </h2>
                    <p className="text-muted-foreground/80 text-sm mt-1">{s.desc}</p>
                  </>
                );
              })()}
            </div>

            {/* Progress bar */}
            <div className="w-full h-1 bg-muted rounded-full mb-7">
              <div
                className="h-full bg-primary/100 rounded-full transition-all duration-500"
                style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              />
            </div>

            {step === 0 && (
              <InfoStep
                onNext={handleInfoNext}
                defaultValues={{
                  companyName: company?.Name ?? "",
                  phone: company?.Phone?.replace(/^\+91/, "") ?? "",
                  ...infoData,
                }}
              />
            )}
            {step === 1 && (
              <DetailsStep
                onNext={handleDetailsNext}
                onBack={() => setStep(0)}
                defaultValues={detailsData}
              />
            )}
            {step === 2 && (
              <BrandStep
                onSubmit={handleBrandSubmit}
                onBack={() => setStep(1)}
                loading={isSubmitting}
                logoFile={logoFile}
                logoPreview={logoPreview}
                onLogoChange={handleLogoChange}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="bg-card border-t border-gray-100 py-4 text-center shrink-0">
        <p className="text-xs text-muted-foreground/80">
          © {new Date().getFullYear()} ReferNest · All rights reserved
        </p>
      </footer>
    </div>
  );
}
