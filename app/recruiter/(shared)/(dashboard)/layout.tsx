import { ReactNode } from "react";
import CompanyHeader from "@/components/company/CompanyHeader";
import CompanySidebar from "@/components/company/CompanySidebar";

export default function CompanyDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex h-screen bg-muted/50 overflow-hidden">
      <CompanySidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <CompanyHeader />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
