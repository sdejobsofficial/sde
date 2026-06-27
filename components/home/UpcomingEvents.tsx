const events = [
  {
    title: "Zero to Data Analyst: Google Analyst Roadmap for 30L+ CTC",
    org: "Coding Ninjas",
    tags: ["Interview Preparation", "Career Guidance", "Data"],
    date: "8 May, 5:00 PM",
    enrolled: "87 Enrolled",
    closing: "Entry closes in 20h",
  },
  {
    title: "Top GenAI Skills to crack 30 LPA+ roles at Amazon & Google",
    org: "Coding Ninjas",
    tags: ["Interview Preparation", "Career Guidance"],
    date: "7 May, 8:30 PM",
    enrolled: "100 Enrolled",
    closing: "Entry closes in 5m",
  },
  {
    title: "Mastering System Design for SDE-II and Above",
    org: "AlgoUniversity",
    tags: ["System Design", "Career Guidance"],
    date: "9 May, 6:00 PM",
    enrolled: "54 Enrolled",
    closing: "Entry closes in 2d",
  },
];

export default function UpcomingEvents() {
  return (
    <section className="py-12 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:gap-10 md:items-start">
          <div className="mb-6 md:mb-0 md:w-64 md:flex-shrink-0 md:pt-1">
            <h2 className="text-2xl font-medium text-foreground leading-snug">
              Upcoming events and challenges
            </h2>
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:hidden">
              {events.map((e, i) => (
                <EventCard key={i} event={e} />
              ))}
            </div>

            <div className="hidden lg:flex gap-5 overflow-x-auto pb-2 scrollbar-hide">
              {events.map((e, i) => (
                <div
                  key={i}
                  className="min-w-[280px] max-w-[300px] flex-shrink-0"
                >
                  <EventCard event={e} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function EventCard({ event: e }: { event: (typeof events)[0] }) {
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-full group">
      <div className="relative h-36 bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-500 shadow-inner">
        <span className="text-primary-foreground text-4xl drop-shadow-lg">🎓</span>
        <div className="absolute top-3 left-3 bg-card/90 backdrop-blur-sm text-foreground text-[10px] font-bold px-2.5 py-1 rounded-full border border-border shadow-sm">
          {e.closing}
        </div>
        <div className="absolute top-3 right-3 bg-primary/20 backdrop-blur-sm text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded-full border border-primary/30">
          Webinar
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start gap-2 mb-2">
          <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-primary-foreground text-[10px] font-bold flex-shrink-0 mt-0.5 shadow-sm">
            C
          </div>
          <p className="font-semibold text-foreground text-sm leading-snug line-clamp-2">
            {e.title}
          </p>
        </div>
        <p className="text-[11px] text-muted-foreground mb-3">{e.org}</p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {e.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] bg-muted border border-border text-muted-foreground px-2 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-auto">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground/60 mb-4">
            <span>📅 {e.date}</span>
            <span>👤 {e.enrolled}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[10px] text-primary font-bold">
              ✨ Learn from experts
            </span>
            <button className="text-primary text-xs font-bold hover:underline">
              View details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
