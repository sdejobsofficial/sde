import { sizeLabel } from "@/constants/student/SCompanyList";
import { CompanyCard } from "@/models/jobModel";
import { VerificationStatus } from "@/models/userModel";
import {
  BadgeCheck,
  MapPin,
  Users,
  Globe,
  Briefcase,
  Building2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function CompanyCardItem({ company }: { company: CompanyCard }) {
  const verified = company.VerificationStatus === VerificationStatus.Verified;
  const sz = sizeLabel(company.Size);

  return (
    <Link href={`/companies/${company.Id}`} className="block h-full group">
      <div className="bg-card rounded-2xl border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-hidden">
        {/* Top Header Section - Multi-tone Brand Gradient */}
        <div className="h-20 relative p-4 shrink-0 bg-linear-to-br from-[#121d2b] via-[#166164] to-[#121d2b]/95">
          <div className="absolute top-3 right-3 bg-card/10 backdrop-blur-md rounded-full px-2 py-0.5 border border-white/10">
            <span className="text-[10px] text-emerald-50/90 font-semibold uppercase tracking-widest leading-none">{sz || "Scale Unknown"}</span>
          </div>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #39c8c9 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
        </div>

        <div className="px-5 pb-6 flex flex-col flex-1 -mt-8 relative">
          {/* Logo Container */}
          <div className="mb-3 shrink-0">
            <div className="w-16 h-16 rounded-xl bg-card p-2 shadow-lg border border-border/10 flex items-center justify-center transition-transform group-hover:scale-105 duration-500">
              {company.LogoUrl ? (
                <Image
                  width={64}
                  height={64}
                  src={company.LogoUrl}
                  alt={company.Name || "Company"}
                  className="w-full h-full object-contain"
                />
              ) : (
                <Building2 className="text-primary/40" size={28} />
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="flex flex-col flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              <h3 className="text-base font-semibold text-foreground tracking-tight group-hover:text-primary transition-colors truncate">
                {company.Name || "Innovative Tech"}
              </h3>
              {verified && <BadgeCheck size={16} className="text-blue-500 shrink-0" />}
            </div>

            <div className="flex items-center gap-1.5 text-muted-foreground mb-3 shrink-0">
              <MapPin size={12} className="opacity-40" />
              <span className="text-xs font-medium">{company.Location || "Remote / Global"}</span>
            </div>

            {/* Industries - Fixed height area to keep cards aligned */}
            <div className="min-h-[28px] mb-3">
              {company.Industries.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {company.Industries.slice(0, 2).map((ind) => (
                    <span
                      key={ind}
                      className="text-[10px] bg-primary/5 text-primary border border-primary/10 px-2 py-1 rounded-md font-semibold uppercase tracking-tight"
                    >
                      {ind}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Bio - Fixed height area for bio to keep footers aligned */}
            <div className="flex-1">
              <p className="text-xs text-muted-foreground/80 leading-relaxed line-clamp-3 font-normal">
                {company.Bio || "No description available for this workspace."}
              </p>
            </div>
          </div>

          {/* Footer Section - Anchored to bottom */}
          <div className="mt-5 pt-4 border-t border-border/50 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5">
              <Briefcase size={12} className="text-primary" />
              <span className="text-[11px] font-semibold text-foreground">
                {company.ActiveJobs > 0 ? (
                  <span className="text-primary">{company.ActiveJobs} Job Roles</span>
                ) : (
                  <span className="text-muted-foreground/40">No Vacancies</span>
                )}
              </span>
            </div>

            <div className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
              <span className="text-sm font-light">→</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
