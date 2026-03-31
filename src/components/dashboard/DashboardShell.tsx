import { Sidebar } from "@/components/dashboard/Sidebar";
import type { SidebarItemType } from "@/lib/db/items";
import type { DashboardCollection } from "@/lib/db/collections";

interface SidebarUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface DashboardShellProps {
  children: React.ReactNode;
  sidebarItemTypes: SidebarItemType[];
  sidebarCollections: DashboardCollection[];
  user?: SidebarUser;
}

export function DashboardShell({
  children,
  sidebarItemTypes,
  sidebarCollections,
  user,
}: DashboardShellProps) {
  return (
    <div className="flex flex-1 overflow-hidden">
      <Sidebar itemTypes={sidebarItemTypes} collections={sidebarCollections} user={user} />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
