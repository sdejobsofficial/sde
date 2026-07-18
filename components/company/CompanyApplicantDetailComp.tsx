import {
  REJECTION_LABELS,
  PIPELINE_STEPS,
  STATUS_CONFIG,
} from "@/constants/company/CApplicantDetailConstants";
import { cn } from "@/lib/utils";
import { ApplicationStatus, RejectionReason } from "@/models/applicationModel";
import { FormFieldType } from "@/models/jobModel";
import {
  Clock,
  CheckCircle2,
  Star,
  Calendar,
  Send,
  Trophy,
  X,
  Check,
  Pencil,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

export function StatusModal({
  current,
  onClose,
  onSave,
  isPending,
}: {
  current: ApplicationStatus;
  onClose: () => void;
  onSave: (
    status: ApplicationStatus,
    reason?: RejectionReason,
    note?: string,
  ) => void;
  isPending: boolean;
}) {
  const [selected, setSelected] = useState<ApplicationStatus>(current);
  const [reason, setReason] = useState<RejectionReason>(
    RejectionReason.NotAFit,
  );
  const [note, setNote] = useState("");
  const isRejecting = selected === ApplicationStatus.Rejected;

  const ALL_STATUSES = [
    { value: ApplicationStatus.Submitted, label: "Submitted", icon: Clock },
    { value: ApplicationStatus.Seen, label: "Seen", icon: CheckCircle2 },
    { value: ApplicationStatus.Shortlisted, label: "Shortlisted", icon: Star },
    {
      value: ApplicationStatus.InterviewScheduled,
      label: "Interview Scheduled",
      icon: Calendar,
    },
    { value: ApplicationStatus.OfferSent, label: "Offer Sent", icon: Send },
    { value: ApplicationStatus.Hired, label: "Hired", icon: Trophy },
    { value: ApplicationStatus.Rejected, label: "Rejected", icon: X },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-card rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-foreground">Change status</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground/80 hover:bg-muted hover:text-foreground/80 transition-all"
          >
            <X size={15} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Status grid */}
          <div className="grid grid-cols-2 gap-2">
            {ALL_STATUSES.map(({ value, label, icon: Icon }) => {
              const cfg = STATUS_CONFIG[value];
              const isSelected = selected === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSelected(value)}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all",
                    isSelected
                      ? `${cfg.bg} ${cfg.border} shadow-sm`
                      : "border-gray-100 bg-muted/50 hover:border-border hover:bg-card",
                  )}
                >
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full flex-shrink-0",
                      isSelected ? cfg.dot : "bg-gray-300",
                    )}
                  />
                  <Icon
                    size={13}
                    className={isSelected ? cfg.color : "text-muted-foreground/80"}
                  />
                  <span
                    className={cn(
                      "text-xs font-medium",
                      isSelected ? cfg.color : "text-muted-foreground",
                    )}
                  >
                    {label}
                  </span>
                  {isSelected && (
                    <Check
                      size={11}
                      strokeWidth={3}
                      className={cn("ml-auto flex-shrink-0", cfg.color)}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Rejection reason */}
          {isRejecting && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Rejection reason
              </p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(REJECTION_LABELS).map(([val, lbl]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setReason(Number(val) as RejectionReason)}
                    className={cn(
                      "text-xs px-2.5 py-1.5 rounded-lg border transition-all",
                      reason === Number(val)
                        ? "bg-red-50 border-red-200 text-red-600 font-medium"
                        : "border-border bg-card text-muted-foreground hover:border-gray-300",
                    )}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional note for your records..."
                rows={2}
                className="text-sm rounded-xl border-border bg-muted/50 focus:bg-card resize-none"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-10 rounded-xl border-border text-sm text-muted-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                onSave(
                  selected,
                  isRejecting ? reason : undefined,
                  note || undefined,
                )
              }
              disabled={isPending || selected === current}
              className="flex-[2] h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-medium shadow-md shadow-primary/30 disabled:opacity-50"
            >
              {isPending ? (
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
                  Saving...
                </span>
              ) : (
                "Save status"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export  function PipelineBar({
  status,
  onChangeClick,
}: {
  status: ApplicationStatus;
  onChangeClick: () => void;
}) {
  const isRejected = status === ApplicationStatus.Rejected;
  const isWithdrawn = status === ApplicationStatus.Withdrawn;
  const currentIdx = PIPELINE_STEPS.findIndex((s) => s.status === status);

  if (isRejected || isWithdrawn) {
    const cfg = STATUS_CONFIG[status];
    return (
      <div
        className={cn(
          "flex items-center justify-between px-5 py-3 rounded-2xl border",
          cfg.bg,
          cfg.border,
        )}
      >
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", cfg.dot)} />
          <span className={cn("text-sm font-semibold", cfg.color)}>
            {cfg.label}
          </span>
          {isRejected && (
            <span className="text-xs text-muted-foreground/80">
              · This application has been rejected
            </span>
          )}
          {isWithdrawn && (
            <span className="text-xs text-muted-foreground/80">· Candidate withdrew</span>
          )}
        </div>
        {!isWithdrawn && (
          <button
            onClick={onChangeClick}
            className="text-xs text-primary hover:text-primary/90 font-medium flex items-center gap-1 hover:underline"
          >
            <Pencil size={11} /> Change
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Application pipeline
        </p>
        <button
          onClick={onChangeClick}
          className="text-xs text-primary hover:text-primary/90 font-medium flex items-center gap-1 hover:underline"
        >
          <Pencil size={11} /> Change status
        </button>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-0">
        {PIPELINE_STEPS.map((step, i) => {
          const done = i < currentIdx;
          const active = i === currentIdx;
          const cfg = STATUS_CONFIG[step.status];
          return (
            <div key={step.status} className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all text-xs font-bold",
                    done && "bg-primary border-primary text-primary-foreground",
                    active && `${cfg.bg} ${cfg.border} ${cfg.color}`,
                    !done &&
                      !active &&
                      "bg-card border-border text-gray-300",
                  )}
                >
                  {done ? <Check size={13} strokeWidth={3} /> : i + 1}
                </div>
                <span
                  className={cn(
                    "text-xs whitespace-nowrap",
                    active
                      ? "font-semibold text-foreground"
                      : done
                        ? "text-muted-foreground"
                        : "text-gray-300",
                  )}
                >
                  {step.label}
                </span>
              </div>
              {i < PIPELINE_STEPS.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-1 rounded-full mb-4 transition-all",
                    done ? "bg-primary/100" : "bg-muted",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AnswerValue({ type, value }: { type: number; value: string }) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-muted-foreground/80 text-sm italic">Not answered</span>;
  }

  // Boolean
  if (type === FormFieldType.Checkbox) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 text-sm font-medium",
          value ? "text-green-600" : "text-muted-foreground",
        )}
      >
        {value ? (
          <>
            <CheckCircle2 size={14} /> Yes
          </>
        ) : (
          <>
            <X size={14} /> No
          </>
        )}
      </span>
    );
  }

  // Multi-select
  if (type === FormFieldType.MultiSelect && Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {value.map((v: string) => (
          <span
            key={v}
            className="text-xs bg-primary/10 text-primary/90 border border-primary/20 px-2.5 py-1 rounded-full font-medium"
          >
            {v}
          </span>
        ))}
      </div>
    );
  }

  // Rating
  if (type === FormFieldType.RatingPicker) {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            size={16}
            className={
              i < Number(value)
                ? "text-amber-400 fill-amber-400"
                : "text-gray-200"
            }
          />
        ))}
        <span className="text-sm text-muted-foreground ml-1">{value}/5</span>
      </div>
    );
  }

  // URL
  if (type === FormFieldType.UrlInput) {
    return (
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-primary hover:underline flex items-center gap-1"
      >
        {value} <ExternalLink size={11} />
      </a>
    );
  }

  return (
    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
      {String(value)}
    </p>
  );
}

export function RecruiterRating({
  value,
  onChange,
}: {
  value?: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          className="transition-transform hover:scale-110"
        >
          <Star
            size={18}
            className={
              n <= (hovered || value || 0)
                ? "text-amber-400 fill-amber-400"
                : "text-gray-200 hover:text-amber-200"
            }
          />
        </button>
      ))}
      {value && <span className="text-xs text-muted-foreground/80 ml-1">{value}/5</span>}
    </div>
  );
}

export function Skeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse space-y-4">
      <div className="h-4 bg-muted rounded w-48" />
      <div className="bg-card rounded-2xl border border-gray-100 h-40" />
      <div className="bg-card rounded-2xl border border-gray-100 h-64" />
    </div>
  );
}
