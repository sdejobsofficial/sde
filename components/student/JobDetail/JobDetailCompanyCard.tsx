import { CompanyProfile } from "@/clients/jobClient";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Globe,
  ExternalLink,
  BadgeCheck,
  Users,
  MapPin,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function CompanyCard({ companyMeta }: { companyMeta: CompanyProfile }) {
  const meta = companyMeta ?? {};
  const companyId = meta.Id ?? "";
  const name = meta.Name ?? "Unknown Company";
  const logo = meta.AvatarUrl ?? null;
  const industries: string[] = meta.Industry ?? [];
  const size = meta.Size ?? null;
  const website = meta.Website ?? null;
  const description = meta.Bio ?? null;

  return (
    <div className="bg-card rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Banner */}
      <div className="h-16 bg-linear-to-br from-primary/100 to-purple-600 relative shrink-0">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, white 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
      </div>

      <div className="px-5 pb-5 z-10">
        {/* Logo */}
        <div className="flex items-end z-10 justify-between -mt-6 mb-3">
          <div className="w-14 h-14 rounded-xl border-2 border-white bg-card shadow-md flex items-center justify-center overflow-hidden">
            {logo ? (
              <Image
                src={logo}
                alt={name}
                className="w-full h-full object-contain"
                width={80}
                height={80}
              />
            ) : (
              <Building2 size={22} className="text-gray-300" />
            )}
          </div>
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-primary hover:underline font-medium"
            >
              <Globe size={11} /> Website <ExternalLink size={10} />
            </a>
          )}
        </div>

        <div className="flex items-center gap-1.5 mb-0.5">
          <h3 className="text-base font-bold text-foreground">{name}</h3>
          <BadgeCheck size={14} className="text-blue-400 flex-shrink-0" />
        </div>

        {industries.length > 0 && (
          <p className="text-xs text-muted-foreground mb-3">{industries.join(" · ")}</p>
        )}

        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-3">
            {description}
          </p>
        )}

        <div className="flex flex-col gap-2">
          {size && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users size={12} className="text-muted-foreground/80" />
              <span>{size} employees</span>
            </div>
          )}
          {meta.Location && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin size={12} className="text-muted-foreground/80" />
              <span>{meta.Location}</span>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-50">
          <Link href={`/companies/${companyId}`}>
            <Button
              variant="outline"
              className="w-full h-8 rounded-xl border-border text-xs text-primary hover:bg-primary/10 hover:border-primary/30 font-medium flex items-center gap-1.5"
            >
              View company profile <ChevronRight size={13} />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
