import { cn } from "@/lib/utils";
import { Pencil, Plus, X, Loader2 } from "lucide-react";

export function SectionCard({
  id,
  title,
  subtitle,
  badge,
  children,
  onAdd,
  onEdit,
  addLabel = "Add",
  isEmpty = false,
  emptyText,
}: {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  children?: React.ReactNode;
  onAdd?: () => void;
  onEdit?: () => void;
  addLabel?: string;
  isEmpty?: boolean;
  emptyText?: string;
}) {
  return (
    <section
      id={id}
      className="bg-card rounded-2xl border border-gray-100 shadow-sm p-6"
    >
      <div className="flex items-start justify-between mb-1">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            {badge && (
              <span className="text-xs font-medium text-primary">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground/80 mt-0.5">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          {onEdit && (
            <button
              onClick={onEdit}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground/80 hover:text-primary hover:bg-primary/10 transition-all"
            >
              <Pencil size={13} />
            </button>
          )}
          {onAdd && (
            <button
              onClick={onAdd}
              className="text-xs font-semibold text-primary hover:text-primary/90 hover:underline transition-colors flex items-center gap-1"
            >
              <Plus size={13} /> {addLabel}
            </button>
          )}
        </div>
      </div>
      {isEmpty && emptyText ? (
        <p className="text-sm text-muted-foreground/80 mt-3">{emptyText}</p>
      ) : (
        <div className="mt-3">{children}</div>
      )}
    </section>
  );
}

export function Modal({
  open,
  onClose,
  title,
  badge,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-card rounded-3xl shadow-2xl shadow-gray-900/20 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-foreground">{title}</h3>
            {badge && (
              <span className="text-xs font-semibold text-primary">
                {badge}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground/80 hover:text-foreground/80 hover:bg-muted transition-all"
          >
            <X size={15} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// Single-select chip selector: value is T | undefined, toggle clears selection.
export function ChipSelector<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T | undefined;
  onChange: (v: T | undefined) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(({ label, value: v }) => (
        <button
          key={String(v)}
          type="button"
          onClick={() => onChange(value === v ? undefined : v)}
          className={cn(
            "text-xs px-3 py-1.5 rounded-full border transition-all",
            value === v
              ? "bg-gray-900 text-primary-foreground border-gray-900"
              : "border-gray-200 bg-card text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/10",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function ProfileCompletion({ percent }: { percent: number }) {
  return (
    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-foreground">
          Profile completion
        </p>
        <span className="text-sm font-bold text-primary">{percent}%</span>
      </div>
      <div className="w-full h-2 bg-primary/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export function SavingOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-card rounded-2xl px-6 py-4 shadow-xl flex items-center gap-3">
        <Loader2 size={18} className="text-primary animate-spin" />
        <span className="text-sm font-medium text-foreground/80">
          Saving changes…
        </span>
      </div>
    </div>
  );
}
