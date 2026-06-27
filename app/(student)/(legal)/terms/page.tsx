import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, FileText } from "lucide-react";

const LAST_UPDATED = "May 12, 2026";

// ─── Types ────────────────────────────────────────────────────────────────

interface TermsSubsection {
  title: string;
  content?: string;
  items?: string[];
}

interface TermsContactInfo {
  name: string;
  email: string;
  support: string;
  address: string;
}

interface TermsSection {
  id: string;
  title: string;
  content?: string[];
  items?: string[];
  subsections?: TermsSubsection[];
  contact?: TermsContactInfo;
}

// ─── Data ─────────────────────────────────────────────────────────────────

const SECTIONS: TermsSection[] = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    content: [
      `Welcome to SDE Jobs & Internships ("Platform"), operated by SDE Jobs & Internships ("Company", "we", "us", or "our"). These Terms and Conditions ("Terms") govern your access to and use of the Platform, including our website, mobile applications, and all associated services.`,
      `By creating an account, accessing, or using the Platform in any way, you agree to be bound by these Terms and our Privacy Policy, which is incorporated herein by reference. If you do not agree to these Terms, you must not use the Platform.`,
      `We reserve the right to modify these Terms at any time. Material changes will be communicated via email or a prominent notice on the Platform at least 14 days before they take effect. Continued use of the Platform after the effective date constitutes acceptance of the revised Terms.`,
    ],
  },
  {
    id: "eligibility",
    title: "2. Eligibility",
    items: [
      "You must be at least 18 years of age to use the Platform.",
      "You must be a resident of India or be authorised to work in India.",
      "If you are accessing the Platform on behalf of a company, you represent that you have the authority to bind the company to these Terms.",
      "You must not have been previously suspended or removed from the Platform.",
      "You must provide accurate, current, and complete information when creating your account.",
    ],
  },
  {
    id: "accounts",
    title: "3. User Accounts",
    subsections: [
      {
        title: "3.1 Account types",
        content: `The Platform supports two account types: Job Seeker accounts and Company accounts. Each account type has distinct features, permissions, and obligations as described in these Terms.`,
      },
      {
        title: "3.2 Account security",
        items: [
          "You are responsible for maintaining the confidentiality of your login credentials.",
          "You must notify us immediately at support@sdejobs.in if you suspect unauthorised access.",
          "You are responsible for all activities that occur under your account.",
          "We are not liable for any loss resulting from unauthorised access due to your failure to protect your credentials.",
        ],
      },
      {
        title: "3.3 Account accuracy",
        items: [
          "You must keep your profile information accurate and up to date.",
          "Impersonating another person or entity is strictly prohibited.",
          "Creating multiple accounts to circumvent restrictions or bans is prohibited.",
        ],
      },
    ],
  },
  {
    id: "job-seeker",
    title: "4. Job Seeker Terms",
    subsections: [
      {
        title: "4.1 Profile and applications",
        items: [
          "You may create one job seeker profile on the Platform.",
          "Information you provide in your profile and applications must be truthful and accurate.",
          "Misrepresenting your qualifications, experience, or identity may result in immediate account termination.",
          "By submitting an application, you consent to the hiring company receiving and processing your application data.",
        ],
      },
      {
        title: "4.2 Free plan limitations",
        items: [
          "Free plan users have limited access to platform features.",
          "Free plan users receive basic career guidance and resources.",
          "Free plan users can access free content only.",
          "Premium features are not available on the free plan.",
        ],
      },
      {
        title: "4.3 Premium plan",
        items: [
          "Premium subscribers gain full access to all premium features and resources.",
          "Premium subscribers receive access to premium content and priority support.",
          "Premium subscribers get access to premium career guidance tools.",
          "Premium plans are valid for 3 months or 12 months as selected at checkout.",
          "Premium status takes effect immediately upon successful payment processing.",
          "We reserve the right to modify premium features with reasonable advance notice.",
        ],
      },
    ],
  },
  {
    id: "company",
    title: "5. Company Terms",
    subsections: [
      {
        title: "5.1 Job postings",
        items: [
          "Companies may post job openings that are genuine, current, and comply with applicable employment laws.",
          "Job postings must not discriminate on the basis of caste, religion, sex, gender, nationality, disability, or any other protected characteristic.",
          "Postings for illegal roles, multi-level marketing schemes, or positions requiring upfront payments from candidates are prohibited.",
          "All job postings are subject to review and approval by SDE Jobs & Internships administrators.",
          "We reserve the right to remove any posting that violates these Terms or applicable law.",
        ],
      },
      {
        title: "5.2 Candidate data",
        items: [
          "You may use candidate data received through the Platform solely for evaluating candidates for the specific role they applied to.",
          "You must not use candidate data for marketing, unsolicited outreach unrelated to the application, or selling to third parties.",
          "You must comply with all applicable data protection laws when processing candidate data.",
          "Candidate data must be securely deleted within 6 months if no employment decision is made.",
        ],
      },
      {
        title: "5.3 Verification",
        items: [
          "Company profiles may be submitted for verification by SDE Jobs & Internships administrators.",
          "Verification does not constitute endorsement of the company or its practices.",
          "Providing false information during verification is grounds for immediate account termination.",
        ],
      },
    ],
  },
  {
    id: "referrals",
    title: "6. Referral System",
    items: [
      "The referral feature allows job seekers to request introductions to hiring companies through other users of the Platform.",
      "Referrers are under no obligation to provide a referral and may decline at their discretion.",
      "Referrals are informal introductions and do not constitute a guarantee of employment or an endorsement.",
      "Referral bonuses, if offered by a company, are solely the company's responsibility. SDE Jobs & Internships makes no representations about the payment of such bonuses.",
      "Misuse of the referral system, including fabricating referrals or creating fake connections, is prohibited and may result in account suspension.",
    ],
  },
  {
    id: "payments",
    title: "7. Payments and Subscriptions",
    subsections: [
      {
        title: "7.1 Payment processing",
        content: `All payments are processed by Dodo Payments. By subscribing to a paid plan, you agree to Dodo Payments' terms and authorise them to charge your payment method for the applicable fees.`,
      },
      {
        title: "7.2 Subscription terms",
        items: [
          "Subscriptions are billed on a 3-month or annual basis as selected at checkout.",
          "Subscriptions renew automatically unless cancelled before the renewal date.",
          "You may cancel your subscription at any time from your account settings.",
          "Cancellation takes effect at the end of the current billing period.",
        ],
      },
      {
        title: "7.3 Refunds",
        items: [
          "Annual subscriptions may be refunded within 7 days of the initial purchase if the Platform has not been materially used.",
          "3-month subscriptions are non-refundable.",
          "Refund requests should be submitted to billing@sdejobs.in.",
          "We reserve the right to decline refund requests where there is evidence of policy abuse.",
        ],
      },
    ],
  },
  {
    id: "prohibited",
    title: "8. Prohibited Conduct",
    content: [
      "You agree not to engage in any of the following on or through the Platform:",
    ],
    items: [
      "Posting false, misleading, or fraudulent content, profiles, or job listings.",
      "Scraping, crawling, or extracting data from the Platform using automated tools without our written permission.",
      "Attempting to gain unauthorised access to any part of the Platform or other users' accounts.",
      "Transmitting malware, viruses, or any code designed to disrupt or damage the Platform.",
      "Harassing, threatening, or discriminating against other users.",
      "Using the Platform for any unlawful purpose or in violation of applicable laws.",
      "Reverse engineering, decompiling, or attempting to extract source code from the Platform.",
      "Circumventing any rate limits, application limits, or other access controls.",
      "Creating fake accounts, reviews, or referrals to artificially boost a profile or company.",
    ],
  },
  {
    id: "intellectual-property",
    title: "9. Intellectual Property",
    content: [
      `The Platform, including its design, code, content, trademarks, logos, and all related materials, is owned by or licensed to SDE Jobs & Internships and is protected by intellectual property laws.`,
      `You are granted a limited, non-exclusive, non-transferable, revocable licence to access and use the Platform solely for its intended purpose. You may not copy, modify, distribute, sell, or create derivative works of any Platform content without our prior written consent.`,
      `By submitting content to the Platform (such as profile information, job descriptions, or messages), you grant us a worldwide, royalty-free licence to use, display, and transmit that content as necessary to provide the Platform's services.`,
    ],
  },
  {
    id: "disclaimer",
    title: "10. Disclaimers and Limitation of Liability",
    subsections: [
      {
        title: "10.1 No employment guarantee",
        content: `SDE Jobs & Internships is a platform connecting job seekers and companies. We do not guarantee that use of the Platform will result in employment, referrals, or the hiring of suitable candidates. All employment decisions are made solely by the hiring companies.`,
      },
      {
        title: "10.2 Platform availability",
        content: `The Platform is provided "as is" and "as available" without warranties of any kind, express or implied. We do not warrant that the Platform will be uninterrupted, error-free, or free of harmful components.`,
      },
      {
        title: "10.3 Limitation of liability",
        content: `To the maximum extent permitted by law, SDE Jobs & Internships shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the Platform. Our total aggregate liability shall not exceed the amount you paid to us in the 12 months preceding the claim.`,
      },
    ],
  },
  {
    id: "indemnification",
    title: "11. Indemnification",
    content: [
      `You agree to indemnify, defend, and hold harmless SDE Jobs & Internships and its officers, directors, employees, and agents from and against any claims, damages, losses, and expenses (including reasonable legal fees) arising from: (a) your use of the Platform; (b) your violation of these Terms; (c) your violation of any applicable law; or (d) content you submit to the Platform.`,
    ],
  },
  {
    id: "termination",
    title: "12. Termination",
    content: [
      `We may suspend or terminate your account and access to the Platform at any time, with or without notice, for any reason including but not limited to breach of these Terms, fraudulent activity, or prolonged inactivity.`,
      `You may terminate your account at any time by contacting us at support@sdejobs.in or through your account settings. Upon termination, your right to use the Platform ceases immediately. Provisions that by their nature should survive termination (including intellectual property, disclaimers, and indemnification) shall survive.`,
    ],
  },
  {
    id: "governing-law",
    title: "13. Governing Law and Dispute Resolution",
    content: [
      `These Terms are governed by the laws of India. Any disputes arising out of or relating to these Terms or the Platform shall first be attempted to be resolved through good-faith negotiation between the parties.`,
      `If negotiation fails, disputes shall be submitted to binding arbitration in Bengaluru, Karnataka, under the Arbitration and Conciliation Act, 1996. The arbitration shall be conducted in English. Each party shall bear its own costs unless the arbitrator determines otherwise.`,
      `Nothing in this clause shall prevent either party from seeking urgent injunctive or other equitable relief from a court of competent jurisdiction.`,
    ],
  },
  {
    id: "miscellaneous",
    title: "14. Miscellaneous",
    items: [
      "Entire Agreement: These Terms, together with the Privacy Policy, constitute the entire agreement between you and SDE Jobs & Internships with respect to the Platform.",
      "Severability: If any provision of these Terms is found to be unenforceable, that provision shall be modified to the minimum extent necessary to make it enforceable, and the remaining provisions shall remain in full force.",
      "Waiver: Our failure to enforce any right or provision of these Terms shall not constitute a waiver of that right or provision.",
      "Assignment: You may not assign your rights or obligations under these Terms without our prior written consent. We may assign our rights without restriction.",
      "Force Majeure: We shall not be liable for any failure or delay in performance due to causes beyond our reasonable control.",
    ],
  },
  {
    id: "contact",
    title: "15. Contact Us",
    content: ["If you have questions about these Terms, please contact us:"],
    contact: {
      name: "SDE Jobs & Internships",
      email: "legal@sdejobs.in",
      support: "support@sdejobs.in",
      address: "Bengaluru, Karnataka, India",
    },
  },
];

