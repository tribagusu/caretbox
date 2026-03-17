import { SidebarProvider } from "@/components/dashboard/SidebarContext";
import { TopBar } from "@/components/dashboard/TopBar";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen flex-col">
        <TopBar />
        <DashboardShell>{children}</DashboardShell>
      </div>
    </SidebarProvider>
  );
}
