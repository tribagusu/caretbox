import { Star, Pin } from "lucide-react";
import { getIcon } from "@/lib/icons";
import { itemTypes } from "@/lib/mock-data";
import type { Item } from "@/lib/mock-data";

interface ItemRowProps {
  item: Item;
}

export function ItemRow({ item }: ItemRowProps) {
  const itemType = itemTypes.find((t) => t.id === item.typeId);
  const TypeIcon = getIcon(itemType?.icon ?? "file");

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-muted-foreground/30">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${itemType?.color ?? "#6366f1"}20` }}
      >
        <TypeIcon
          className="h-4 w-4"
          style={{ color: itemType?.color ?? "#6366f1" }}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="truncate font-medium">{item.title}</h4>
          {item.isPinned && (
            <Pin className="h-3 w-3 shrink-0 text-muted-foreground" />
          )}
          {item.isFavorite && (
            <Star className="h-3 w-3 shrink-0 fill-yellow-500 text-yellow-500" />
          )}
        </div>
        {item.description && (
          <p className="truncate text-sm text-muted-foreground">
            {item.description}
          </p>
        )}
      </div>

      {item.tags.length > 0 && (
        <div className="hidden items-center gap-1.5 md:flex">
          {item.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      <span className="shrink-0 text-xs text-muted-foreground">
        {new Date(item.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}
      </span>
    </div>
  );
}
