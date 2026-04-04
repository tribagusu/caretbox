# Item CRUD Architecture

A unified CRUD system for all 7 item types using one action file, one data layer, one dynamic route, and shared components that adapt by type.

---

## File Structure

```
src/
├── actions/
│   └── items.ts                    # All item mutations (create, update, delete)
│
├── lib/
│   └── db/
│       └── items.ts                # All item queries (existing file, extend it)
│
├── app/
│   └── dashboard/
│       └── items/
│           └── [type]/
│               └── page.tsx        # Server component — items list filtered by type
│
├── components/
│   └── items/
│       ├── ItemList.tsx            # Grid/list of items with empty state
│       ├── ItemCard.tsx            # Card view for an item (type-aware display)
│       ├── ItemDialog.tsx          # Create/edit dialog (shared shell)
│       ├── ItemDeleteDialog.tsx    # Delete confirmation dialog
│       ├── ItemForm.tsx            # Unified form — fields adapt by type
│       ├── fields/
│       │   ├── TextContentField.tsx    # Markdown/code editor (snippet, prompt, note, command)
│       │   ├── FileUploadField.tsx     # File/image upload widget (file, image)
│       │   ├── UrlField.tsx            # URL input (link)
│       │   └── LanguageSelect.tsx      # Language picker (snippet, command)
│       └── ItemActions.tsx         # Favorite, pin, edit, delete action buttons
│
└── types/
    └── items.ts                    # Shared types and Zod schemas
```

---

## Routing: `/dashboard/items/[type]`

### How it works

The `[type]` param matches a system item type name: `snippet`, `prompt`, `note`, `command`, `file`, `image`, `link`.

```
/dashboard/items/snippet   → all snippets
/dashboard/items/prompt    → all prompts
/dashboard/items/link      → all links
```

### Page component

`src/app/dashboard/items/[type]/page.tsx` is a **server component** that:

1. Validates `type` param against known system types (redirect to /dashboard if invalid)
2. Fetches items of that type via `getItemsByType(userId, type)` from `lib/db/items.ts`
3. Passes items + type metadata to `<ItemList />`

```tsx
// src/app/dashboard/items/[type]/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getItemsByType } from "@/lib/db/items";
import { ItemList } from "@/components/items/ItemList";

const VALID_TYPES = ["snippet", "prompt", "note", "command", "file", "image", "link"];

export default async function ItemsByTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  if (!VALID_TYPES.includes(type)) redirect("/dashboard");

  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const items = await getItemsByType(session.user.id, type);

  return <ItemList items={items} typeName={type} />;
}
```

This page lives **inside** the dashboard layout, so sidebar and top bar render automatically.

---

## Data Layer: `src/lib/db/items.ts`

Extend the existing file with new query functions. All queries are called directly from server components (no API routes needed for reads).

### New functions to add

```ts
// Fetch items filtered by type for the list page
getItemsByType(userId: string, typeName: string): Promise<ItemDetail[]>

// Fetch a single item with all fields for the edit dialog
getItemById(userId: string, itemId: string): Promise<ItemDetail | null>
```

### `ItemDetail` type

A richer type than `DashboardItem`, including all editable fields:

```ts
export interface ItemDetail {
  id: string;
  title: string;
  contentType: string;       // "text" | "file"
  content: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  url: string | null;
  description: string | null;
  language: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  type: { id: string; name: string; icon: string | null; color: string | null };
  tags: { id: string; name: string }[];
  collection: { id: string; name: string } | null;
}
```

---

## Mutations: `src/actions/items.ts`

One Server Actions file for all mutations. Follows the project's `{ success, data, error }` return pattern.

### Actions

```ts
"use server";

// Create a new item (any type)
createItem(formData: CreateItemInput): Promise<ActionResult<{ id: string }>>

// Update an existing item
updateItem(itemId: string, formData: UpdateItemInput): Promise<ActionResult<{ id: string }>>

// Delete an item
deleteItem(itemId: string): Promise<ActionResult>

// Toggle favorite
toggleFavorite(itemId: string): Promise<ActionResult>

// Toggle pin
togglePin(itemId: string): Promise<ActionResult>
```

### Validation (Zod)

Defined in `src/types/items.ts`:

```ts
const baseItemSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  collectionId: z.string().optional(),
  tags: z.array(z.string()).optional(),       // tag names
  isFavorite: z.boolean().optional(),
  isPinned: z.boolean().optional(),
});

// Text types: snippet, prompt, note, command
const textItemSchema = baseItemSchema.extend({
  typeId: z.enum(["snippet", "prompt", "note", "command"]),
  content: z.string().min(1),
  language: z.string().optional(),            // only snippet & command use this
});

// File types: file, image
const fileItemSchema = baseItemSchema.extend({
  typeId: z.enum(["file", "image"]),
  fileUrl: z.string().url(),
  fileName: z.string(),
  fileSize: z.number(),
});

// URL type: link
const linkItemSchema = baseItemSchema.extend({
  typeId: z.literal("link"),
  url: z.string().url(),
  content: z.string().optional(),             // description text for the link
});

export const createItemSchema = z.discriminatedUnion("typeId", [
  textItemSchema,
  fileItemSchema,
  linkItemSchema,
]);
```

