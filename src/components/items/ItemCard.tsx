"use client";

import { Star, Pin } from "lucide-react";
import { getIcon } from "@/lib/icons";
import { useItemDrawer } from "@/components/items/ItemDrawerProvider";
import { formatDateShort } from "@/lib/utils";
import type { DashboardItem } from "@/lib/db/items";

interface ItemCardProps {
  item: DashboardItem;
}

export function ItemCard({ item }: ItemCardProps) {
  const TypeIcon = getIcon(item.type.icon ?? "file");
  const color = item.type.color ?? "#6366f1";
  const { openItem } = useItemDrawer();

  return (
    <div
      className="cursor-pointer rounded-lg border border-border border-l-2 bg-card p-4 transition-colors hover:border-muted-foreground/30"
      style={{ borderLeftColor: color }}
      onClick={() => openItem(item.id)}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${color}20` }}
          >
            <TypeIcon className="h-4 w-4" style={{ color }} />
          </div>
          <h3 className="line-clamp-1 font-medium">{item.title}</h3>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {item.isPinned && (
            <Pin className="h-3 w-3 text-muted-foreground" />
          )}
          {item.isFavorite && (
            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
          )}
        </div>
      </div>

      {item.description && (
        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
          {item.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        {item.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                {tag.name}
              </span>
            ))}
          </div>
        ) : (
          <div />
        )}
        <span className="shrink-0 text-xs text-muted-foreground">
          {formatDateShort(item.createdAt)}
        </span>
      </div>
    </div>
  );
}
