import Link from "next/link";
import { ArrowRight, Gift, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReferralBanner() {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-6 relative overflow-hidden group hover:border-primary/30 hover:shadow-md transition-all">
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/5 rounded-full blur-2xl pointer-events-none group-hover:bg-primary/10 transition-colors duration-500" />
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10">
        <div className="flex gap-4 items-center">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
            <Gift className="text-primary" size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">
              Refer friends & earn rewards
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Introduce your friends to SDE Jobs. Earn credits for successful referrals and unlock Premium!
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:items-end gap-2 shrink-0 w-full sm:w-auto">
          <Link href="/account" className="w-full sm:w-auto">
            <Button className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-semibold shadow-sm flex items-center justify-center gap-2">
              Start Referring <ArrowRight size={14} />
            </Button>
          </Link>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-100">
            <Trophy size={11} /> 10 Credits = Premium
          </div>
        </div>
      </div>
    </div>
  );
}
