import {
  Layers,
  FolderOpen,
  Star,
  Heart,
} from "lucide-react";
import type { Item, Collection } from "@/lib/mock-data";

interface StatsCardsProps {
  items: Item[];
  collections: Collection[];
}

const stats = [
  { label: "Total Items", icon: Layers, color: "#3b82f6" },
  { label: "Collections", icon: FolderOpen, color: "#22c55e" },
  { label: "Favorite Items", icon: Star, color: "#eab308" },
  { label: "Favorite Collections", icon: Heart, color: "#ec4899" },
];

export function StatsCards({ items, collections }: StatsCardsProps) {
  const values = [
    items.length,
    collections.length,
    items.filter((i) => i.isFavorite).length,
    collections.filter((c) => c.isFavorite).length,
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {stat.label}
              </span>
              <Icon className="h-4 w-4" style={{ color: stat.color }} />
            </div>
            <p className="mt-2 text-2xl font-bold">{values[i]}</p>
          </div>
        );
      })}
    </div>
  );
}
