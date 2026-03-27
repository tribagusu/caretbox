import { SidebarProvider } from "@/components/dashboard/SidebarContext";
import { TopBar } from "@/components/dashboard/TopBar";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getSystemItemTypes } from "@/lib/db/items";
import { getRecentCollections } from "@/lib/db/collections";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarItemTypes, sidebarCollections] = await Promise.all([
    getSystemItemTypes(),
    getRecentCollections(),
  ]);

  return (
    <SidebarProvider>
      <div className="flex h-screen flex-col">
        <TopBar />
        <DashboardShell
          sidebarItemTypes={sidebarItemTypes}
          sidebarCollections={sidebarCollections}
        >
          {children}
        </DashboardShell>
      </div>
    </SidebarProvider>
  );
}
