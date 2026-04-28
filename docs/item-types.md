# Item Types

Caretbox has 7 system (built-in) item types. Pro users can create custom types.

---

## Type Reference

### 1. Snippet

| Property | Value |
|----------|-------|
| Icon | `Code` (Lucide) |
| Color | `#3b82f6` (blue) |
| Content type | text |
| Purpose | Store reusable code — hooks, patterns, boilerplate, config files |
| Key fields | `content`, `language` (for syntax highlighting), `description` |

### 2. Prompt

| Property | Value |
|----------|-------|
| Icon | `Sparkles` (Lucide) |
| Color | `#8b5cf6` (violet) |
| Content type | text |
| Purpose | Save AI prompts — code review templates, doc generators, refactoring assistants |
| Key fields | `content`, `description` |

### 3. Note

| Property | Value |
|----------|-------|
| Icon | `StickyNote` (Lucide) |
| Color | `#fde047` (yellow) |
| Content type | text |
| Purpose | Free-form text — project notes, documentation drafts, checklists |
| Key fields | `content`, `description` |

### 4. Command

| Property | Value |
|----------|-------|
| Icon | `Terminal` (Lucide) |
| Color | `#f97316` (orange) |
| Content type | text |
| Purpose | Shell commands and scripts — git workflows, Docker ops, process management |
| Key fields | `content`, `description` |

### 5. File

| Property | Value |
|----------|-------|
| Icon | `File` (Lucide) |
| Color | `#6b7280` (gray) |
| Content type | file |
| Purpose | Upload documents, templates, config files |
| Key fields | `fileUrl`, `fileName`, `fileSize`, `description` |

### 6. Image

| Property | Value |
|----------|-------|
| Icon | `Image` (Lucide) |
| Color | `#ec4899` (pink) |
| Content type | file |
| Purpose | Upload screenshots, diagrams, design assets |
| Key fields | `fileUrl`, `fileName`, `fileSize`, `description` |

### 7. Link

| Property | Value |
|----------|-------|
| Icon | `Link` (Lucide) |
| Color | `#10b981` (emerald) |
| Content type | text |
| Purpose | Bookmark external URLs — documentation, tools, references |
| Key fields | `url`, `content` (used as a text description), `description` |

---

## Classification

### By content model

| Classification | Types | Storage |
|----------------|-------|---------|
| **Text-based** | snippet, prompt, note, command | `content` field (Postgres text column) |
| **File-based** | file, image | `fileUrl`, `fileName`, `fileSize` (stored in Cloudflare R2) |
| **URL-based** | link | `url` field + optional `content` as description |

### Shared properties (all types)

Every item, regardless of type, has these fields:

- `title` — display name
- `description` — optional summary
- `contentType` — discriminator: `"text"` or `"file"`
- `isFavorite` / `isPinned` — user organization flags
- `typeId` — FK to `ItemType`
- `collectionId` — optional FK to a `Collection`
- `tags` — many-to-many via `ItemTag`
- `createdAt` / `updatedAt` — timestamps

### Display differences

| Aspect | Text types | File types | Link type |
|--------|-----------|-----------|-----------|
| Main view | Rendered content (Markdown / syntax-highlighted code) | File preview or download link | Clickable URL + description |
| Language field | Used by `snippet` and `command` for syntax highlighting | Not used | Not used |
| Editor | Markdown / code editor | File upload widget | URL input + text area |
| `content` field | Primary data | Not used | Secondary (descriptive text) |

---

## Data model

Item types are stored in the `item_types` table:

```
id       — cuid (system types use the type name as ID, e.g. "snippet")
name     — type name (lowercase)
icon     — Lucide icon component name (PascalCase in DB, lowercased for lookup)
color    — hex color string
is_system — true for the 7 built-in types
user_id  — null for system types, set for custom (Pro) types
```

The icon value stored in the database (e.g. `"Code"`, `"StickyNote"`) is normalized to lowercase via `getIcon()` in `src/lib/icons.ts` for the frontend icon map lookup.

---

## Source files

- Schema: `prisma/schema.prisma` (ItemType + Item models)
- Seed data: `prisma/seed.ts` (system type definitions + demo items)
- Icon mapping: `src/lib/icons.ts`
- DB queries: `src/lib/db/items.ts` (getSystemItemTypes)
