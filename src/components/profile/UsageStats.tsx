import { getIcon } from "@/lib/icons";
import type { ProfileStats } from "@/lib/db/profile";

interface UsageStatsProps {
  stats: ProfileStats;
}

export function UsageStats({ stats }: UsageStatsProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
        Usage
      </h3>
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div className="rounded-md border border-border bg-background p-4 text-center">
          <div className="text-2xl font-bold text-foreground">
            {stats.totalItems}
          </div>
          <div className="text-sm text-muted-foreground">Items</div>
        </div>
        <div className="rounded-md border border-border bg-background p-4 text-center">
          <div className="text-2xl font-bold text-foreground">
            {stats.totalCollections}
          </div>
          <div className="text-sm text-muted-foreground">Collections</div>
        </div>
      </div>

      {stats.itemsByType.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            By Type
          </h4>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {stats.itemsByType.map((type) => {
              const Icon = getIcon(type.icon || "file");
              return (
                <div
                  key={type.name}
                  className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2"
                >
                  <Icon
                    className="h-4 w-4 shrink-0"
                    style={{ color: type.color || undefined }}
                  />
                  <span className="truncate text-sm text-foreground">
                    {type.name}
                  </span>
                  <span className="ml-auto text-sm font-medium text-muted-foreground">
                    {type.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
