import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env["DATABASE_URL"]!,
});
const prisma = new PrismaClient({ adapter });

// ─── System Item Types (per spec) ──────────────────────────

const systemItemTypes = [
  { name: "snippet", icon: "Code", color: "#3b82f6" },
  { name: "prompt", icon: "Sparkles", color: "#8b5cf6" },
  { name: "command", icon: "Terminal", color: "#f97316" },
  { name: "note", icon: "StickyNote", color: "#fde047" },
  { name: "file", icon: "File", color: "#6b7280" },
  { name: "image", icon: "Image", color: "#ec4899" },
  { name: "link", icon: "Link", color: "#10b981" },
];

// ─── Seed Data ─────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding database...\n");

  // 1. Upsert system item types
  console.log("Creating system item types...");
  for (const type of systemItemTypes) {
    await prisma.itemType.upsert({
      where: { id: type.name },
      update: { icon: type.icon, color: type.color },
      create: {
        id: type.name,
        name: type.name,
        icon: type.icon,
        color: type.color,
        isSystem: true,
      },
    });
  }
  console.log(`  ✓ ${systemItemTypes.length} item types\n`);

  // 2. Create demo user
  console.log("Creating demo user...");
  const hashedPassword = await bcrypt.hash("12345678", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@caretbox.io" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@caretbox.io",
      password: hashedPassword,
      isPro: false,
      emailVerified: new Date(),
    },
  });
  console.log(`  ✓ User: ${user.email}\n`);

  // 3. Create tags
  console.log("Creating tags...");
  const tagNames = [
    "react",
    "hooks",
    "typescript",
    "patterns",
    "ai",
    "prompt-engineering",
    "workflow",
    "docker",
    "ci-cd",
    "devops",
    "git",
    "shell",
    "npm",
    "css",
    "tailwind",
    "design",
    "ui",
    "icons",
  ];

  const tags: Record<string, string> = {};
  for (const name of tagNames) {
    const tag = await prisma.tag.upsert({
      where: { name_userId: { name, userId: user.id } },
      update: {},
      create: { name, userId: user.id },
    });
    tags[name] = tag.id;
  }
  console.log(`  ✓ ${tagNames.length} tags\n`);

  // 4. Create collections
  console.log("Creating collections...");

  const reactPatterns = await prisma.collection.create({
    data: {
      name: "React Patterns",
      description: "Reusable React patterns and hooks",
      isFavorite: true,
      userId: user.id,
    },
  });

  const aiWorkflows = await prisma.collection.create({
    data: {
      name: "AI Workflows",
      description: "AI prompts and workflow automations",
      isFavorite: true,
      userId: user.id,
    },
  });

  const devops = await prisma.collection.create({
    data: {
      name: "DevOps",
      description: "Infrastructure and deployment resources",
      userId: user.id,
    },
  });

  const terminalCommands = await prisma.collection.create({
    data: {
      name: "Terminal Commands",
      description: "Useful shell commands for everyday development",
      userId: user.id,
    },
  });

  const designResources = await prisma.collection.create({
    data: {
      name: "Design Resources",
      description: "UI/UX resources and references",
      isFavorite: true,
      userId: user.id,
    },
  });
  console.log("  ✓ 5 collections\n");

  // 5. Create items
  console.log("Creating items...");

  // ── React Patterns (3 snippets) ──

  await prisma.item.create({
    data: {
      title: "useDebounce Hook",
      contentType: "text",
      language: "typescript",
      content: `import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}`,
      description: "Debounce any value with a configurable delay. Useful for search inputs.",
      isFavorite: true,
      isPinned: true,
      userId: user.id,
      typeId: "snippet",
      collectionId: reactPatterns.id,
      tags: {
        create: [{ tagId: tags["react"] }, { tagId: tags["hooks"] }, { tagId: tags["typescript"] }],
      },
    },
  });

  await prisma.item.create({
    data: {
      title: "useLocalStorage Hook",
      contentType: "text",
      language: "typescript",
      content: `import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch {
      console.warn(\`Failed to save \${key} to localStorage\`);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
}`,
      description: "Persist state to localStorage with SSR safety and JSON serialization.",
      isFavorite: true,
      userId: user.id,
      typeId: "snippet",
      collectionId: reactPatterns.id,
      tags: {
        create: [{ tagId: tags["react"] }, { tagId: tags["hooks"] }, { tagId: tags["typescript"] }],
      },
    },
  });

  await prisma.item.create({
    data: {
      title: "Context Provider Pattern",
      contentType: "text",
      language: "typescript",
      content: `import { createContext, useContext, useState, type ReactNode } from "react";

interface ThemeContextValue {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}`,
      description: "Type-safe React Context with a custom hook and null check pattern.",
      userId: user.id,
      typeId: "snippet",
      collectionId: reactPatterns.id,
      tags: {
        create: [{ tagId: tags["react"] }, { tagId: tags["patterns"] }, { tagId: tags["typescript"] }],
      },
    },
  });

  // ── AI Workflows (3 prompts) ──

  await prisma.item.create({
    data: {
      title: "Code Review Prompt",
      contentType: "text",
      content: `Review the following code for:
1. Security vulnerabilities (injection, XSS, auth issues)
2. Performance problems (N+1 queries, unnecessary re-renders)
3. Logic errors and edge cases
4. Code style and best practices

Be specific: reference line numbers, suggest fixes, and explain why each issue matters.

\`\`\`
{{paste code here}}
\`\`\``,
      description: "Comprehensive code review prompt covering security, performance, and best practices.",
      isFavorite: true,
      isPinned: true,
      userId: user.id,
      typeId: "prompt",
      collectionId: aiWorkflows.id,
      tags: {
        create: [{ tagId: tags["ai"] }, { tagId: tags["prompt-engineering"] }],
      },
    },
  });

  await prisma.item.create({
    data: {
      title: "Documentation Generator",
      contentType: "text",
      content: `Generate documentation for the following code:

1. A brief summary of what it does
2. Parameters/props with types and descriptions
3. Return value description
4. Usage example
5. Any important notes or caveats

Format as JSDoc/TSDoc comments that can be placed directly above the code.

\`\`\`
{{paste code here}}
\`\`\``,
      description: "Generate JSDoc/TSDoc documentation from code automatically.",
      userId: user.id,
      typeId: "prompt",
      collectionId: aiWorkflows.id,
      tags: {
        create: [{ tagId: tags["ai"] }, { tagId: tags["prompt-engineering"] }, { tagId: tags["workflow"] }],
      },
    },
  });

  await prisma.item.create({
    data: {
      title: "Refactoring Assistant",
      contentType: "text",
      content: `Analyze this code and suggest refactoring improvements:

1. Extract reusable functions or components
2. Simplify complex conditionals
3. Remove duplication (DRY)
4. Improve naming for clarity
5. Apply SOLID principles where appropriate

For each suggestion, show the before/after code and explain the benefit.

\`\`\`
{{paste code here}}
\`\`\``,
      description: "Get AI-powered refactoring suggestions with before/after examples.",
      userId: user.id,
      typeId: "prompt",
      collectionId: aiWorkflows.id,
      tags: {
        create: [{ tagId: tags["ai"] }, { tagId: tags["prompt-engineering"] }, { tagId: tags["workflow"] }],
      },
    },
  });

  // ── DevOps (1 snippet, 1 command, 2 links) ──

  await prisma.item.create({
    data: {
      title: "Docker Multi-Stage Build",
      contentType: "text",
      language: "dockerfile",
      content: `FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]`,
      description: "Optimized multi-stage Dockerfile for Next.js production builds.",
      isPinned: true,
      userId: user.id,
      typeId: "snippet",
      collectionId: devops.id,
      tags: {
        create: [{ tagId: tags["docker"] }, { tagId: tags["devops"] }],
      },
    },
  });

  await prisma.item.create({
    data: {
      title: "Deploy with Health Check",
      contentType: "text",
      content: `#!/bin/bash
set -euo pipefail

echo "Building and deploying..."
docker compose build --no-cache
docker compose up -d

echo "Waiting for health check..."
for i in $(seq 1 30); do
  if curl -sf http://localhost:3000/api/health > /dev/null; then
    echo "✓ App is healthy!"
    exit 0
  fi
  sleep 2
done

echo "✗ Health check failed"
docker compose logs --tail=50
exit 1`,
      description: "Deployment script with automatic health check and failure logging.",
      userId: user.id,
      typeId: "command",
      collectionId: devops.id,
      tags: {
        create: [{ tagId: tags["devops"] }, { tagId: tags["docker"] }, { tagId: tags["shell"] }],
      },
    },
  });

  await prisma.item.create({
    data: {
      title: "GitHub Actions Documentation",
      contentType: "text",
      content: "Official documentation for GitHub Actions workflows, triggers, and configuration.",
      url: "https://docs.github.com/en/actions",
      userId: user.id,
      typeId: "link",
      collectionId: devops.id,
      tags: {
        create: [{ tagId: tags["ci-cd"] }, { tagId: tags["devops"] }],
      },
    },
  });

  await prisma.item.create({
    data: {
      title: "Docker Compose Reference",
      contentType: "text",
      content: "Complete reference for Docker Compose file format and configuration options.",
      url: "https://docs.docker.com/compose/compose-file/",
      userId: user.id,
      typeId: "link",
      collectionId: devops.id,
      tags: {
        create: [{ tagId: tags["docker"] }, { tagId: tags["devops"] }],
      },
    },
  });

  // ── Terminal Commands (4 commands) ──

  await prisma.item.create({
    data: {
      title: "Git Interactive Rebase & Cleanup",
      contentType: "text",
      content: `# Squash last N commits
git rebase -i HEAD~3

# Delete all merged branches
git branch --merged main | grep -v "main" | xargs git branch -d

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Find large files in history
git rev-list --objects --all | git cat-file --batch-check='%(objectname) %(objecttype) %(rest)' | awk '/blob/ {print $1}' | git cat-file --batch-check='%(objectsize) %(rest)' | sort -rnk1 | head -10`,
      description: "Essential git commands for rebasing, branch cleanup, and history management.",
      isPinned: true,
      userId: user.id,
      typeId: "command",
      collectionId: terminalCommands.id,
      tags: {
        create: [{ tagId: tags["git"] }, { tagId: tags["shell"] }],
      },
    },
  });

  await prisma.item.create({
    data: {
      title: "Docker Container Management",
      contentType: "text",
      content: `# Stop all running containers
docker stop $(docker ps -q)

# Remove all stopped containers, unused networks, dangling images
docker system prune -f

# View container logs (follow + timestamps)
docker logs -f --timestamps <container>

# Execute shell in running container
docker exec -it <container> /bin/sh

# List container resource usage
docker stats --no-stream`,
      description: "Common Docker commands for container lifecycle and cleanup.",
      userId: user.id,
      typeId: "command",
      collectionId: terminalCommands.id,
      tags: {
        create: [{ tagId: tags["docker"] }, { tagId: tags["shell"] }],
      },
    },
  });

  await prisma.item.create({
    data: {
      title: "Process Management",
      contentType: "text",
      content: `# Find process using a specific port
lsof -i :3000

# Kill process on a port
kill -9 $(lsof -ti :3000)

# Monitor system resources
htop

# Watch a command output (refresh every 2s)
watch -n 2 "docker ps"

# Background a process and disown
nohup long-running-command > output.log 2>&1 &`,
      description: "Commands for finding, killing, and monitoring system processes.",
      userId: user.id,
      typeId: "command",
      collectionId: terminalCommands.id,
      tags: {
        create: [{ tagId: tags["shell"] }],
      },
    },
  });

  await prisma.item.create({
    data: {
      title: "npm & Package Manager Utilities",
      contentType: "text",
      content: `# Check for outdated packages
npm outdated

# Update all packages to latest (respecting semver)
npm update

# List all globally installed packages
npm ls -g --depth=0

# Check why a package is installed
npm explain <package>

# View package info
npm view <package> versions --json

# Clean npm cache
npm cache clean --force`,
      description: "Useful npm commands for dependency management and troubleshooting.",
      userId: user.id,
      typeId: "command",
      collectionId: terminalCommands.id,
      tags: {
        create: [{ tagId: tags["npm"] }, { tagId: tags["shell"] }],
      },
    },
  });

  // ── Design Resources (4 links) ──

  await prisma.item.create({
    data: {
      title: "Tailwind CSS Documentation",
      contentType: "text",
      content: "Official Tailwind CSS documentation with utility class reference and examples.",
      url: "https://tailwindcss.com/docs",
      isFavorite: true,
      userId: user.id,
      typeId: "link",
      collectionId: designResources.id,
      tags: {
        create: [{ tagId: tags["tailwind"] }, { tagId: tags["css"] }, { tagId: tags["design"] }],
      },
    },
  });

  await prisma.item.create({
    data: {
      title: "shadcn/ui Components",
      contentType: "text",
      content: "Beautifully designed components built with Radix UI and Tailwind CSS. Copy and paste into your apps.",
      url: "https://ui.shadcn.com",
      isFavorite: true,
      userId: user.id,
      typeId: "link",
      collectionId: designResources.id,
      tags: {
        create: [{ tagId: tags["ui"] }, { tagId: tags["react"] }, { tagId: tags["design"] }],
      },
    },
  });

  await prisma.item.create({
    data: {
      title: "Radix UI Primitives",
      contentType: "text",
      content: "Unstyled, accessible UI primitives for building design systems and web apps.",
      url: "https://www.radix-ui.com/primitives",
      userId: user.id,
      typeId: "link",
      collectionId: designResources.id,
      tags: {
        create: [{ tagId: tags["ui"] }, { tagId: tags["react"] }, { tagId: tags["design"] }],
      },
    },
  });

  await prisma.item.create({
    data: {
      title: "Lucide Icons",
      contentType: "text",
      content: "Beautiful and consistent icon library. Fork of Feather Icons with 1000+ icons.",
      url: "https://lucide.dev/icons",
      userId: user.id,
      typeId: "link",
      collectionId: designResources.id,
      tags: {
        create: [{ tagId: tags["icons"] }, { tagId: tags["ui"] }, { tagId: tags["design"] }],
      },
    },
  });

  // Count results
  const itemCount = await prisma.item.count({ where: { userId: user.id } });
  const collectionCount = await prisma.collection.count({ where: { userId: user.id } });
  const tagCount = await prisma.tag.count({ where: { userId: user.id } });

  console.log(`  ✓ ${itemCount} items\n`);
  console.log("─────────────────────────────────");
  console.log(`  Total: ${itemCount} items, ${collectionCount} collections, ${tagCount} tags`);
  console.log("─────────────────────────────────\n");
  console.log("🌱 Seed complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
