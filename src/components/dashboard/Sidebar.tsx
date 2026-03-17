"use client";

import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/dashboard/SidebarContext";
import { SidebarTypes } from "@/components/dashboard/sidebar/SidebarTypes";
import { SidebarCollections } from "@/components/dashboard/sidebar/SidebarCollections";
import { SidebarUser } from "@/components/dashboard/sidebar/SidebarUser";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { itemTypes, collections, currentUser } from "@/lib/mock-data";

function SidebarContent() {
  return (
    <>
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-2 py-3">
        <SidebarTypes itemTypes={itemTypes} />
        <SidebarCollections collections={collections} />
      </div>
      <div className="border-t border-sidebar-border px-2 py-2">
        <SidebarUser user={currentUser} />
      </div>
    </>
  );
}

export function Sidebar() {
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
          <SidebarContent />
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
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
