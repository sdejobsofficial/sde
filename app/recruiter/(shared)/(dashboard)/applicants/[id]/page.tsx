"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  useApplicationById,
  useUpdateApplicationStatus,
  useUpdateApplication,
  useAddRecruiterNote,
} from "@/hooks/useApplication";
import {
  ApplicationStatus,
  RejectionReason,
  ApplicationType,
} from "@/models/applicationModel";
import {
  Skeleton,
  RecruiterRating,
  AnswerValue,
  StatusModal,
  PipelineBar
} from "@/components/company/CompanyApplicantDetailComp";
import {
  formatDate,
  formatDateTime,
  STATUS_CONFIG
} from "@/constants/company/CApplicantDetailConstants";
import {
  AlertCircle,
  ArrowLeft,
  UserCheck,
  Mail,
  Phone,
  MapPin,
  Globe,
  BookmarkCheck,
  Bookmark,
  FileText,
  Download,
  Plus,
  MessageSquare,
  Pencil,
} from "lucide-react";

export default function ApplicantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: app, isLoading } = useApplicationById(id);
  const { mutateAsync: updateStatus, isPending: statusPending } =
    useUpdateApplicationStatus(id);
  const { mutateAsync: updateApp } = useUpdateApplication(id);
  const { mutateAsync: addNote, isPending: notePending } =
    useAddRecruiterNote(id);

  const [statusModal, setStatusModal] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);

  if (isLoading)
    return (
      <div className="min-h-screen bg-muted/50/80">
        <Skeleton />
      </div>
    );
  if (!app)
    return (
      <div className="min-h-screen bg-muted/50/80 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="text-gray-300 mx-auto mb-3" size={32} />
          <p className="text-sm text-muted-foreground">Application not found</p>
          <Link href="/company/applicants">
            <Button
              variant="outline"
              className="mt-4 h-9 px-4 rounded-xl text-sm"
            >
              ← Back
            </Button>
          </Link>
        </div>
      </div>
    );

  const cfg = STATUS_CONFIG[app.Status];
  const isActive =
    app.Status !== ApplicationStatus.Rejected &&
    app.Status !== ApplicationStatus.Withdrawn;
  const autoFields = app.AutoFields ?? {};

  const handleStatusSave = async (
    status: ApplicationStatus,
    reason?: RejectionReason,
    note?: string,
  ) => {
    await updateStatus({
      Status: status,
      RejectionReason: reason,
      RejectionNote: note,
    });
    setStatusModal(false);
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    await addNote({ Content: noteText.trim() });
    setNoteText("");
    setShowNoteInput(false);
  };

  const handleStarToggle = () => updateApp({ IsStarred: !app.IsStarred });
  const handleRating = (v: number) => updateApp({ RecruiterRating: v });

  return (
    <div className="min-h-screen bg-muted/50/80">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground/80 mb-5">
          <Link
            href="/recruiter/applicants"
            className="hover:text-primary transition-colors flex items-center gap-1"
          >
            <ArrowLeft size={12} /> Applicants
          </Link>
          <span>/</span>
          <span className="text-muted-foreground font-medium truncate">
            {app.CandidateName}
          </span>
        </div>

        <div className="flex gap-5 items-start">
          {/* ── Main column ── */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Candidate hero card */}
            <div className="bg-card rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary/90 font-black text-xl flex-shrink-0 border border-primary/30">
                    {app.CandidateName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-xl font-bold text-foreground">
                        {app.CandidateName}
                      </h1>
                      {app.Type === ApplicationType.Referral && (
                        <span className="text-xs bg-green-50 text-green-600 border border-green-100 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                          <UserCheck size={10} /> Referred
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5">
                      <a
                        href={`mailto:${app.CandidateEmail}`}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Mail size={11} /> {app.CandidateEmail}
                      </a>
                      {app.CandidatePhone && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone size={11} /> {app.CandidatePhone}
                        </div>
                      )}
                      {app.CandidateLocation && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin size={11} /> {app.CandidateLocation}
                        </div>
                      )}
                    </div>

                    {/* Social links */}
                    <div className="flex items-center gap-2 mt-2">
                      {autoFields.LinkedInUrl && (
                        <a
                          href={autoFields.LinkedInUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-7 h-7 rounded-lg bg-[#0077B5]/10 flex items-center justify-center text-[#0077B5] hover:bg-[#0077B5]/20 transition-all"
                        >
                          <Globe size={13} />
                        </a>
                      )}
                      {autoFields.PortfolioUrl && (
                        <a
                          href={autoFields.PortfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-all"
                        >
                          <Globe size={13} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-end gap-3 flex-shrink-0">
                  {/* Status badge */}
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-semibold",
                      cfg.bg,
                      cfg.border,
                      cfg.color,
                    )}
                  >
                    <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
                    {cfg.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleStarToggle}
                      className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center border transition-all",
                        app.IsStarred
                          ? "bg-amber-50 border-amber-200 text-amber-500"
                          : "bg-card border-gray-200 text-muted-foreground/80 hover:text-amber-500 hover:border-amber-200 hover:bg-amber-50",
                      )}
                    >
                      {app.IsStarred ? (
                        <BookmarkCheck size={15} />
                      ) : (
                        <Bookmark size={15} />
                      )}
                    </button>
                    <a href={`mailto:${app.CandidateEmail}`}>
                      <Button
                        variant="outline"
                        className="h-8 px-3 rounded-xl border-gray-200 text-xs text-muted-foreground hover:bg-primary/10 hover:border-primary/30 hover:text-primary flex items-center gap-1.5"
                      >
                        <Mail size={12} /> Email
                      </Button>
                    </a>
                  </div>
                </div>
              </div>

              {/* Recruiter rating */}
              <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">
                    Internal rating
                  </p>
                  <RecruiterRating
                    value={app.RecruiterRating}
                    onChange={handleRating}
                  />
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground/80">
                    Applied {formatDate(app.CreatedAt)}
                  </p>
                  {app.SeenAt && (
                    <p className="text-xs text-muted-foreground/80 mt-0.5">
                      Seen {formatDateTime(app.SeenAt)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Pipeline */}
            <PipelineBar
              status={app.Status}
              onChangeClick={() => setStatusModal(true)}
            />

            {/* Rejection note */}
            {app.Status === ApplicationStatus.Rejected && app.RejectionNote && (
              <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4">
                <p className="text-xs font-semibold text-red-600 mb-1">
                  Rejection reason
                </p>
                <p className="text-sm text-red-700">{app.RejectionNote}</p>
              </div>
            )}

            {/* Resume & auto-fields */}
            <div className="bg-card rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-bold text-foreground mb-4">
                Submitted materials
              </h2>
              <div className="space-y-3">
                {/* Resume */}
                {autoFields.ResumeUrl ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-primary/20 bg-primary/10/50">
                    <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <FileText className="text-primary" size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground/90 truncate">
                        {autoFields.ResumeFileName ?? "Resume"}
                      </p>
                      <p className="text-xs text-muted-foreground/80">PDF document</p>
                    </div>
                    <a
                      href={autoFields.ResumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="outline"
                        className="h-8 px-3 rounded-xl border-primary/30 text-xs text-primary hover:bg-primary/20 flex items-center gap-1.5"
                      >
                        <Download size={12} /> Download
                      </Button>
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground/80 py-2">
                    <AlertCircle size={13} /> No resume uploaded
                  </div>
                )}

                {/* Cover letter */}
                {autoFields.CoverLetter && (
                  <div className="rounded-xl border border-gray-100 bg-muted/50/50 p-4">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">
                      Cover letter
                    </p>
                    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                      {autoFields.CoverLetter}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Form answers */}
            {(app.Answers ?? []).length > 0 && (
              <div className="bg-card rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="text-sm font-bold text-foreground mb-5">
                  Application form answers
                </h2>
                <div className="space-y-5">
                  {app.Answers.map((ans, i) => (
                    <div
                      key={ans.FieldId}
                      className={cn(
                        "pb-5",
                        i < app.Answers.length - 1 && "border-b border-gray-50",
                      )}
                    >
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        {ans.FieldLabel || `Question ${i + 1}`}
                      </p>
                      <AnswerValue
                        type={ans.Type}
                        value={ans.Value as string}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recruiter notes */}
            <div className="bg-card rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-foreground">
                  Recruiter notes
                </h2>
                <button
                  onClick={() => setShowNoteInput((v) => !v)}
                  className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/90 font-medium transition-colors"
                >
                  <Plus size={13} /> Add note
                </button>
              </div>

              {/* Add note input */}
              {showNoteInput && (
                <div className="mb-4 space-y-2">
                  <Textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Add an internal note visible only to your team..."
                    rows={3}
                    className="text-sm rounded-xl border-gray-200 bg-muted/50 focus:bg-card resize-none"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowNoteInput(false);
                        setNoteText("");
                      }}
                      className="h-8 px-3 rounded-xl border-gray-200 text-xs text-muted-foreground"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddNote}
                      disabled={!noteText.trim() || notePending}
                      className="h-8 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-sm shadow-primary/30 disabled:opacity-50"
                    >
                      {notePending ? (
                        <svg
                          className="animate-spin h-3 w-3"
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
                      ) : (
                        <MessageSquare size={12} />
                      )}
                      Save note
                    </Button>
                  </div>
                </div>
              )}

              {/* Notes list */}
              {(app.Notes ?? []).length === 0 && !showNoteInput ? (
                <p className="text-xs text-muted-foreground/80 py-3">
                  No notes yet. Add one to keep track of your thoughts.
                </p>
              ) : (
                <div className="space-y-3">
                  {(app.Notes ?? []).map((note) => (
                    <div key={note.Id} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary/90 text-xs font-bold mt-0.5">
                        {note.AuthorName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 bg-muted/50 rounded-xl px-3.5 py-2.5 border border-gray-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-foreground/80">
                            {note.AuthorName}
                          </span>
                          <span className="text-xs text-muted-foreground/80">
                            {formatDateTime(note.CreatedAt)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {note.Content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Status history */}
            {(app.StatusHistory ?? []).length > 1 && (
              <div className="bg-card rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="text-sm font-bold text-foreground mb-4">
                  Status history
                </h2>
                <div className="space-y-2.5">
                  {[...app.StatusHistory].reverse().map((entry, i) => {
                    const entryCfg =
                      STATUS_CONFIG[entry.Status as ApplicationStatus];
                    return (
                      <div key={i} className="flex items-start gap-3">
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full flex-shrink-0 mt-1.5",
                            entryCfg?.dot ?? "bg-gray-300",
                          )}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span
                              className={cn(
                                "text-xs font-semibold",
                                entryCfg?.color ?? "text-muted-foreground",
                              )}
                            >
                              {entryCfg?.label ?? "Unknown"}
                            </span>
                            <span className="text-xs text-muted-foreground/80">
                              {formatDateTime(entry.ChangedAt)}
                            </span>
                          </div>
                          {entry.Note && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {entry.Note}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Right sidebar ── */}
          <aside className="hidden lg:flex w-64 flex-shrink-0 flex-col gap-4 sticky top-6">
            {/* Quick actions */}
            <div className="bg-card rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                Quick actions
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => setStatusModal(true)}
                  className="w-full h-9 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-medium shadow-sm shadow-primary/30 flex items-center justify-center gap-1.5"
                >
                  <Pencil size={12} /> Change status
                </Button>
                <a href={`mailto:${app.CandidateEmail}`} className="block">
                  <Button
                    variant="outline"
                    className="w-full h-9 rounded-xl border-gray-200 text-xs text-muted-foreground hover:bg-primary/10 hover:border-primary/30 hover:text-primary flex items-center justify-center gap-1.5"
                  >
                    <Mail size={12} /> Send email
                  </Button>
                </a>
                {autoFields.ResumeUrl && (
                  <a
                    href={autoFields.ResumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button
                      variant="outline"
                      className="w-full h-9 rounded-xl border-gray-200 text-xs text-muted-foreground hover:bg-primary/10 hover:border-primary/30 hover:text-primary flex items-center justify-center gap-1.5"
                    >
                      <Download size={12} /> Download resume
                    </Button>
                  </a>
                )}
              </div>
            </div>

            {/* Meta */}
            <div className="bg-card rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                Details
              </p>
              <div className="space-y-3">
                {[
                  {
                    label: "Application type",
                    value:
                      app.Type === ApplicationType.Referral
                        ? "Referral"
                        : "Direct",
                  },
                  { label: "Applied on", value: formatDate(app.CreatedAt) },
                  { label: "Last updated", value: formatDate(app.UpdatedAt) },
                  {
                    label: "Seen at",
                    value: app.SeenAt
                      ? formatDateTime(app.SeenAt)
                      : "Not yet seen",
                  },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-muted-foreground/80">{label}</p>
                    <p className="text-xs font-medium text-foreground/80 mt-0.5">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Back to applicants */}
            <Link href="/recruiter/applicants">
              <Button
                variant="outline"
                className="w-full h-9 rounded-xl border-gray-200 text-xs text-muted-foreground hover:bg-muted/50 flex items-center justify-center gap-1.5"
              >
                <ArrowLeft size={12} /> Back to applicants
              </Button>
            </Link>
          </aside>
        </div>
      </div>

      {/* Status modal */}
      {statusModal && (
        <StatusModal
          current={app.Status}
          onClose={() => setStatusModal(false)}
          onSave={handleStatusSave}
          isPending={statusPending}
        />
      )}
    </div>
  );
}