// ─── Section renderer (typed, no any) ────────────────────────────────────

function SectionBody({ section }: { section: TermsSection }) {
  return (
    <>
      {section.content && (
        <div className="space-y-3 mb-4">
          {section.content.map((para, i) => (
            <p key={i} className="text-sm text-muted-foreground leading-relaxed">
              {para}
            </p>
          ))}
        </div>
      )}

      {section.subsections && (
        <div className="space-y-5">
          {section.subsections.map((sub) => (
            <div key={sub.title} className="pl-4 border-l-2 border-primary/20">
              <h3 className="text-sm font-semibold text-foreground/90 mb-2">
                {sub.title}
              </h3>
              {sub.content && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {sub.content}
                </p>
              )}
              {sub.items && (
                <ul className="space-y-2 mt-2">
                  {sub.items.map((item, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-2.5 text-sm text-muted-foreground"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* items-only sections (no subsections) */}
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

      {section.contact && (
        <div className="mt-4 bg-muted/50 rounded-xl border border-gray-100 p-4 space-y-1.5">
          <p className="text-sm font-semibold text-foreground/90">
            {section.contact.name}
          </p>
          <p className="text-sm text-muted-foreground">
            Legal:{" "}
            <a
              href={`mailto:${section.contact.email}`}
              className="text-primary hover:underline"
            >
              {section.contact.email}
            </a>
          </p>
          <p className="text-sm text-muted-foreground">
            Support:{" "}
            <a
              href={`mailto:${section.contact.support}`}
              className="text-primary hover:underline"
            >
              {section.contact.support}
            </a>
          </p>
          <p className="text-sm text-muted-foreground">{section.contact.address}</p>
        </div>
      )}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default function TermsAndConditionsPage() {
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
          {/* Sticky ToC */}
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

          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Page header card */}
            <div className="bg-card rounded-2xl border border-gray-100 shadow-sm p-7">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <FileText className="text-primary" size={20} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground tracking-tight">
                    Terms and Conditions
                  </h1>
                  <p className="text-xs text-muted-foreground/80 mt-0.5">
                    Last updated: {LAST_UPDATED}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                Please read these Terms and Conditions carefully before using
                SDE Jobs & Internships. By using our platform, you agree to be
                bound by these terms. If you disagree with any part of these
                terms, you may not use our services.
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
                <SectionBody section={section} />
              </div>
            ))}

            {/* Footer note */}
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5 text-center">
              <p className="text-xs text-primary leading-relaxed">
                By using SDE Jobs & Internships, you confirm that you are at
                least 18 years old and have read, understood, and agree to these
                Terms and Conditions. For questions, contact{" "}
                <a
                  href="mailto:legal@sdejobs.in"
                  className="font-semibold hover:underline"
                >
                  legal@sdejobs.in
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
            <Link
              href="/privacy"
              className="hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-primary font-medium">
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
