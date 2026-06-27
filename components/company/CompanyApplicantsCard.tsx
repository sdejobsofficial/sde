import { timeAgo } from "@/constants/student/SCompanyDetail";
import { cn } from "@/lib/utils";
import {
  ApplicationCard,
  ApplicationStatus,
  ApplicationType,
} from "@/models/applicationModel";
import {
  LucideIcon,
  Sparkles,
  CalendarClock,
  Gift,
  BadgeCheck,
  XCircle,
  Users,
  Mail,
  MapPin,
  Briefcase,
  FileText,
  Star,
  Clock,
  MoreVertical,
  Eye,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import {
  STATUS_CONFIG,
  avatarColor,
  getInitials,
} from "@/constants/company/CApplicantConstants";

export function ApplicantCard({
  app,
  onStatusChange,
  onStar,
}: {
  app: ApplicationCard;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  onStar: (id: string, starred: boolean) => void;
}) {
  // const [menuOpen, setMenuOpen] = useState(false);
  const status = STATUS_CONFIG[app.Status];

  // const quickActions: {
  //   label: string;
  //   status: ApplicationStatus;
  //   icon: LucideIcon;
  //   color: string;
  // }[] = [
  //   {
  //     label: "Shortlist",
  //     status: ApplicationStatus.Shortlisted,
  //     icon: Sparkles,
  //     color: "hover:bg-primary/10 hover:text-primary",
  //   },
  //   {
  //     label: "Schedule interview",
  //     status: ApplicationStatus.InterviewScheduled,
  //     icon: CalendarClock,
  //     color: "hover:bg-amber-50 hover:text-amber-600",
  //   },
  //   {
  //     label: "Send offer",
  //     status: ApplicationStatus.OfferSent,
  //     icon: Gift,
  //     color: "hover:bg-emerald-50 hover:text-emerald-600",
  //   },
  //   {
  //     label: "Mark hired",
  //     status: ApplicationStatus.Hired,
  //     icon: BadgeCheck,
  //     color: "hover:bg-green-50 hover:text-green-600",
  //   },
  //   {
  //     label: "Reject",
  //     status: ApplicationStatus.Rejected,
  //     icon: XCircle,
  //     color: "hover:bg-red-50 hover:text-red-500",
  //   },
  // ].filter((a) => a.status !== app.Status);

  return (
    <div
      className={cn(
        "bg-card rounded-2xl border shadow-sm p-5 transition-all hover:shadow-md hover:border-primary/20 group",
        app.Status === ApplicationStatus.Rejected ||
          app.Status === ApplicationStatus.Withdrawn
          ? "border-gray-100 opacity-75"
          : "border-gray-100",
      )}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div
          className={cn(
            "w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold",
            app.CandidateAvatarUrl ? "" : avatarColor(app.CandidateName),
          )}
        >
          {app.CandidateAvatarUrl ? (
            <Image
              src={app.CandidateAvatarUrl}
              alt=""
              className="w-full h-full rounded-full object-cover"
              width={44}
              height={44}
            />
          ) : (
            getInitials(app.CandidateName)
          )}
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-foreground group-hover:text-primary/90 transition-colors">
              {app.CandidateName}
            </p>
            {app.Type === ApplicationType.Referral && (
              <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-medium">
                <Users size={9} /> Referred
              </span>
            )}
          </div>

          {/* Contact */}
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-xs text-muted-foreground/80">
              <Mail size={10} /> {app.CandidateEmail}
            </span>
            {app.CandidateLocation && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground/80">
                <MapPin size={10} /> {app.CandidateLocation}
              </span>
            )}
          </div>

          {/* Job name */}
          <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
            <Briefcase size={10} className="text-muted-foreground/80" />
            {app.JobTitle}
          </p>

          {/* Tags row */}
          <div className="flex flex-wrap items-center gap-2 mt-2.5">
            {/* Status badge */}
            <span
              className={cn(
                "inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium",
                status.color,
              )}
            >
              <span className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
              {status.label}
            </span>

            {/* Resume badge */}
            {app.ResumeUrl && (
              <a
                href={app.ResumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full font-medium hover:bg-primary/20 transition-all"
              >
                <FileText size={10} /> Resume
              </a>
            )}

            {/* Rating */}
            {app.RecruiterRating !== undefined && app.RecruiterRating > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full font-medium">
                <Star size={10} fill="currentColor" /> {app.RecruiterRating}/5
              </span>
            )}
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {/* Star */}
          <button
            onClick={() => onStar(app.Id, !app.IsStarred)}
            className={cn(
              "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
              app.IsStarred
                ? "text-amber-400 bg-amber-50"
                : "text-gray-300 hover:text-amber-400 hover:bg-amber-50",
            )}
          >
            <Star size={14} fill={app.IsStarred ? "currentColor" : "none"} />
          </button>

          {/* Time */}
          <span className="text-xs text-muted-foreground/80 flex items-center gap-1">
            <Clock size={10} /> {timeAgo(app.CreatedAt)}
          </span>

          {/* More menu */}
          {/* <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground/80 hover:text-muted-foreground hover:bg-muted transition-all"
            >
              <MoreVertical size={14} />
            </button>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-48 bg-card rounded-xl shadow-lg border border-gray-100 py-1 z-40">
                  <Link
                    href={`/recruiter/applicants/${app.Id}`}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <Eye size={12} /> View full application
                  </Link>
                  <Link
                    href={`/recruiter/applicants/${app.Id}?tab=notes`}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <MessageSquare size={12} /> Add note
                  </Link>
                  <div className="border-t border-gray-50 my-1" />
                  <p className="px-3 py-1 text-xs text-muted-foreground/80 font-medium uppercase tracking-wide">
                    Move to
                  </p>
                  {quickActions.map((action) => {
                    const ActionIcon = action.icon;
                    return (
                      <button
                        key={action.status}
                        onClick={() => {
                          onStatusChange(app.Id, action.status);
                          setMenuOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-3 py-2 text-xs text-muted-foreground transition-colors",
                          action.color,
                        )}
                      >
                        <ActionIcon size={12} /> {action.label}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div> */}
        </div>
      </div>

      {/* Bottom CTA row */}
      <div className="mt-4 pt-3.5 border-t border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Quick move buttons for active applications */}
          {app.Status === ApplicationStatus.Submitted && (
            <>
              <button
                onClick={() =>
                  onStatusChange(app.Id, ApplicationStatus.Shortlisted)
                }
                className="flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 border border-primary/20 px-2.5 py-1.5 rounded-lg hover:bg-primary/20 transition-all"
              >
                <ThumbsUp size={11} /> Shortlist
              </button>
              <button
                onClick={() =>
                  onStatusChange(app.Id, ApplicationStatus.Rejected)
                }
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground/80 bg-muted/50 border border-gray-100 px-2.5 py-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
              >
                <ThumbsDown size={11} /> Pass
              </button>
            </>
          )}
          {app.Status === ApplicationStatus.Shortlisted && (
            <button
              onClick={() =>
                onStatusChange(app.Id, ApplicationStatus.InterviewScheduled)
              }
              className="flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-1.5 rounded-lg hover:bg-amber-100 transition-all"
            >
              <CalendarClock size={11} /> Schedule interview
            </button>
          )}
          {app.Status === ApplicationStatus.InterviewScheduled && (
            <button
              onClick={() =>
                onStatusChange(app.Id, ApplicationStatus.OfferSent)
              }
              className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1.5 rounded-lg hover:bg-emerald-100 transition-all"
            >
              <Gift size={11} /> Send offer
            </button>
          )}
        </div>

        <Link
          href={`/recruiter/applicants/${app.Id}`}
          className="text-xs font-semibold text-primary hover:text-primary/90 flex items-center gap-1 hover:underline underline-offset-2 transition-colors"
        >
          View application <ArrowRight size={11} />
        </Link>
      </div>
    </div>
  );
}
