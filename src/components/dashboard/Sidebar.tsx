"use client";

import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/dashboard/SidebarContext";
import { SidebarTypes } from "@/components/dashboard/sidebar/SidebarTypes";
import { SidebarCollections } from "@/components/dashboard/sidebar/SidebarCollections";
import { SidebarUser } from "@/components/dashboard/sidebar/SidebarUser";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import type { SidebarItemType } from "@/lib/db/items";
import type { DashboardCollection } from "@/lib/db/collections";

interface SidebarUserData {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface SidebarProps {
  itemTypes: SidebarItemType[];
  collections: DashboardCollection[];
  user?: SidebarUserData;
}

function SidebarContent({ itemTypes, collections, user }: SidebarProps) {
  return (
    <>
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-2 py-3">
        <SidebarTypes itemTypes={itemTypes} />
        <SidebarCollections collections={collections} />
      </div>
      {user && (
        <div className="border-t border-sidebar-border px-2 py-2">
          <SidebarUser user={user} />
        </div>
      )}
    </>
  );
}

export function Sidebar({ itemTypes, collections, user }: SidebarProps) {
  const { isCollapsed, isMobileOpen, closeMobile } = useSidebar();

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out md:flex",
          isCollapsed ? "w-0 overflow-hidden" : "w-60"
        )}
      >
        <div className="flex h-full flex-col overflow-hidden whitespace-nowrap">
          <SidebarContent itemTypes={itemTypes} collections={collections} user={user} />
        </div>
      </aside>

      {/* Mobile drawer */}
      <Sheet open={isMobileOpen} onOpenChange={(open) => !open && closeMobile()}>
        <SheetContent
          side="left"
          showCloseButton={true}
          className="w-60 bg-sidebar p-0 text-sidebar-foreground sm:max-w-60"
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-full flex-col">
            <SidebarContent itemTypes={itemTypes} collections={collections} user={user} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
