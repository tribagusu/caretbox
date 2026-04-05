"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Star,
  Pin,
  Copy,
  Pencil,
  Trash2,
  Tag,
  FolderOpen,
  Calendar,
} from "lucide-react";
import { getIcon } from "@/lib/icons";
import type { ItemDetail } from "@/lib/db/items";

interface ItemDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ItemDetail | null;
  loading: boolean;
}

function DrawerSkeleton() {
  return (
    <div className="animate-pulse space-y-6 p-6">
      <div className="space-y-2">
        <div className="h-6 w-3/4 rounded bg-muted" />
        <div className="flex gap-2">
          <div className="h-5 w-16 rounded bg-muted" />
          <div className="h-5 w-20 rounded bg-muted" />
        </div>
      </div>
      <div className="flex gap-3">
        <div className="h-8 w-8 rounded bg-muted" />
        <div className="h-8 w-8 rounded bg-muted" />
        <div className="h-8 w-8 rounded bg-muted" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-20 rounded bg-muted" />
        <div className="h-4 w-full rounded bg-muted" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-16 rounded bg-muted" />
        <div className="h-32 w-full rounded bg-muted" />
      </div>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  active,
  activeColor,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  activeColor?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm transition-colors hover:bg-muted ${
        active ? activeColor ?? "" : "text-muted-foreground"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

export function ItemDrawer({ open, onOpenChange, item, loading }: ItemDrawerProps) {
  const handleCopy = () => {
    if (!item?.content) return;
    navigator.clipboard.writeText(item.content);
  };

  const formatDate = (date: string | Date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col overflow-y-auto data-[side=right]:sm:max-w-xl"
      >
        {loading && <DrawerSkeleton />}

        {!loading && item && (
          <>
            <SheetHeader className="space-y-3 border-b border-border pb-4">
              <SheetTitle className="text-lg font-semibold">
                {item.title}
              </SheetTitle>
              <div className="flex flex-wrap gap-1.5">
                <TypeBadge item={item} />
                {item.language && (
                  <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {item.language}
                  </span>
                )}
              </div>
            </SheetHeader>

            {/* Action bar */}
            <div className="flex items-center gap-1 border-b border-border px-4 py-2">
              <ActionButton
                icon={Star}
                label="Favorite"
                active={item.isFavorite}
                activeColor="text-yellow-500"
              />
              <ActionButton
                icon={Pin}
                label="Pin"
                active={item.isPinned}
                activeColor="text-foreground"
              />
              <ActionButton icon={Copy} label="Copy" onClick={handleCopy} />

              <div className="ml-auto flex items-center gap-1">
                <ActionButton icon={Pencil} label="Edit" />
                <button
                  title="Delete"
                  className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-red-400 transition-colors hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </div>
            </div>

            {/* Content area */}
            <div className="flex-1 space-y-6 overflow-y-auto p-4">
              {/* Description */}
              {item.description && (
                <section>
                  <h3 className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Description
                  </h3>
                  <p className="text-sm leading-relaxed">{item.description}</p>
                </section>
              )}

              {/* Content */}
              {item.content && (
                <section>
                  <h3 className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Content
                  </h3>
                  <pre className="overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 text-sm">
                    <code>{item.content}</code>
                  </pre>
                </section>
              )}

              {/* URL */}
              {item.url && (
                <section>
                  <h3 className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    URL
                  </h3>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:underline break-all"
                  >
                    {item.url}
                  </a>
                </section>
              )}

              {/* Tags */}
              {item.tags.length > 0 && (
                <section>
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                    <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Tags
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="rounded-md bg-muted px-2.5 py-1 text-xs text-muted-foreground"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Collection */}
              {item.collection && (
                <section>
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
                    <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Collections
                    </h3>
                  </div>
                  <span className="text-sm">{item.collection.name}</span>
                </section>
              )}

              {/* Details */}
              <section>
                <div className="mb-1.5 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Details
                  </h3>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Updated</span>
                    <span>{formatDate(item.updatedAt)}</span>
                  </div>
                </div>
              </section>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function TypeBadge({ item }: { item: ItemDetail }) {
  const TypeIcon = getIcon(item.type.icon ?? "file");
  const color = item.type.color ?? "#6366f1";

  return (
    <span
      className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs"
      style={{ backgroundColor: `${color}20`, color }}
    >
      <TypeIcon className="h-3 w-3" />
      {item.type.name}
    </span>
  );
}
