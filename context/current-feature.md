# Current Feature

## Status

Completed

## Goals

## Notes

## History

- **2026-03-18** — Prisma + Neon PostgreSQL Setup: Prisma 7 ORM with Neon PostgreSQL (serverless), driver adapter pattern (@prisma/adapter-pg), full schema with app models (User, Item, ItemType, Collection, Tag, ItemTag) and NextAuth models (Account, Session, VerificationToken), indexes, cascade deletes, snake_case table/column naming via @@map/@map, seed script for 7 system item types, prisma.config.ts, PrismaClient singleton, npm scripts for all db commands.

- **2026-03-17** — Dashboard UI Phase 3: Main content area with 4 stats cards (items, collections, favorite items, favorite collections), collections grid with favorite stars and type icons, pinned items section, and 10 recent items list with tags and dates.
- **2026-03-17** — Dashboard UI Phase 2: Collapsible sidebar with item types navigation (links to /items/TYPE), favorite and all collections sections, user avatar area, toggle button in top bar, mobile drawer via ShadCN Sheet, smooth collapse animation.
- **2026-03-17** — Dashboard UI Phase 1: ShadCN UI init, dark mode, dashboard route with top bar (search + new item button), sidebar and main area placeholders.
- **2026-03-16** — Initial Next.js project setup with project context docs (CLAUDE.md, project overview, coding standards, AI interaction guidelines). Removed default Next.js boilerplate.
