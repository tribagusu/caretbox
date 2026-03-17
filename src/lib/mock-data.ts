// Mock data for dashboard UI development
// Replace with real database queries once Prisma is set up

export interface User {
  id: string;
  email: string;
  name: string;
  isPro: boolean;
}

export interface ItemType {
  id: string;
  name: string;
  icon: string;
  color: string;
  isSystem: boolean;
  count: number;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Item {
  id: string;
  title: string;
  contentType: "text" | "file";
  content?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  url?: string;
  description?: string;
  isFavorite: boolean;
  isPinned: boolean;
  language?: string;
  typeId: string;
  collectionId?: string;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  isFavorite: boolean;
  itemCount: number;
  typeIcons: string[];
  createdAt: string;
  updatedAt: string;
}

// Current user
export const currentUser: User = {
  id: "user_1",
  email: "john@example.com",
  name: "John Doe",
  isPro: false,
};

// System item types (shown in sidebar)
export const itemTypes: ItemType[] = [
  { id: "type_1", name: "Snippets", icon: "code", color: "#3b82f6", isSystem: true, count: 24 },
  { id: "type_2", name: "Prompts", icon: "sparkles", color: "#a855f7", isSystem: true, count: 18 },
  { id: "type_3", name: "Commands", icon: "terminal", color: "#22c55e", isSystem: true, count: 15 },
  { id: "type_4", name: "Notes", icon: "file-text", color: "#eab308", isSystem: true, count: 12 },
  { id: "type_5", name: "Files", icon: "file", color: "#6366f1", isSystem: true, count: 5 },
  { id: "type_6", name: "Images", icon: "image", color: "#ec4899", isSystem: true, count: 3 },
  { id: "type_7", name: "Links", icon: "link", color: "#14b8a6", isSystem: true, count: 8 },
];

// Collections
export const collections: Collection[] = [
  {
    id: "col_1",
    name: "React Patterns",
    description: "Common React patterns and hooks",
    isFavorite: true,
    itemCount: 12,
    typeIcons: ["code", "file-text", "link"],
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "col_2",
    name: "Python Snippets",
    description: "Useful Python code snippets",
    isFavorite: false,
    itemCount: 8,
    typeIcons: ["code", "file-text"],
    createdAt: "2024-01-08T00:00:00Z",
    updatedAt: "2024-01-14T00:00:00Z",
  },
  {
    id: "col_3",
    name: "Context Files",
    description: "AI context files for projects",
    isFavorite: true,
    itemCount: 5,
    typeIcons: ["file-text", "file"],
    createdAt: "2024-01-05T00:00:00Z",
    updatedAt: "2024-01-12T00:00:00Z",
  },
  {
    id: "col_4",
    name: "Interview Prep",
    description: "Technical interview preparation",
    isFavorite: false,
    itemCount: 24,
    typeIcons: ["code", "file-text", "sparkles", "link"],
    createdAt: "2024-01-03T00:00:00Z",
    updatedAt: "2024-01-13T00:00:00Z",
  },
  {
    id: "col_5",
    name: "Git Commands",
    description: "Frequently used git commands",
    isFavorite: true,
    itemCount: 15,
    typeIcons: ["terminal", "file-text"],
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-11T00:00:00Z",
  },
  {
    id: "col_6",
    name: "AI Prompts",
    description: "Curated AI prompts for coding",
    isFavorite: false,
    itemCount: 18,
    typeIcons: ["sparkles", "file-text"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-10T00:00:00Z",
  },
];

// Items (pinned and recent for the dashboard)
export const items: Item[] = [
  {
    id: "item_1",
    title: "useAuth Hook",
    contentType: "text",
    content: `import { useContext } from 'react'
import { AuthContext } from './AuthContext'

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}`,
    description: "Custom authentication hook for React applications",
    isFavorite: true,
    isPinned: true,
    language: "typescript",
    typeId: "type_1",
    collectionId: "col_1",
    tags: [
      { id: "tag_1", name: "react" },
      { id: "tag_2", name: "auth" },
      { id: "tag_3", name: "hooks" },
    ],
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "item_2",
    title: "API Error Handling Pattern",
    contentType: "text",
    content: `async function fetchWithRetry(url: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.statusText);
      return await res.json();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, 1000 * 2 ** i));
    }
  }
}`,
    description: "Fetch wrapper with exponential backoff retry logic",
    isFavorite: false,
    isPinned: true,
    language: "typescript",
    typeId: "type_1",
    collectionId: "col_1",
    tags: [
      { id: "tag_4", name: "api" },
      { id: "tag_5", name: "error-handling" },
      { id: "tag_6", name: "fetch" },
    ],
    createdAt: "2024-01-12T00:00:00Z",
    updatedAt: "2024-01-12T00:00:00Z",
  },
  {
    id: "item_3",
    title: "Git Rebase Workflow",
    contentType: "text",
    content: `# Interactive rebase last 3 commits
git rebase -i HEAD~3

# Rebase current branch onto main
git fetch origin
git rebase origin/main

# Continue after resolving conflicts
git rebase --continue

# Abort rebase
git rebase --abort`,
    description: "Common git rebase commands and workflow",
    isFavorite: false,
    isPinned: false,
    language: "bash",
    typeId: "type_3",
    collectionId: "col_5",
    tags: [
      { id: "tag_7", name: "git" },
      { id: "tag_8", name: "rebase" },
    ],
    createdAt: "2024-01-11T00:00:00Z",
    updatedAt: "2024-01-11T00:00:00Z",
  },
  {
    id: "item_4",
    title: "System Prompt Template",
    contentType: "text",
    content: `You are a senior software engineer helping with code review.

Rules:
- Be concise and direct
- Focus on bugs, security issues, and performance
- Suggest improvements with code examples
- Rate severity: critical, warning, info`,
    description: "Reusable system prompt for AI code review",
    isFavorite: true,
    isPinned: false,
    language: undefined,
    typeId: "type_2",
    collectionId: "col_6",
    tags: [
      { id: "tag_9", name: "ai" },
      { id: "tag_10", name: "code-review" },
      { id: "tag_11", name: "prompt" },
    ],
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-10T00:00:00Z",
  },
  {
    id: "item_5",
    title: "Docker Compose Dev Setup",
    contentType: "text",
    content: `version: '3.8'
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: devstash
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: secret
    ports:
      - "5432:5432"
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"`,
    description: "Local development Docker Compose with Postgres and Redis",
    isFavorite: false,
    isPinned: false,
    language: "yaml",
    typeId: "type_3",
    collectionId: undefined,
    tags: [
      { id: "tag_12", name: "docker" },
      { id: "tag_13", name: "postgres" },
      { id: "tag_14", name: "devops" },
    ],
    createdAt: "2024-01-09T00:00:00Z",
    updatedAt: "2024-01-09T00:00:00Z",
  },
  {
    id: "item_6",
    title: "Prisma Cheat Sheet",
    contentType: "text",
    content: `// Find many with filter
const users = await prisma.user.findMany({
  where: { isPro: true },
  include: { items: true },
});

// Create with relation
const item = await prisma.item.create({
  data: {
    title: "New Item",
    contentType: "text",
    user: { connect: { id: userId } },
    type: { connect: { id: typeId } },
  },
});`,
    description: "Common Prisma ORM queries and patterns",
    isFavorite: false,
    isPinned: false,
    language: "typescript",
    typeId: "type_1",
    collectionId: undefined,
    tags: [
      { id: "tag_15", name: "prisma" },
      { id: "tag_16", name: "database" },
      { id: "tag_17", name: "orm" },
    ],
    createdAt: "2024-01-08T00:00:00Z",
    updatedAt: "2024-01-08T00:00:00Z",
  },
  {
    id: "item_7",
    title: "Tailwind Dark Mode Setup",
    contentType: "text",
    content: `<!-- In your root layout -->
<html class="dark">

/* In globals.css (Tailwind v4) */
@import "tailwindcss";

@theme {
  --color-background: oklch(15% 0.01 260);
  --color-surface: oklch(20% 0.01 260);
  --color-text: oklch(95% 0 0);
}`,
    description: "Dark mode configuration for Tailwind CSS v4",
    isFavorite: false,
    isPinned: false,
    language: "html",
    typeId: "type_1",
    collectionId: undefined,
    tags: [
      { id: "tag_18", name: "tailwind" },
      { id: "tag_19", name: "css" },
      { id: "tag_20", name: "dark-mode" },
    ],
    createdAt: "2024-01-07T00:00:00Z",
    updatedAt: "2024-01-07T00:00:00Z",
  },
  {
    id: "item_8",
    title: "Zod Validation Patterns",
    contentType: "text",
    content: `import { z } from 'zod';

const itemSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().optional(),
  typeId: z.string().cuid(),
  tags: z.array(z.string()).max(10),
});

type ItemInput = z.infer<typeof itemSchema>;`,
    description: "Common Zod schema patterns for form validation",
    isFavorite: true,
    isPinned: false,
    language: "typescript",
    typeId: "type_1",
    collectionId: "col_1",
    tags: [
      { id: "tag_21", name: "zod" },
      { id: "tag_22", name: "validation" },
      { id: "tag_23", name: "typescript" },
    ],
    createdAt: "2024-01-06T00:00:00Z",
    updatedAt: "2024-01-06T00:00:00Z",
  },
];
