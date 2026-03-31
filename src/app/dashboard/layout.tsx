import { SidebarProvider } from "@/components/dashboard/SidebarContext";
import { TopBar } from "@/components/dashboard/TopBar";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getSystemItemTypes } from "@/lib/db/items";
import { getRecentCollections } from "@/lib/db/collections";
import { auth } from "@/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarItemTypes, sidebarCollections, session] = await Promise.all([
    getSystemItemTypes(),
    getRecentCollections(),
    auth(),
  ]);

  return (
    <SidebarProvider>
      <div className="flex h-screen flex-col">
        <TopBar />
        <DashboardShell
          sidebarItemTypes={sidebarItemTypes}
          sidebarCollections={sidebarCollections}
          user={session?.user}
        >
          {children}
        </DashboardShell>
      </div>
    </SidebarProvider>
  );
}