### Auth in actions

Every action calls `auth()` and verifies `session.user.id`. For update/delete, also verify the item belongs to the user via a `where: { id, userId }` clause.

---

## Component Responsibilities

### `ItemList` (server-friendly wrapper, or client for interactivity)

- Receives `items[]` and `typeName`
- Renders page header with type icon, name, and item count
- "New [Type]" button opens `ItemDialog` in create mode
- Maps items to `ItemCard` components
- Shows empty state when no items

### `ItemCard`

- Displays item summary (title, description, tags, date)
- Type-aware content preview:
  - **Text types**: first few lines of content, with syntax highlighting for snippet/command
  - **File/Image**: file name + size, thumbnail for images
  - **Link**: URL with favicon
- Contains `ItemActions` for quick actions

### `ItemDialog`

- Shared modal shell for create and edit
- Opens with `mode: "create" | "edit"` and optional `item` data
- Contains `ItemForm` inside
- Handles form submission via Server Actions (`createItem` / `updateItem`)
- Closes + revalidates on success, shows toast on error

### `ItemForm`

- Unified form that adapts fields based on `typeId`:
  - **Always shown**: title, description, tags, collection picker
  - **Text types**: `TextContentField` (with language picker for snippet/command)
  - **File types**: `FileUploadField`
  - **Link**: `UrlField` + optional content textarea
- Controlled component, validates with Zod schema before submit

### Type-specific field components (`fields/`)

These encapsulate the UI that differs between types. The form renders the right field component based on `typeId`:

| Component | Used by | What it renders |
|-----------|---------|-----------------|
| `TextContentField` | snippet, prompt, note, command | Code/markdown editor with syntax highlighting |
| `FileUploadField` | file, image | Drag-and-drop upload, file preview, size display |
| `UrlField` | link | URL input with validation indicator |
| `LanguageSelect` | snippet, command | Dropdown of programming languages |

### `ItemActions`

- Favorite toggle (calls `toggleFavorite` action)
- Pin toggle (calls `togglePin` action)
- Edit button (opens `ItemDialog` in edit mode)
- Delete button (opens `ItemDeleteDialog`)

### `ItemDeleteDialog`

- ShadCN `AlertDialog` confirmation (matches profile page pattern)
- Calls `deleteItem` action
- Shows spinner during deletion

---

## Where Type-Specific Logic Lives

**In components, not actions.** The actions and data layer are type-agnostic — they work with the `Item` model directly. Type-specific behavior is handled by:

1. **`ItemForm`** — conditionally renders field components based on `typeId`
2. **`fields/*`** — each field component owns its own UI and validation
3. **`ItemCard`** — content preview adapts to the item's `contentType` and `typeId`
4. **Zod schemas** — discriminated union validates the right fields per type

This keeps the backend simple (one create/update path) while letting the UI specialize per type.

---

## Data Flow Summary

```
┌─────────────────────────────────────────────────┐
│  Server Component (page.tsx)                     │
│  ├─ auth() → get userId                         │
│  ├─ getItemsByType(userId, type) → items[]       │
│  └─ render <ItemList items={items} />            │
└────────────────────┬────────────────────────────┘
                     │
    ┌────────────────▼────────────────┐
    │  ItemList (client component)     │
    │  ├─ maps items → <ItemCard />    │
    │  └─ "New" button → <ItemDialog> │
    └────────────────┬────────────────┘
                     │
    ┌────────────────▼────────────────┐
    │  ItemDialog + ItemForm           │
    │  ├─ fields adapt by typeId       │
    │  └─ submit → Server Action       │
    └────────────────┬────────────────┘
                     │
    ┌────────────────▼────────────────┐
    │  src/actions/items.ts            │
    │  ├─ auth check                   │
    │  ├─ Zod validation               │
    │  ├─ Prisma create/update/delete  │
    │  └─ revalidatePath               │
    └─────────────────────────────────┘
```

---

## Existing Code Integration

- **Sidebar links** in `SidebarTypes.tsx` already link to `/items/{type}` — these will resolve to the new dynamic route at `/dashboard/items/[type]`
- **`ItemRow`** continues to work on the dashboard for pinned/recent items
- **`ItemCard`** is a new, richer component for the type-filtered list view
- **`getSystemItemTypes()`** and `DashboardItem` in `lib/db/items.ts` remain unchanged — new functions are additive
- **`getIcon()`** in `lib/icons.ts` is reused for type icons everywhere
