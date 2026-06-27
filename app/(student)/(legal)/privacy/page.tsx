import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Shield } from "lucide-react";

const LAST_UPDATED = "May 12, 2026";

// ─── Types ────────────────────────────────────────────────────────────────

interface PrivacySubsection {
  title: string;
  items?: string[];
}

interface PrivacySection {
  id: string;
  title: string;
  content?: string[];
  items?: string[];
  subsections?: PrivacySubsection[];
  footer?: string;
  contact?: {
    name: string;
    email: string;
    address: string;
  };
}

// ─── Data ─────────────────────────────────────────────────────────────────

const SECTIONS: PrivacySection[] = [
  {
    id: "introduction",
    title: "1. Introduction",
    content: [
      `Welcome to SDE Jobs & Internships ("we", "our", or "us"). We operate the SDE Jobs & Internships platform — a job referral and recruitment platform connecting job seekers and companies across India — accessible through our website and mobile applications (collectively, the "Platform").`,
      `This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use our Platform. By accessing or using SDE Jobs & Internships, you agree to the practices described in this Policy. If you do not agree, please discontinue use of the Platform.`,
      `We are committed to protecting your privacy and complying with applicable data protection laws, including the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023 (DPDPA) of India.`,
    ],
  },
  {
    id: "information-we-collect",
    title: "2. Information We Collect",
    subsections: [
      {
        title: "2.1 Information you provide directly",
        items: [
          "Account registration data: name, email address, phone number, password, and role (job seeker or company).",
          "Profile information: location, bio, profile photo, resume, education history, work experience, skills, social links, and personal details.",
          "Company information: company name, description, industry, size, logo, and contact details.",
          "Job postings: title, description, salary, requirements, and application form fields.",
          "Application data: cover letters, answers to custom form questions, and uploaded files.",
          "Communications: messages, notes, and support requests you submit through the Platform.",
        ],
      },
      {
        title: "2.2 Information collected automatically",
        items: [
          "Device and usage data: IP address, browser type, operating system, device identifiers, and pages visited.",
          "Log data: access times, referring URLs, and crash reports.",
          "Cookies and tracking technologies: session cookies, preference cookies, and analytics pixels.",
        ],
      },
      {
        title: "2.3 Information from third parties",
        items: [
          "Google OAuth: if you sign in with Google, we receive your name, email address, and profile picture from Google.",
          "Payment providers: when you subscribe to a paid plan, Dodo Payments processes your payment and shares transaction identifiers with us — we do not store your full card details.",
        ],
      },
    ],
  },
  {
    id: "how-we-use",
    title: "3. How We Use Your Information",
    items: [
      "Create and manage your account and provide access to the Platform.",
      "Match job seekers with relevant job postings and send personalised job alerts.",
      "Enable companies to review applications and communicate with candidates.",
      "Process subscription payments and manage billing through Dodo Payments.",
      "Send transactional emails (verification, application confirmations, status updates).",
      "Improve, personalise, and expand the Platform through analytics and user feedback.",
      "Detect, prevent, and investigate fraud, security incidents, and abuse.",
      "Comply with legal obligations and respond to lawful requests from authorities.",
      "Send promotional communications — you may opt out at any time.",
    ],
  },
  {
    id: "legal-basis",
    title: "4. Legal Basis for Processing",
    content: [
      `Under the DPDPA 2023, we process your personal data on the following bases: (a) Consent — you have given clear consent for specific processing activities; (b) Contract — processing is necessary to provide the services you requested; (c) Legitimate interests — we process data to improve the Platform, detect fraud, and maintain security; and (d) Legal obligation — we process data to comply with applicable laws.`,
      `You may withdraw consent at any time by contacting us or adjusting your account settings. Withdrawal of consent does not affect the lawfulness of processing carried out before withdrawal.`,
    ],
  },
  {
    id: "data-sharing",
    title: "5. How We Share Your Information",
    subsections: [
      {
        title: "5.1 With companies and recruiters",
        items: [
          "When you apply for a job, your application data (name, email, resume, and form responses) is shared with the hiring company.",
          "Your public profile information may be visible to verified recruiters on the Platform.",
        ],
      },
      {
        title: "5.2 With service providers",
        items: [
          "Supabase (database and authentication infrastructure).",
          "Dodo Payments (payment processing).",
          "Vercel (hosting and deployment).",
          "Email service providers for transactional and marketing communications.",
        ],
      },
      {
        title: "5.3 Other disclosures",
        items: [
          "We do not sell your personal data to third parties.",
          "We may disclose data if required by law, court order, or government authority.",
          "In the event of a merger or acquisition, your data may be transferred to the successor entity, subject to the same privacy protections.",
        ],
      },
    ],
  },
  {
    id: "data-retention",
    title: "6. Data Retention",
    content: [
      `We retain your personal data for as long as your account is active or as necessary to provide our services. Specifically: account data is retained until you request deletion; application data is retained for 3 years after the application was submitted; payment records are retained for 7 years as required by tax and accounting laws.`,
      `When you delete your account, we delete or anonymise your personal data within 30 days, except where retention is required by law or for legitimate business purposes such as resolving disputes.`,
    ],
  },
  {
    id: "your-rights",
    title: "7. Your Rights",
    content: [
      `Under applicable data protection laws, you have the following rights regarding your personal data:`,
    ],
    items: [
      "Right to access — request a copy of the personal data we hold about you.",
      "Right to correction — request correction of inaccurate or incomplete data.",
      "Right to erasure — request deletion of your personal data, subject to legal obligations.",
      "Right to data portability — request your data in a structured, machine-readable format.",
      "Right to withdraw consent — withdraw consent for processing at any time.",
      "Right to grievance redressal — lodge a complaint with our Data Protection Officer or the Data Protection Board of India.",
    ],
    footer: `To exercise any of these rights, contact us at privacy@sdejobs.in. We will respond within 30 days.`,
  },
  {
    id: "cookies",
    title: "8. Cookies and Tracking",
    content: [
      `We use cookies and similar technologies to operate and improve the Platform. These include: essential cookies (required for login and security), preference cookies (to remember your settings), and analytics cookies (to understand how the Platform is used).`,
      `You can manage your cookie preferences through your browser settings. Disabling essential cookies may affect Platform functionality. We do not serve advertising cookies or share data with ad networks.`,
    ],
  },
  {
    id: "security",
    title: "9. Data Security",
    content: [
      `We implement industry-standard technical and organisational measures to protect your personal data, including TLS encryption in transit, AES-256 encryption at rest in Supabase, row-level security policies, and access controls limiting staff access to personal data.`,
      `Despite these measures, no system is completely secure. We encourage you to use a strong password, enable two-factor authentication if available, and notify us immediately at security@sdejobs.in if you suspect unauthorised access.`,
    ],
  },
  {
    id: "children",
    title: "10. Children's Privacy",
    content: [
      `The Platform is not directed to individuals under 18 years of age. We do not knowingly collect personal data from children. If you believe we have inadvertently collected data from a minor, please contact us immediately and we will delete it promptly.`,
    ],
  },
  {
    id: "transfers",
    title: "11. International Data Transfers",
    content: [
      `Your personal data is primarily stored on servers located in India. Where data is transferred to service providers outside India (such as Vercel's global CDN), we ensure appropriate safeguards are in place, including contractual clauses and compliance with the DPDPA requirements for cross-border data transfers.`,
    ],
  },
  {
    id: "changes",
    title: "12. Changes to This Policy",
    content: [
      `We may update this Privacy Policy from time to time. When we make material changes, we will notify you by email or by posting a prominent notice on the Platform at least 14 days before the changes take effect. Your continued use of the Platform after the effective date constitutes acceptance of the updated Policy.`,
    ],
  },
  {
    id: "contact",
    title: "13. Contact and Grievances",
    content: [
      `If you have questions, concerns, or complaints about this Privacy Policy or our data practices, please contact our Data Protection Officer:`,
    ],
    contact: {
      name: "SDE Jobs & Internships — Data Protection Officer",
      email: "privacy@sdejobs.in",
      address: "SDE Jobs & Internships, Bengaluru, Karnataka, India",
    },
    footer: `If you are not satisfied with our response, you may approach the Data Protection Board of India as established under the DPDPA 2023.`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-muted/50/80">
      {/* Header */}
      <header className="bg-card border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <Image
                src="/icon.png"
                alt="SDE Jobs & Internships Logo"
                width={32}
                height={32}
                className="rounded-md"
              />
            </div>
            <span className="font-bold text-base text-foreground tracking-tight">
              SDE Jobs & Internships
            </span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft size={14} /> Back to home
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-10">
        <div className="flex gap-8 items-start">
          {/* ── Sticky ToC ── */}
          <aside className="hidden xl:block w-56 flex-shrink-0 sticky top-24">
            <div className="bg-card rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                Contents
              </p>
              <nav className="space-y-0.5">
                {SECTIONS.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="block text-xs text-muted-foreground hover:text-primary py-1 px-2 rounded-lg hover:bg-primary/10 transition-all leading-snug"
                  >
                    {s.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Page header */}
            <div className="bg-card rounded-2xl border border-gray-100 shadow-sm p-7">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Shield className="text-primary" size={20} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground tracking-tight">
                    Privacy Policy
                  </h1>
                  <p className="text-xs text-muted-foreground/80 mt-0.5">
                    Last updated: {LAST_UPDATED}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed bg-primary/10 border border-primary/20 rounded-xl px-4 py-3">
                This Privacy Policy describes how SDE Jobs & Internships
                collects, uses, and protects your personal information when you
                use our platform. We encourage you to read it carefully.
              </p>
            </div>

            {/* Sections */}
            {SECTIONS.map((section) => (
              <div
                key={section.id}
                id={section.id}
                className="bg-card rounded-2xl border border-gray-100 shadow-sm p-7 scroll-mt-20"
              >
                <h2 className="text-base font-bold text-foreground mb-4 pb-3 border-b border-gray-50">
                  {section.title}
                </h2>

                {section.content && (
                  <div className="space-y-3 mb-4">
                    {section.content.map((para, i) => (
                      <p
                        key={i}
                        className="text-sm text-muted-foreground leading-relaxed"
                      >
                        {para}
                      </p>
                    ))}
                  </div>
                )}

                {section.subsections && (
                  <div className="space-y-5">
                    {section.subsections.map((sub: PrivacySubsection) => (
                      <div key={sub.title}>
                        <h3 className="text-sm font-semibold text-foreground/90 mb-2.5">
                          {sub.title}
                        </h3>
                        <ul className="space-y-2">
                          {sub.items &&
                            sub.items.map((item: string, j: number) => (
                              <li
                                key={j}
                                className="flex items-start gap-2.5 text-sm text-muted-foreground"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-2" />
                                {item}
                              </li>
                            ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {section.items && !section.subsections && (
                  <ul className="space-y-2">
                    {section.items.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-sm text-muted-foreground"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-2" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

                {section.footer && (
                  <p className="text-sm text-muted-foreground leading-relaxed mt-4">
                    {section.footer}
                  </p>
                )}

                {section.contact && (
                  <div className="mt-4 bg-muted/50 rounded-xl border border-gray-100 p-4 space-y-1.5">
                    <p className="text-sm font-semibold text-foreground/90">
                      {section.contact.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Email:{" "}
                      <a
                        href={`mailto:${section.contact.email}`}
                        className="text-primary hover:underline"
                      >
                        {section.contact.email}
                      </a>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {section.contact.address}
                    </p>
                  </div>
                )}
              </div>
            ))}

            {/* Footer note */}
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5 text-center">
              <p className="text-xs text-primary leading-relaxed">
                By using SDE Jobs & Internships, you acknowledge that you have
                read and understood this Privacy Policy. For questions, contact{" "}
                <a
                  href="mailto:privacy@sdejobs.in"
                  className="font-semibold hover:underline"
                >
                  privacy@sdejobs.in
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-gray-100 py-5 mt-10">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground/80">
          <span>© {new Date().getFullYear()} SDE Jobs & Internships</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-primary font-medium">
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:text-primary transition-colors"
            >
              Terms & Conditions
            </Link>
            <Link
              href="/jobs"
              className="hover:text-primary transition-colors"
            >
              Browse Jobs
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
