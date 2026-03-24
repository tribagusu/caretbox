import { Sidebar } from "@/components/dashboard/Sidebar";
import type { SidebarItemType } from "@/lib/db/items";
import type { DashboardCollection } from "@/lib/db/collections";

interface DashboardShellProps {
  children: React.ReactNode;
  sidebarItemTypes: SidebarItemType[];
  sidebarCollections: DashboardCollection[];
}

export function DashboardShell({
  children,
  sidebarItemTypes,
  sidebarCollections,
}: DashboardShellProps) {
  return (
    <div className="flex flex-1 overflow-hidden">
      <Sidebar itemTypes={sidebarItemTypes} collections={sidebarCollections} />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
