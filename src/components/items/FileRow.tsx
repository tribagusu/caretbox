"use client";

import { Download, FileText, FileImage, FileCode, FileSpreadsheet, File } from "lucide-react";
import { useItemDrawer } from "@/components/items/ItemDrawerProvider";
import type { DashboardItem } from "@/lib/db/items";

interface FileRowProps {
  item: DashboardItem;
}

function getFileIcon(fileName: string | null) {
  if (!fileName) return File;
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "webp":
    case "svg":
      return FileImage;
    case "pdf":
    case "txt":
    case "md":
      return FileText;
    case "json":
    case "yaml":
    case "yml":
    case "xml":
    case "toml":
    case "ini":
      return FileCode;
    case "csv":
      return FileSpreadsheet;
    default:
      return File;
  }
}

function formatFileSize(bytes: number | null): string {
  if (bytes === null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileRow({ item }: FileRowProps) {
  const { openItem } = useItemDrawer();
  const Icon = getFileIcon(item.fileName);

  function handleDownload(e: React.MouseEvent) {
    e.stopPropagation();
    if (item.fileUrl) {
      const a = document.createElement("a");
      a.href = `/api/files/${item.fileUrl}`;
      a.download = item.fileName ?? "download";
      a.click();
    }
  }

  return (
    <div
      className="flex cursor-pointer items-center gap-4 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-muted-foreground/30 hover:bg-muted/50"
      onClick={() => openItem(item.id)}
    >
      <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.fileName ?? item.title}</p>
        <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground sm:hidden">
          <span>{formatFileSize(item.fileSize)}</span>
          <span>
            {new Date(item.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      <span className="hidden shrink-0 text-sm text-muted-foreground sm:block">
        {formatFileSize(item.fileSize)}
      </span>

      <span className="hidden shrink-0 text-sm text-muted-foreground sm:block">
        {new Date(item.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </span>

      <button
        onClick={handleDownload}
        className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        title="Download"
      >
        <Download className="h-4 w-4" />
      </button>
    </div>
  );
}
