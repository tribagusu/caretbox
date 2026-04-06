"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { EditorHeader } from "@/components/items/EditorHeader";

interface MarkdownEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}

export function MarkdownEditor({
  value,
  onChange,
  readOnly = false,
}: MarkdownEditorProps) {
  const [tab, setTab] = useState<"write" | "preview">(
    readOnly ? "preview" : "write"
  );
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <EditorHeader
        value={value}
        leftSlot={
          readOnly ? (
            <span className="text-xs text-[#858585]">Preview</span>
          ) : (
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setTab("write")}
                className={`rounded px-2 py-0.5 text-xs transition-colors ${
                  tab === "write"
                    ? "bg-[#2d2d2d] text-[#cccccc]"
                    : "text-[#858585] hover:text-[#cccccc]"
                }`}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setTab("preview")}
                className={`rounded px-2 py-0.5 text-xs transition-colors ${
                  tab === "preview"
                    ? "bg-[#2d2d2d] text-[#cccccc]"
                    : "text-[#858585] hover:text-[#cccccc]"
                }`}
              >
                Preview
              </button>
            </div>
          )
        }
      />

      {/* Content */}
      <div className="markdown-editor-scroll max-h-[400px] overflow-auto bg-[#1e1e1e]">
        {tab === "write" ? (
          <textarea
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            className="min-h-50 w-full resize-none bg-transparent px-4 py-3 text-sm text-[#d4d4d4] placeholder-[#858585] focus:outline-none"
            placeholder="Write markdown here..."
          />
        ) : (
          <div className="markdown-preview px-4 py-3 text-sm text-[#d4d4d4]">
            {value ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {value}
              </ReactMarkdown>
            ) : (
              <p className="text-[#858585]">Nothing to preview</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
