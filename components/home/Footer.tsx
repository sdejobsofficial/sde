import Link from "next/link";
import Image from "next/image";

const SOCIAL_LINKS = [
  { icon: "f", href: "#" }, // Facebook
  { icon: "in", href: "#" }, // LinkedIn
  { icon: "𝕏", href: "#" }, // Twitter / X
  { icon: "🔗", href: "#" }, // Other
];

const COMPANY_LINKS = [
  { label: "About us", href: "/about" },
  { label: "Careers", href: "/" },
  { label: "Employer home", href: "/recruiter/login" },
];

const LEGAL_LINKS = [
  { label: "Privacy policy", href: "/privacy" },
  { label: "Terms & conditions", href: "/terms" },
];

// ─────────────────────────────────────────────────────────────────────────

export default function Footer() {
  return (
    <footer className="bg-muted pt-12 pb-6 px-4 border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Logo + Socials */}
          <div>
            <div className="py-5 shrink-0">
              <Link href="/" className="flex items-center gap-2.5">
                <Image
                  src="/icon.png"
                  alt="ReferNest Logo"
                  width={32}
                  height={32}
                  className="rounded-md"
                />
                <span className="font-bold text-base text-foreground tracking-tight">
                  SDE Jobs & <span className="text-primary">Internships</span>
                </span>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              India&apos;s leading job portal connecting talent with
              opportunity.
            </p>
            <p className="text-sm font-bold text-foreground mb-3">
              Connect with us
            </p>
            <div className="flex gap-3">
              {SOCIAL_LINKS.map(({ icon, href }) => (
                <Link
                  key={icon}
                  href={href}
                  className="w-8 h-8 bg-card border border-border shadow-sm rounded-full flex items-center justify-center text-muted-foreground text-xs hover:bg-primary/10 hover:text-primary transition-all"
                >
                  {icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-bold text-foreground mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {COMPANY_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="hover:text-primary transition-colors inline-block"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {LEGAL_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="hover:text-primary transition-colors inline-block"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="text-[11px] text-muted-foreground/60 max-w-2xl">
            All trademarks are the property of their respective owners. All
            rights reserved © {new Date().getFullYear()} SDE Jobs & Internships
            Pvt. Ltd.
          </p>
        </div>
      </div>
    </footer>
  );
}
