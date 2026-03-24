"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardCollection } from "@/lib/db/collections";

interface SidebarCollectionsProps {
  collections: DashboardCollection[];
}

export function SidebarCollections({ collections }: SidebarCollectionsProps) {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  const favorites = collections.filter((c) => c.isFavorite);
  const recents = collections.filter((c) => !c.isFavorite);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-sidebar-foreground"
      >
        Collections
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            !isOpen && "-rotate-90"
          )}
        />
      </button>

      {isOpen && (
        <div className="mt-1 flex flex-col gap-3">
          {favorites.length > 0 && (
            <div>
              <span className="px-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Favorites
              </span>
              <nav className="mt-1 flex flex-col gap-0.5">
                {favorites.map((collection) => {
                  const href = `/collections/${collection.id}`;
                  const isActive = pathname === href;

                  return (
                    <Link
                      key={collection.id}
                      href={href}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                      )}
                    >
                      <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                      {collection.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}

          {recents.length > 0 && (
            <div>
              <span className="px-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Recent
              </span>
              <nav className="mt-1 flex flex-col gap-0.5">
                {recents.map((collection) => {
                  const href = `/collections/${collection.id}`;
                  const isActive = pathname === href;

                  return (
                    <Link
                      key={collection.id}
                      href={href}
                      className={cn(
                        "flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full shrink-0"
                          style={{
                            backgroundColor: collection.dominantColor ?? "#6b7280",
                          }}
                        />
                        {collection.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {collection.itemCount}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}

          <Link
            href="/collections"
            className="px-2 text-xs text-muted-foreground hover:text-sidebar-foreground transition-colors"
          >
            View all collections →
          </Link>
        </div>
      )}
    </div>
  );
}
