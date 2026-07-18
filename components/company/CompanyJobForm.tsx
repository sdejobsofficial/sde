import { cn } from "@/lib/utils";
import { LucideIcon, X, Plus, Check } from "lucide-react";
import { useState } from "react";
import { Textarea } from "../ui/textarea";
import {
  SKILL_SUGGESTIONS,
  Step,
  STEPS,
} from "@/constants/company/CJobFormContants";


export function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      {subtitle && <p className="text-sm text-muted-foreground/80 mt-0.5">{subtitle}</p>}
    </div>
  );
}

export function PillSelector<T extends number>({
  options,
  value,
  onChange,
  cols = 3,
}: {
  options: { label: string; sub?: string; value: T; icon?: LucideIcon }[];
  value: T | undefined;
  onChange: (v: T) => void;
  cols?: number;
}) {
  return (
    <div className={cn("grid gap-2", `grid-cols-${cols}`)}>
      {options.map(({ label, sub, value: v, icon: Icon }) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={cn(
            "flex flex-col items-center py-2.5 px-2 rounded-xl border text-center transition-all duration-150",
            value === v
              ? "border-primary/100 bg-primary/10 shadow-sm shadow-primary/20"
              : "border-border bg-muted/50/80 hover:border-primary/30 hover:bg-primary/10/30",
          )}
        >
          {Icon && (
            <Icon
              size={14}
              className={cn(
                "mb-1",
                value === v ? "text-primary" : "text-muted-foreground/80",
              )}
            />
          )}
          <span
            className={cn(
              "text-xs font-semibold",
              value === v ? "text-primary/90" : "text-foreground/80",
            )}
          >
            {label}
          </span>
          {sub && <span className="text-xs text-muted-foreground/80 mt-0.5">{sub}</span>}
        </button>
      ))}
    </div>
  );
}

export function DescriptionEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-1 px-3 py-2 border border-border border-b-0 rounded-t-xl bg-muted/50">
        {["B", "I", "U"].map((f) => (
          <button
            key={f}
            type="button"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-muted-foreground hover:bg-gray-200 hover:text-foreground/90 transition-all"
          >
            {f}
          </button>
        ))}
        <div className="w-px h-4 bg-gray-200 mx-1" />
        {["H1", "H2", "•", "1."].map((f) => (
          <button
            key={f}
            type="button"
            className="px-2 h-7 rounded-lg text-xs font-medium text-muted-foreground hover:bg-gray-200 hover:text-foreground/90 transition-all"
          >
            {f}
          </button>
        ))}
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Describe the role, responsibilities, what a typical day looks like, and what success looks like in this position..."
        rows={7}
        className="rounded-t-none rounded-b-xl border-border bg-card resize-none text-sm focus:border-primary focus:ring-primary/20 transition-all"
      />
      <p className="text-xs text-muted-foreground/80 mt-1.5">
        Tip: Use headings and bullet points — well-formatted JDs get 2× more
        applications
      </p>
    </div>
  );
}

export function SkillInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [input, setInput] = useState("");
  const add = (s: string) => {
    const t = s.trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setInput("");
  };
  const remove = (s: string) => onChange(value.filter((x) => x !== s));

  return (
    <div className="space-y-2.5">
      <div className="min-h-[80px] rounded-xl border p-3 bg-muted/50/80 focus-within:bg-card focus-within:border-primary transition-all border-border">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {value.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1 bg-primary/20 text-primary/90 text-xs px-2.5 py-1 rounded-full font-medium"
            >
              {s}
              <button type="button" onClick={() => remove(s)}>
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
        <input
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
              ? "Type a skill and press Enter or comma..."
              : "Add more skills..."
          }
          className="w-full bg-transparent text-sm text-foreground/80 placeholder:text-muted-foreground/80 outline-none"
        />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {SKILL_SUGGESTIONS.filter((s) => !value.includes(s))
          .slice(0, 10)
          .map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="text-xs px-2.5 py-1 rounded-full border border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/10 transition-all flex items-center gap-1"
            >
              <Plus size={10} /> {s}
            </button>
          ))}
      </div>
    </div>
  );
}

export function Stepper({ current }: { current: Step }) {
  const currentIdx = STEPS.findIndex((s) => s.id === current);
  return (
    <nav className="flex flex-col gap-0" aria-label="Job posting steps">
      {STEPS.map((step, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        const pending = i > currentIdx;
        const Icon = step.icon;
        return (
          <div key={step.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all duration-300 z-10",
                  done && "bg-primary border-primary text-primary-foreground",
                  active && "bg-card border-primary text-primary",
                  pending && "bg-card border-border text-gray-300",
                )}
              >
                {done ? (
                  <Check size={14} strokeWidth={3} />
                ) : (
                  <Icon
                    size={14}
                    className={active ? "text-primary" : "text-gray-300"}
                  />
                )}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "w-0.5 flex-1 my-1 min-h-[40px] rounded-full transition-all duration-500",
                    done ? "bg-primary/100" : "bg-gray-200",
                  )}
                />
              )}
            </div>
            <div className={cn("pb-8", i === STEPS.length - 1 && "pb-0")}>
              <p
                className={cn(
                  "text-sm font-semibold leading-tight mt-1.5",
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
