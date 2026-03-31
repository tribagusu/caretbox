# Current Feature

## Status

Completed

## Goals

## Notes

## History

- **2026-03-31** — Auth Phase 3 - Auth UI: Custom sign-in page (/sign-in) with email/password and GitHub OAuth button. Custom register page (/register) with name, email, password, confirm password fields and validation. Sonner toast notification on successful registration. Reusable UserAvatar component (GitHub image or initials fallback). Sidebar user section updated with real NextAuth session data, avatar linking to /profile, and sign-out dropdown. Removed mock-data user dependency from Sidebar/DashboardShell. Pages are server components with client form components extracted.


- **2026-03-30** — Auth Phase 2 - Email/Password Credentials: Added Credentials provider using split pattern (placeholder in auth.config.ts for edge, real bcrypt validation in auth.ts). Created registration API route at /api/auth/register with input validation, duplicate check, and bcryptjs password hashing. GitHub OAuth preserved alongside credentials.

- **2026-03-30** — Auth Phase 1 - NextAuth + GitHub OAuth: Installed next-auth@beta and @auth/prisma-adapter. Split auth config pattern for edge compatibility (auth.config.ts for edge, auth.ts with Prisma adapter and JWT strategy). GitHub OAuth provider with auto-detected env vars. Route protection via src/proxy.ts protecting /dashboard/* with redirect to sign-in. Extended Session type with user.id via JWT/session callbacks and TypeScript module augmentation. API route handler at app/api/auth/[...nextauth]/route.ts.

- **2026-03-27** — Quick Wins from Codebase Audit: Fixed N+1 query in getRecentCollections by using Prisma select to fetch only typeId/type fields instead of full item records. Added runtime guard for DATABASE_URL with clear error message. Deduplicated getRecentCollections call via React.cache() so layout and page share one DB query per request. Fixed StatsCards positional index mapping by inlining values directly into the stats array. Removed dead mock-data exports (items, collections, itemTypes).


- **2026-03-24** — Stats & Sidebar from DB: Added getSystemItemTypes() to src/lib/db/items.ts with per-user item counts. Made dashboard layout async to fetch sidebar data from DB. Removed mock-data dependency from Sidebar, DashboardShell, SidebarTypes, and SidebarCollections. Sidebar now shows system item types with icons/counts from DB. Collections sidebar shows favorites with star icons and recent (non-favorite) collections with a colored circle based on dominant item type. Added "View all collections →" link to /collections.

- **2026-03-24** — Dashboard Items from DB: Replaced mock item data with real Prisma queries. Created src/lib/db/items.ts with getPinnedItems(), getRecentItems(), and getItemStats(). Updated ItemRow to use DashboardItem type with icon/border color derived from item type. Updated StatsCards to accept numeric props instead of mock Item[]. Dashboard page fetches all data in parallel via Promise.all. Pinned section hidden when no pinned items exist. Mock-data dependency fully removed from dashboard.

- **2026-03-19** — Dashboard Collections from DB: Replaced mock collection data with real Prisma queries from Neon PostgreSQL. Created src/lib/db/collections.ts with getRecentCollections() and getCollectionStats() functions. Dashboard page is now an async server component fetching collections directly. Collection card border color derived from most-used content type. Type icons shown per collection (normalized PascalCase DB icons to lowercase for icon map). Updated StatsCards to accept DB-driven collection counts. Updated icon map to handle StickyNote and case-insensitive lookups.

- **2026-03-19** — Seed Demo Data: Full seed script with demo user (demo@devstash.io, bcryptjs hashed password), 7 system item types (Lucide icons, updated colors), 18 tags, 5 collections (React Patterns, AI Workflows, DevOps, Terminal Commands, Design Resources), and 18 items (snippets, prompts, commands, links) with favorites, pins, and tag assignments. Cleaned up old duplicate item types. Updated test-db script to display all seeded data.

- **2026-03-18** — Prisma + Neon PostgreSQL Setup: Prisma 7 ORM with Neon PostgreSQL (serverless), driver adapter pattern (@prisma/adapter-pg), full schema with app models (User, Item, ItemType, Collection, Tag, ItemTag) and NextAuth models (Account, Session, VerificationToken), indexes, cascade deletes, snake_case table/column naming via @@map/@map, seed script for 7 system item types, prisma.config.ts, PrismaClient singleton, npm scripts for all db commands.

- **2026-03-17** — Dashboard UI Phase 3: Main content area with 4 stats cards (items, collections, favorite items, favorite collections), collections grid with favorite stars and type icons, pinned items section, and 10 recent items list with tags and dates.
- **2026-03-17** — Dashboard UI Phase 2: Collapsible sidebar with item types navigation (links to /items/TYPE), favorite and all collections sections, user avatar area, toggle button in top bar, mobile drawer via ShadCN Sheet, smooth collapse animation.
- **2026-03-17** — Dashboard UI Phase 1: ShadCN UI init, dark mode, dashboard route with top bar (search + new item button), sidebar and main area placeholders.
- **2026-03-16** — Initial Next.js project setup with project context docs (CLAUDE.md, project overview, coding standards, AI interaction guidelines). Removed default Next.js boilerplate.
