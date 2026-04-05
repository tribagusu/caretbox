"use client";

import { useState } from "react";
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
  Save,
  X,
  Loader2,
} from "lucide-react";
import { getIcon } from "@/lib/icons";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { updateItem } from "@/actions/items";
import type { ItemDetail } from "@/lib/db/items";

interface ItemDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ItemDetail | null;
  loading: boolean;
  onItemUpdated?: (item: ItemDetail) => void;
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

const CONTENT_TYPES = ["snippet", "prompt", "command", "note"];
const LANGUAGE_TYPES = ["snippet", "command"];
const URL_TYPES = ["link"];

interface EditFormState {
  title: string;
  description: string;
  content: string;
  language: string;
  url: string;
  tags: string;
}

function initFormState(item: ItemDetail): EditFormState {
  return {
    title: item.title,
    description: item.description ?? "",
    content: item.content ?? "",
    language: item.language ?? "",
    url: item.url ?? "",
    tags: item.tags.map((t) => t.name).join(", "),
  };
}

export function ItemDrawer({
  open,
  onOpenChange,
  item,
  loading,
  onItemUpdated,
}: ItemDrawerProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<EditFormState>({
    title: "",
    description: "",
    content: "",
    language: "",
    url: "",
    tags: "",
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const typeName = item?.type.name.toLowerCase() ?? "";
  const showContent = CONTENT_TYPES.includes(typeName);
  const showLanguage = LANGUAGE_TYPES.includes(typeName);
  const showUrl = URL_TYPES.includes(typeName);

  const handleEdit = () => {
    if (!item) return;
    setForm(initFormState(item));
    setErrors({});
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setErrors({});
  };

  const handleSave = async () => {
    if (!item) return;
    setSaving(true);
    setErrors({});

    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const result = await updateItem(item.id, {
      title: form.title,
      description: form.description || null,
      content: form.content || null,
      language: form.language || null,
      url: form.url || null,
      tags,
    });

    setSaving(false);

    if (!result.success) {
      if (typeof result.error === "string") {
        toast.error(result.error);
      } else {
        setErrors(result.error);
        toast.error("Please fix the validation errors");
      }
      return;
    }

    toast.success("Item updated");
    setEditing(false);
    onItemUpdated?.(result.data);
    router.refresh();
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) setEditing(false);
    onOpenChange(value);
  };

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

  const updateField = (field: keyof EditFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const inputClass =
    "w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col overflow-y-auto data-[side=right]:sm:max-w-xl"
      >
        {loading && <DrawerSkeleton />}

        {!loading && item && (
          <>
            <SheetHeader className="space-y-3 border-b border-border pb-4">
              {editing ? (
                <div className="space-y-1">
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    className={`${inputClass} text-lg font-semibold`}
                    placeholder="Title"
                  />
                  {errors.title && (
                    <p className="text-xs text-red-400">{errors.title[0]}</p>
                  )}
                </div>
              ) : (
                <SheetTitle className="text-lg font-semibold">
                  {item.title}
                </SheetTitle>
              )}
              <div className="flex flex-wrap gap-1.5">
                <TypeBadge item={item} />
                {!editing && item.language && (
                  <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {item.language}
                  </span>
                )}
              </div>
            </SheetHeader>

            {/* Action bar */}
            {editing ? (
              <div className="flex items-center gap-2 border-b border-border px-4 py-2">
                <button
                  onClick={handleSave}
                  disabled={saving || !form.title.trim()}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            ) : (
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
                  <ActionButton
                    icon={Pencil}
                    label="Edit"
                    onClick={handleEdit}
                  />
                  <button
                    title="Delete"
                    className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-red-400 transition-colors hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>
            )}

            {/* Content area */}
            <div className="flex-1 space-y-6 overflow-y-auto p-4">
              {/* Description */}
              {editing ? (
                <section>
                  <h3 className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Description
                  </h3>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      updateField("description", e.target.value)
                    }
                    rows={3}
                    className={inputClass}
                    placeholder="Optional description"
                  />
                </section>
              ) : (
                item.description && (
                  <section>
                    <h3 className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Description
                    </h3>
                    <p className="text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </section>
                )
              )}

              {/* Content */}
              {editing && showContent ? (
                <section>
                  <h3 className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Content
                  </h3>
                  <textarea
                    value={form.content}
                    onChange={(e) => updateField("content", e.target.value)}
                    rows={8}
                    className={`${inputClass} font-mono`}
                    placeholder="Content"
                  />
                </section>
              ) : (
                !editing &&
                item.content && (
                  <section>
                    <h3 className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Content
                    </h3>
                    <pre className="overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 text-sm">
                      <code>{item.content}</code>
                    </pre>
                  </section>
                )
              )}

              {/* Language */}
              {editing && showLanguage && (
                <section>
                  <h3 className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Language
                  </h3>
                  <input
                    type="text"
                    value={form.language}
                    onChange={(e) => updateField("language", e.target.value)}
                    className={inputClass}
                    placeholder="e.g. javascript, python"
                  />
                </section>
              )}

              {/* URL */}
              {editing && showUrl ? (
                <section>
                  <h3 className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    URL
                  </h3>
                  <input
                    type="text"
                    value={form.url}
                    onChange={(e) => updateField("url", e.target.value)}
                    className={inputClass}
                    placeholder="https://example.com"
                  />
                  {errors.url && (
                    <p className="mt-1 text-xs text-red-400">
                      {errors.url[0]}
                    </p>
                  )}
                </section>
              ) : (
                !editing &&
                item.url && (
                  <section>
                    <h3 className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      URL
                    </h3>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-sm text-blue-400 hover:underline"
                    >
                      {item.url}
                    </a>
                  </section>
                )
              )}

              {/* Tags */}
              {editing ? (
                <section>
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                    <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Tags
                    </h3>
                  </div>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => updateField("tags", e.target.value)}
                    className={inputClass}
                    placeholder="react, hooks, state (comma-separated)"
                  />
                </section>
              ) : (
                item.tags.length > 0 && (
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
                )
              )}

              {/* Collection (view only) */}
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

              {/* Details (view only) */}
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
