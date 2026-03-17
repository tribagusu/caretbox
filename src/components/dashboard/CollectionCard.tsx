import { Star, MoreHorizontal } from "lucide-react";
import { getIcon } from "@/lib/icons";
import type { Collection } from "@/lib/mock-data";

interface CollectionCardProps {
  collection: Collection;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  return (
    <div className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-muted-foreground/30">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">{collection.name}</h3>
          {collection.isFavorite && (
            <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
          )}
        </div>
        <button className="rounded-md p-1 opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100">
          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
      <p className="mt-0.5 text-sm text-muted-foreground">
        {collection.itemCount} items
      </p>
      {collection.description && (
        <p className="mt-2 text-sm text-muted-foreground/80">
          {collection.description}
        </p>
      )}
      <div className="mt-3 flex items-center gap-1.5">
        {collection.typeIcons.map((iconName) => {
          const Icon = getIcon(iconName);
          return (
            <Icon
              key={iconName}
              className="h-3.5 w-3.5 text-muted-foreground"
            />
          );
        })}
      </div>
    </div>
  );
}
