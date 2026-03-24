"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { getIcon } from "@/lib/icons";
import type { SidebarItemType } from "@/lib/db/items";

interface SidebarTypesProps {
  itemTypes: SidebarItemType[];
}

export function SidebarTypes({ itemTypes }: SidebarTypesProps) {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-sidebar-foreground"
      >
        Types
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            !isOpen && "-rotate-90"
          )}
        />
      </button>

      {isOpen && (
        <nav className="mt-1 flex flex-col gap-0.5">
          {itemTypes.map((type) => {
            const Icon = getIcon(type.icon ?? "file");
            const href = `/items/${type.name.toLowerCase()}`;
            const isActive = pathname === href;

            return (
              <Link
                key={type.id}
                href={href}
                className={cn(
                  "flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <span className="flex items-center gap-2">
                  <Icon className="h-4 w-4" style={{ color: type.color ?? undefined }} />
                  {type.name}
                </span>
                <span className="text-xs text-muted-foreground">{type.count}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
