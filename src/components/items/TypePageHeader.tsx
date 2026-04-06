"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getIcon } from "@/lib/icons";
import { CreateItemDialog } from "@/components/items/CreateItemDialog";
import type { SidebarItemType } from "@/lib/db/items";

interface TypePageHeaderProps {
  itemType: SidebarItemType;
  itemTypes: SidebarItemType[];
  itemCount: number;
}

export function TypePageHeader({
  itemType,
  itemTypes,
  itemCount,
}: TypePageHeaderProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const TypeIcon = getIcon(itemType.icon ?? "file");
  const color = itemType.color ?? "#6366f1";

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${color}20` }}
        >
          <TypeIcon className="h-5 w-5" style={{ color }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{itemType.name}</h1>
          <p className="text-sm text-muted-foreground">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </p>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="h-8 text-xs"
        onClick={() => setCreateOpen(true)}
      >
        <Plus className="mr-1 h-3.5 w-3.5" />
        New {itemType.name}
      </Button>

      <CreateItemDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        itemTypes={itemTypes}
        defaultTypeId={itemType.id}
      />
    </div>
  );
}
