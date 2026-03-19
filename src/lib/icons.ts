import {
  Code,
  Sparkles,
  Terminal,
  FileText,
  File,
  Image,
  Link,
  StickyNote,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  code: Code,
  sparkles: Sparkles,
  terminal: Terminal,
  "file-text": FileText,
  stickynote: StickyNote,
  file: File,
  image: Image,
  link: Link,
};

export function getIcon(name: string): LucideIcon {
  return iconMap[name.toLowerCase()] ?? File;
}
