import Link from "next/link";
import Image from "next/image";

const roles = [
  { title: "Full Stack Developer", count: "23.5K+ Jobs" },
  { title: "Mobile / App Developer", count: "2.9K+ Jobs" },
  { title: "Front End Developer", count: "5.5K+ Jobs" },
  { title: "DevOps Engineer", count: "3K+ Jobs" },
  { title: "Engineering Manager", count: "1.7K+ Jobs" },
  { title: "Technical Lead", count: "10.4K+ Jobs" },
];

export default function CampusAndRoles() {
  return (
    <section className="py-16 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Campus Banner */}
        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 mb-14 flex flex-col md:flex-row items-start md:items-center gap-6 relative overflow-hidden shadow-sm hover:shadow-md transition-all">
          <div className="absolute top-4 right-4 bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full border border-primary/20">
            Just launched
          </div>
          <div className="px-5 py-5 shrink-0 border-b md:border-b-0 md:border-r border-border">
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
          <div className="flex-1">
            <h3 className="text-xl font-bold text-foreground mb-1">
              Introducing a career platform for college students & fresh grads
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Explore contests, webinars, take aptitude tests, prepare for your
              dream career & find jobs & internships
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                "Expert speak",
                "Contests",
                "NCAT",
                "Pathfinder",
                "Jobs & Internships",
              ].map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1.5 border border-border rounded-full text-muted-foreground hover:border-primary/50 hover:text-primary cursor-pointer transition-colors bg-card shadow-sm"
                >
                  {tag} ›
                </span>
              ))}
            </div>
          </div>
          <button className="bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 whitespace-nowrap">
            Explore now
          </button>
        </div>

        {/* Popular Roles */}
        <div className="flex flex-col md:flex-row gap-0 items-stretch bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          {/* Left illustration */}
          <div className="md:w-72 bg-gradient-to-br from-primary/10 to-primary/5 p-10 flex flex-col justify-center border-b md:border-b-0 md:border-r border-border">
            <h3 className="text-2xl font-bold text-foreground mb-2 leading-tight">
              Discover jobs across popular roles
            </h3>
            <p className="text-sm text-muted-foreground">
              Select a role and we&apos;ll show you relevant jobs for it!
            </p>
          </div>

          {/* Right roles grid */}
          <div className="flex-1 p-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {roles.map((role) => (
              <button
                key={role.title}
                className="text-left p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all group"
              >
                <p className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm">
                  {role.title}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">{role.count} ›</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
