import {
  SKILL_SUGGESTIONS,
  GRADING_OPTIONS,
} from "@/constants/student/SOnboardingConstants";
import { cn } from "@/lib/utils";
import { X, Plus, Check } from "lucide-react";
import { useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-red-500 mt-1">{message}</p>;
}

export function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-7">
      <h2 className="text-xl font-bold text-foreground tracking-tight">
        {title}
      </h2>
      <p className="text-muted-foreground/80 text-sm mt-1">{subtitle}</p>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="mb-7">
        <div className="h-6 bg-gray-200 rounded-lg w-40 mb-2" />
        <div className="h-4 bg-muted rounded w-64" />
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-1.5">
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-10 bg-muted rounded-xl" />
        </div>
      ))}
      <div className="h-11 bg-primary/20 rounded-xl mt-4" />
    </div>
  );
}

export function TagSelector({
  label,
  required,
  options,
  value,
  onChange,
  error,
  single = true,
}: {
  label: string;
  required?: boolean;
  options: string[];
  value: string | string[];
  onChange: (v: string | string[]) => void;
  error?: string;
  single?: boolean;
}) {
  const selected = Array.isArray(value) ? value : value ? [value] : [];

  const toggle = (opt: string) => {
    if (single) {
      onChange(selected[0] === opt ? "" : opt);
    } else {
      onChange(
        selected.includes(opt)
          ? selected.filter((s) => s !== opt)
          : [...selected, opt],
      );
    }
  };

  return (
    <div className="space-y-2.5">
      <Label className="text-sm font-medium text-foreground/80">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>

      <div
        className={cn(
          "min-h-[42px] flex flex-wrap gap-1.5 px-3 py-2 rounded-xl border bg-muted/50/80 transition-all",
          error ? "border-red-300" : "border-gray-200",
          selected.length > 0 && "bg-card",
        )}
      >
        {selected.length === 0 ? (
          <span className="text-muted-foreground/80 text-sm self-center">
            Select {label.toLowerCase()}
          </span>
        ) : (
          selected.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1 bg-gray-900 text-primary-foreground text-xs px-2.5 py-1 rounded-full font-medium"
            >
              {s}
              <button
                type="button"
                onClick={() => toggle(s)}
                className="hover:text-gray-300 transition-colors"
              >
                <X size={11} />
              </button>
            </span>
          ))
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {options
          .filter((o) => !selected.includes(o))
          .map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-gray-200 bg-card text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/10 transition-all"
            >
              {opt}
              {!single && <Plus size={11} />}
            </button>
          ))}
      </div>
      <FieldError message={error} />
    </div>
  );
}

export function SkillInput({
  value,
  onChange,
  error,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  error?: string;
}) {
  const [input, setInput] = useState("");

  const add = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !value.includes(trimmed)) onChange([...value, trimmed]);
    setInput("");
  };

  const remove = (skill: string) => onChange(value.filter((s) => s !== skill));

  return (
    <div className="space-y-2.5">
      <Label className="text-sm font-medium text-foreground/80">
        Key skills<span className="text-red-500 ml-0.5">*</span>
      </Label>

      <div
        className={cn(
          "min-h-[90px] rounded-xl border p-3 bg-muted/50/80 focus-within:bg-card focus-within:border-primary transition-all",
          error ? "border-red-300" : "border-gray-200",
        )}
      >
        <div className="flex flex-wrap gap-1.5 mb-2">
          {value.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1 bg-primary/20 text-primary/90 text-xs px-2.5 py-1 rounded-full font-medium"
            >
              {s}
              <button
                type="button"
                onClick={() => remove(s)}
                className="hover:text-violet-900"
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(input);
            }
          }}
          placeholder={
            value.length === 0
              ? "Key skills are crucial for recruiters to hire you"
              : "Add more skills..."
          }
          className="w-full bg-transparent text-sm text-foreground/80 placeholder:text-muted-foreground/80 outline-none"
        />
      </div>
      <p className="text-xs text-muted-foreground/80">
        Recruiters look for candidates with specific key skills
      </p>

      <div>
        <p className="text-xs text-muted-foreground/80 mb-2">Suggestions:</p>
        <div className="flex flex-wrap gap-2">
          {SKILL_SUGGESTIONS.filter((s) => !value.includes(s)).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-gray-200 bg-card text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/10 transition-all"
            >
              {s} <Plus size={11} />
            </button>
          ))}
        </div>
      </div>
      <FieldError message={error} />
    </div>
  );
}

export function YearPicker({
  label,
  required,
  years,
  value,
  onChange,
  placeholder,
  error,
}: {
  label: string;
  required?: boolean;
  years: number[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
}) {
  return (
    <div className="space-y-2.5">
      <Label className="text-sm font-medium text-foreground/80">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      <Input
        type="number"
        placeholder={placeholder ?? "Eg. 2026"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-10 rounded-xl border-gray-200 bg-muted/50/80 focus:bg-card text-sm transition-all",
          error && "border-red-300",
        )}
      />
      <div className="flex flex-wrap gap-2">
        {years.map((y) => (
          <button
            key={y}
            type="button"
            onClick={() => onChange(String(y))}
            className={cn(
              "text-xs px-3 py-1.5 rounded-full border transition-all",
              value === String(y)
                ? "bg-gray-900 text-primary-foreground border-gray-900"
                : "border-gray-200 bg-card text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/10",
            )}
          >
            {y}
          </button>
        ))}
      </div>
      <FieldError message={error} />
    </div>
  );
}

export function GradingSelector({
  value,
  onChange,
  error,
}: {
  value: number | undefined;
  onChange: (v: number) => void;
  error?: string;
}) {
  const selected = GRADING_OPTIONS.find((g) => g.value === value);

  return (
    <div className="space-y-2.5">
      <Label className="text-sm font-medium text-foreground/80">
        Grading System<span className="text-red-500 ml-0.5">*</span>
      </Label>

      <div
        className={cn(
          "min-h-[42px] flex flex-wrap gap-1.5 px-3 py-2 rounded-xl border bg-muted/50/80 transition-all",
          error ? "border-red-300" : "border-gray-200",
          selected && "bg-card",
        )}
      >
        {!selected ? (
          <span className="text-muted-foreground/80 text-sm self-center">
            Select grading system
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 bg-gray-900 text-primary-foreground text-xs px-2.5 py-1 rounded-full font-medium">
            {selected.label}
            <button
              type="button"
              onClick={() => onChange(-1)}
              className="hover:text-gray-300"
            >
              <X size={11} />
            </button>
          </span>
        )}
      </div>

      <p className="text-xs text-muted-foreground/80">Suggestions</p>
      <div className="flex flex-wrap gap-2">
        {GRADING_OPTIONS.filter((g) => g.value !== value).map((g) => (
          <button
            key={g.value}
            type="button"
            onClick={() => onChange(g.value)}
            className="text-xs px-3 py-1.5 rounded-full border border-gray-200 bg-card text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/10 transition-all"
          >
            {g.label}
          </button>
        ))}
      </div>
      <FieldError message={error} />
    </div>
  );
}

export function PillButton({
  label,
  selected,
  onClick,
  icon,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all duration-150 font-medium",
        selected
          ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/30"
          : "border-gray-200 bg-card text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/10",
      )}
    >
      {selected && <Check size={11} strokeWidth={3} />}
      {!selected && icon}
      {label}
    </button>
  );
}

export function GoogleIcon() {
  return (
    <svg
      className="w-4 h-4 shrink-0"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
