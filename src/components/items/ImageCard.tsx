"use client";

import { Star, Pin } from "lucide-react";
import { useItemDrawer } from "@/components/items/ItemDrawerProvider";
import type { DashboardItem } from "@/lib/db/items";

interface ImageCardProps {
  item: DashboardItem;
}

export function ImageCard({ item }: ImageCardProps) {
  const { openItem } = useItemDrawer();

  return (
    <div
      className="group cursor-pointer overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-muted-foreground/30"
      onClick={() => openItem(item.id)}
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        {item.fileUrl ? (
          <img
            src={`/api/files/${item.fileUrl}`}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground/50">
            No preview
          </div>
        )}
        <div className="absolute right-2 top-2 flex items-center gap-1">
          {item.isPinned && (
            <span className="rounded-full bg-black/60 p-1">
              <Pin className="h-3 w-3 text-white" />
            </span>
          )}
          {item.isFavorite && (
            <span className="rounded-full bg-black/60 p-1">
              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
            </span>
          )}
        </div>
      </div>
      <div className="p-3">
        <h3 className="line-clamp-1 text-sm font-medium">{item.title}</h3>
        {item.tags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {item.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
