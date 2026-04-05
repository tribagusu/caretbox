import { SidebarProvider } from "@/components/dashboard/SidebarContext";
import { ItemDrawerProvider } from "@/components/items/ItemDrawerProvider";
import { TopBar } from "@/components/dashboard/TopBar";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getSystemItemTypes } from "@/lib/db/items";
import { getRecentCollections } from "@/lib/db/collections";
import { auth } from "@/auth";

export default async function ItemsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  const [sidebarItemTypes, sidebarCollections] = userId
    ? await Promise.all([
        getSystemItemTypes(userId),
        getRecentCollections(userId),
      ])
    : [[], []];

  return (
    <SidebarProvider>
      <ItemDrawerProvider>
        <div className="flex h-screen flex-col">
          <TopBar itemTypes={sidebarItemTypes} />
          <DashboardShell
            sidebarItemTypes={sidebarItemTypes}
            sidebarCollections={sidebarCollections}
            user={session?.user}
          >
            {children}
          </DashboardShell>
        </div>
      </ItemDrawerProvider>
    </SidebarProvider>
  );
}
