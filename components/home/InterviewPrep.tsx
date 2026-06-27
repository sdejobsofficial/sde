const companiesInterviews = [
  {
    name: "TechCorp",
    count: "816 Interviews",
    initial: "T",
    color: "bg-primary/20 text-primary/90",
  },
  {
    name: "InnovateCo",
    count: "1.6K+ Interviews",
    initial: "I",
    color: "bg-teal-100 text-teal-700",
  },
  {
    name: "AcceNet",
    count: "2K+ Interviews",
    initial: "A",
    color: "bg-purple-100 text-purple-700",
  },
  {
    name: "Amazen",
    count: "1.7K+ Interviews",
    initial: "A",
    color: "bg-orange-100 text-orange-700",
  },
  {
    name: "CloudSys",
    count: "2.5K+ Interviews",
    initial: "C",
    color: "bg-red-100 text-red-700",
  },
  {
    name: "FlipStore",
    count: "488 Interviews",
    initial: "F",
    color: "bg-yellow-100 text-yellow-700",
  },
];

const roles = [
  { title: "Software Engineer", count: "7.2K+ questions" },
  { title: "Business Analyst", count: "2.8K+ questions" },
  { title: "Consultant", count: "2.4K+ questions" },
  { title: "Financial Analyst", count: "894 questions" },
  { title: "Sales & Marketing", count: "991 questions" },
  { title: "Quality Engineer", count: "1.3K+ questions" },
];

export default function InterviewPrep() {
  return (
    <section className="py-16 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6 items-stretch">
          {/* Left Banner */}
          <div className="lg:w-64 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 flex flex-col justify-center border border-border shadow-sm hover:shadow-md transition-all">
            <h3 className="text-2xl font-bold text-foreground leading-tight">
              Prepare for your next interview
            </h3>
            <p className="text-xs text-muted-foreground mt-2">by AmbitionBox</p>
          </div>

          {/* Interview questions by company */}
          <div className="flex-1 border border-border rounded-2xl p-6 shadow-sm bg-card">
            <h4 className="font-semibold text-foreground mb-4">
              Interview questions by company
            </h4>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {companiesInterviews.map((c) => (
                <button
                  key={c.name}
                  className="flex items-center gap-3 p-3 border border-border rounded-xl hover:border-primary/30 hover:bg-primary/5 transition-all group"
                >
                  <div
                    className={`w-8 h-8 rounded-lg ${c.color} flex items-center justify-center font-bold text-[10px]`}
                  >
                    {c.initial}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {c.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{c.count}</p>
                  </div>
                  <span className="ml-auto text-muted-foreground/30 text-xs">›</span>
                </button>
              ))}
            </div>
            <button className="text-primary text-sm font-medium hover:underline">
              View all companies ›
            </button>
          </div>

          {/* Interview questions by role */}
          <div className="flex-1 border border-border rounded-2xl p-6 shadow-sm bg-card">
            <h4 className="font-semibold text-foreground mb-4">
              Interview questions by role
            </h4>
            <div className="flex flex-col gap-3 mb-4">
              {roles.map((r) => (
                <div
                  key={r.title}
                  className="flex justify-between items-center py-2 border-b border-border last:border-0 hover:text-primary cursor-pointer group"
                >
                  <span className="text-sm text-foreground group-hover:text-primary font-medium transition-colors">
                    {r.title}
                  </span>
                  <span className="text-xs text-muted-foreground/60">({r.count})</span>
                </div>
              ))}
            </div>
            <button className="text-primary text-sm font-medium hover:underline">
              View all roles ›
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
