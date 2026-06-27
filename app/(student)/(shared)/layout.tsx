import NotificationPopup from "@/components/student/shared/NotificationPopup";
import StudentHeader from "@/components/student/shared/StudentHeader";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <StudentHeader />
      <NotificationPopup />
      <main className="flex-1">{children}</main>
    </div>
  );
}
