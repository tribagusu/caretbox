"use client";

import { useState, useCallback } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import { Copy, Check } from "lucide-react";

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  readOnly?: boolean;
}

const LANGUAGE_MAP: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  py: "python",
  rb: "ruby",
  yml: "yaml",
  sh: "shell",
  bash: "shell",
  zsh: "shell",
  md: "markdown",
  jsx: "javascript",
  tsx: "typescript",
  dockerfile: "dockerfile",
};

function resolveLanguage(lang?: string): string {
  if (!lang) return "plaintext";
  const lower = lang.toLowerCase();
  return LANGUAGE_MAP[lower] ?? lower;
}

export function CodeEditor({
  value,
  onChange,
  language,
  readOnly = false,
}: CodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const resolvedLang = resolveLanguage(language);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [value]);

  const handleMount: OnMount = (editor) => {
    // Auto-resize editor height based on content
    const updateHeight = () => {
      const contentHeight = Math.min(
        editor.getContentHeight(),
        400
      );
      const container = editor.getDomNode()?.parentElement;
      if (container) {
        container.style.height = `${contentHeight}px`;
      }
      editor.layout();
    };

    editor.onDidContentSizeChange(updateHeight);
    updateHeight();
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      {/* macOS-style header */}
      <div className="flex items-center justify-between border-b border-border bg-[#1e1e1e] px-3 py-2">
        <div className="flex items-center gap-3">
          {/* Window dots */}
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          </div>
          {/* Language label */}
          {language && (
            <span className="text-xs text-[#858585]">{language}</span>
          )}
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

      {/* Editor */}
      <div className="max-h-[400px] overflow-auto">
        <Editor
          value={value}
          onChange={(val) => onChange?.(val ?? "")}
          language={resolvedLang}
          theme="vs-dark"
          onMount={handleMount}
          options={{
            readOnly,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 13,
            lineHeight: 20,
            padding: { top: 12, bottom: 12 },
            renderLineHighlight: readOnly ? "none" : "line",
            lineNumbers: readOnly ? "off" : "on",
            folding: false,
            wordWrap: "on",
            overviewRulerBorder: false,
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            scrollbar: {
              vertical: "auto",
              horizontal: "auto",
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
            },
            contextmenu: false,
            automaticLayout: true,
            tabSize: 2,
            cursorStyle: readOnly ? "underline-thin" : "line",
          }}
        />
      </div>
    </div>
  );
}
