export default function PremiumServices() {
  return (
    <section className="py-16 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Premium Banner */}
        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 mb-8 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
          <div className="absolute top-4 right-4 bg-muted text-muted-foreground text-[10px] px-3 py-1 rounded-full font-bold">
            by SDE Jobs & Internships
          </div>
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
            <span className="text-3xl drop-shadow-sm">📄</span>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-foreground mb-1 leading-tight">
              Unlock premium benefits and career guidance
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upgrade to premium for ₹499/3 months to get full access to premium resources,
              priority support, and advanced career guidance tools to accelerate your journey.
            </p>
            <div className="flex flex-wrap gap-2">
              {["Priority support", "Career guidance tools", "Premium resources"].map(
                (s) => (
                  <span
                    key={s}
                    className="text-xs px-3 py-1.5 border border-border rounded-full text-muted-foreground hover:border-primary/50 hover:text-primary cursor-pointer transition-colors bg-card shadow-sm"
                  >
                    ⚡ {s} ›
                  </span>
                ),
              )}
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <button className="bg-primary text-primary-foreground px-7 py-3 rounded-full text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
              Explore Premium
            </button>
            <span className="text-[10px] text-muted-foreground/60">
              ₹499 for 3 months
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
