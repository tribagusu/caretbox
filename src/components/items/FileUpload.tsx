"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, File, ImageIcon, X, Check } from "lucide-react";
import {
  IMAGE_EXTENSIONS,
  FILE_EXTENSIONS,
  MAX_IMAGE_SIZE,
  MAX_FILE_SIZE,
} from "@/lib/r2";
import { formatFileSize } from "@/lib/utils";

interface UploadResult {
  fileUrl: string;
  fileName: string;
  fileSize: number;
}

interface FileUploadProps {
  isImage: boolean;
  onUploadComplete: (result: UploadResult) => void;
  onUploadError: (error: string) => void;
}

type Status = "idle" | "dragging" | "uploading" | "complete" | "error";

export function FileUpload({
  isImage,
  onUploadComplete,
  onUploadError,
}: FileUploadProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const allowedExts = isImage ? IMAGE_EXTENSIONS : FILE_EXTENSIONS;
  const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_FILE_SIZE;
  const accept = allowedExts.join(",");

  const validateClientSide = useCallback(
    (file: File): string | null => {
      const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
      if (!allowedExts.includes(ext)) {
        return `File type ${ext} is not allowed`;
      }
      if (file.size > maxSize) {
        const maxMB = maxSize / (1024 * 1024);
        return `File exceeds ${maxMB} MB limit`;
      }
      return null;
    },
    [allowedExts, maxSize]
  );

  const uploadFile = useCallback(
    (file: File) => {
      const error = validateClientSide(file);
      if (error) {
        setStatus("error");
        setErrorMsg(error);
        onUploadError(error);
        return;
      }

      // Create local preview for images
      if (isImage) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }

      setStatus("uploading");
      setProgress(0);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("isImage", String(isImage));

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText) as UploadResult;
          setResult(data);
          setStatus("complete");
          onUploadComplete(data);
        } else {
          const msg =
            JSON.parse(xhr.responseText)?.error ?? "Upload failed";
          setStatus("error");
          setErrorMsg(msg);
          onUploadError(msg);
        }
      });

      xhr.addEventListener("error", () => {
        setStatus("error");
        setErrorMsg("Upload failed");
        onUploadError("Upload failed");
      });

      xhr.open("POST", "/api/upload");
      xhr.send(formData);
    },
    [isImage, validateClientSide, onUploadComplete, onUploadError]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setStatus("idle");
      const file = e.dataTransfer.files[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  const handleRemove = () => {
    setStatus("idle");
    setResult(null);
    setProgress(0);
    setErrorMsg(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  const maxMB = maxSize / (1024 * 1024);

  return (
    <div className="space-y-2">
      {status === "complete" && result ? (
        <div className="rounded-lg border border-border bg-[#1e1e1e] p-4">
          {isImage && previewUrl ? (
            <div className="space-y-3">
              <img
                src={previewUrl}
                alt={result.fileName}
                className="max-h-48 rounded-md border border-border object-contain"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="truncate text-muted-foreground">
                    {result.fileName}
                  </span>
                  <span className="text-xs text-muted-foreground/60">
                    {formatFileSize(result.fileSize)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <File className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="truncate">{result.fileName}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(result.fileSize)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemove}
                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      ) : status === "uploading" ? (
        <div className="rounded-lg border border-border bg-[#1e1e1e] p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Uploading...</span>
              <span className="text-muted-foreground">{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setStatus("dragging");
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            setStatus("dragging");
          }}
          onDragLeave={() => setStatus("idle")}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            status === "dragging"
              ? "border-primary bg-primary/5"
              : status === "error"
                ? "border-red-500/50 bg-red-500/5"
                : "border-border hover:border-muted-foreground/50"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-2">
            {isImage ? (
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            ) : (
              <Upload className="h-8 w-8 text-muted-foreground" />
            )}
            <div className="text-sm text-muted-foreground">
              {status === "dragging" ? (
                <span className="text-primary">Drop file here</span>
              ) : (
                <>
                  <span className="font-medium text-foreground">
                    Click to upload
                  </span>{" "}
                  or drag and drop
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground/60">
              {allowedExts.join(", ")} (max {maxMB} MB)
            </p>
            {status === "error" && errorMsg && (
              <p className="text-xs text-red-400">{errorMsg}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
