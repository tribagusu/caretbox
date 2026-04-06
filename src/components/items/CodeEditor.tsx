"use client";

import Editor, { type OnMount } from "@monaco-editor/react";
import { EditorHeader } from "@/components/items/EditorHeader";

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
  const resolvedLang = resolveLanguage(language);

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
      <EditorHeader
        value={value}
        leftSlot={
          language ? (
            <span className="text-xs text-[#858585]">{language}</span>
          ) : undefined
        }
      />

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
