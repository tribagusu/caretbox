"use client";

import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";

interface EditorHeaderProps {
  leftSlot?: React.ReactNode;
  value: string;
}

export function EditorHeader({ leftSlot, value }: EditorHeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [value]);

  return (
    <div className="flex items-center justify-between border-b border-border bg-[#1e1e1e] px-3 py-2">
      <div className="flex items-center gap-3">
        {/* Window dots */}
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        {leftSlot}
      </div>
      {/* Copy button */}
      <button
        type="button"
        onClick={handleCopy}
        className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-[#858585] transition-colors hover:bg-[#2d2d2d] hover:text-[#cccccc]"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5" />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            Copy
          </>
        )}
      </button>
    </div>
  );
}
