"use client";

import { Search, Plus, PanelLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/dashboard/SidebarContext";

export function TopBar() {
  const { toggleSidebar, openMobile } = useSidebar();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border px-4">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            if (window.innerWidth < 768) {
              openMobile();
            } else {
              toggleSidebar();
            }
          }}
          className="text-muted-foreground"
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-xs font-bold text-white">
            D
          </div>
          <span className="text-sm font-semibold">DevStash</span>
        </div>
      </div>

      <div className="relative w-full max-w-sm mx-4">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search items..."
          className="h-8 pl-8 pr-12 text-sm"
        />
        <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-5 items-center gap-0.5 rounded border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="h-8 text-xs">
          <Plus className="mr-1 h-3.5 w-3.5" />
          New Item
        </Button>
      </div>
    </header>
  );
}
