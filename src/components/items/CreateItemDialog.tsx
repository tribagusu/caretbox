"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createItem } from "@/actions/items";
import type { SidebarItemType } from "@/lib/db/items";

interface CreateItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemTypes: SidebarItemType[];
}

const CONTENT_TYPES = ["snippet", "prompt", "command", "note"];
const LANGUAGE_TYPES = ["snippet", "command"];
const URL_TYPES = ["link"];

interface FormState {
  title: string;
  description: string;
  content: string;
  language: string;
  url: string;
  tags: string;
  typeId: string;
}

const initialForm: FormState = {
  title: "",
  description: "",
  content: "",
  language: "",
  url: "",
  tags: "",
  typeId: "",
};

export function CreateItemDialog({
  open,
  onOpenChange,
  itemTypes,
}: CreateItemDialogProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [saving, setSaving] = useState(false);

  const selectedType = itemTypes.find((t) => t.id === form.typeId);
  const typeName = selectedType?.name.toLowerCase() ?? "";
  const showContent = CONTENT_TYPES.includes(typeName);
  const showLanguage = LANGUAGE_TYPES.includes(typeName);
  const showUrl = URL_TYPES.includes(typeName);

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      setForm(initialForm);
      setErrors({});
    }
    onOpenChange(value);
  };

  const updateField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const result = await createItem({
      title: form.title,
      description: form.description || null,
      content: form.content || null,
      language: form.language || null,
      url: form.url || null,
      typeId: form.typeId,
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

    toast.success("Item created");
    setForm(initialForm);
    setErrors({});
    onOpenChange(false);
    router.refresh();
  };

  const inputClass =
    "w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Item</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type selector */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Type</label>
            <select
              value={form.typeId}
              onChange={(e) => updateField("typeId", e.target.value)}
              className={inputClass}
            >
              <option value="">Select a type...</option>
              {itemTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            {errors.typeId && (
              <p className="text-xs text-red-400">{errors.typeId[0]}</p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              className={inputClass}
              placeholder="Item title"
            />
            {errors.title && (
              <p className="text-xs text-red-400">{errors.title[0]}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={2}
              className={inputClass}
              placeholder="Optional description"
            />
          </div>

          {/* Content (snippet, prompt, command, note) */}
          {showContent && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Content</label>
              <textarea
                value={form.content}
                onChange={(e) => updateField("content", e.target.value)}
                rows={5}
                className={`${inputClass} font-mono`}
                placeholder="Content"
              />
            </div>
          )}

          {/* Language (snippet, command) */}
          {showLanguage && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Language</label>
              <input
                type="text"
                value={form.language}
                onChange={(e) => updateField("language", e.target.value)}
                className={inputClass}
                placeholder="e.g. javascript, python"
              />
            </div>
          )}

          {/* URL (link) */}
          {showUrl && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">URL</label>
              <input
                type="text"
                value={form.url}
                onChange={(e) => updateField("url", e.target.value)}
                className={inputClass}
                placeholder="https://example.com"
              />
              {errors.url && (
                <p className="text-xs text-red-400">{errors.url[0]}</p>
              )}
            </div>
          )}

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Tags</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => updateField("tags", e.target.value)}
              className={inputClass}
              placeholder="react, hooks, state (comma-separated)"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || !form.title.trim() || !form.typeId}
            >
              {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
