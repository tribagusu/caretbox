"use server";

import { z } from "zod";
import { auth } from "@/auth";
import {
  createItem as createItemQuery,
  updateItem as updateItemQuery,
  deleteItem as deleteItemQuery,
} from "@/lib/db/items";

const createItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().nullable().optional().default(null),
  content: z.string().nullable().optional().default(null),
  contentType: z.enum(["text", "file"]).default("text"),
  fileUrl: z.string().nullable().optional().default(null),
  fileName: z.string().nullable().optional().default(null),
  fileSize: z.number().int().positive().nullable().optional().default(null),
  url: z
    .union([z.url("Must be a valid URL"), z.literal("")])
    .nullable()
    .optional()
    .default(null)
    .transform((v) => (v === "" ? null : v)),
  language: z.string().trim().nullable().optional().default(null),
  typeId: z.string().min(1, "Type is required"),
  tags: z.array(z.string().trim().min(1)).default([]),
});

export type CreateItemInput = z.input<typeof createItemSchema>;

export async function createItem(data: CreateItemInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Unauthorized" };
  }

  const parsed = createItemSchema.safeParse(data);
  if (!parsed.success) {
    const tree = z.treeifyError(parsed.error);
    const fieldErrors: Record<string, string[]> = {};
    if (tree.properties) {
      for (const [key, node] of Object.entries(tree.properties)) {
        if (node?.errors?.length) {
          fieldErrors[key] = node.errors;
        }
      }
    }
    return { success: false as const, error: fieldErrors };
  }

  try {
    const created = await createItemQuery(session.user.id, {
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      content: parsed.data.content ?? null,
      contentType: parsed.data.contentType,
      fileUrl: parsed.data.fileUrl ?? null,
      fileName: parsed.data.fileName ?? null,
      fileSize: parsed.data.fileSize ?? null,
      url: parsed.data.url ?? null,
      language: parsed.data.language ?? null,
      typeId: parsed.data.typeId,
      tags: parsed.data.tags,
    });

    return { success: true as const, data: created };
  } catch (err) {
    if (err instanceof Error && err.message === "Invalid item type") {
      return { success: false as const, error: "Invalid item type" };
    }
    throw err;
  }
}

const updateItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().nullable().optional().default(null),
  content: z.string().nullable().optional().default(null),
  url: z
    .union([z.url("Must be a valid URL"), z.literal("")])
    .nullable()
    .optional()
    .default(null)
    .transform((v) => (v === "" ? null : v)),
  language: z.string().trim().nullable().optional().default(null),
  tags: z.array(z.string().trim().min(1)).default([]),
});

export type UpdateItemInput = z.input<typeof updateItemSchema>;

export async function updateItem(itemId: string, data: UpdateItemInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Unauthorized" };
  }

  const parsed = updateItemSchema.safeParse(data);
  if (!parsed.success) {
    const tree = z.treeifyError(parsed.error);
    const fieldErrors: Record<string, string[]> = {};
    if (tree.properties) {
      for (const [key, node] of Object.entries(tree.properties)) {
        if (node?.errors?.length) {
          fieldErrors[key] = node.errors;
        }
      }
    }
    return { success: false as const, error: fieldErrors };
  }

  const updated = await updateItemQuery(session.user.id, itemId, {
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    content: parsed.data.content ?? null,
    url: parsed.data.url ?? null,
    language: parsed.data.language ?? null,
    tags: parsed.data.tags,
  });

  if (!updated) {
    return { success: false as const, error: "Item not found" };
  }

  return { success: true as const, data: updated };
}

export async function deleteItem(itemId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Unauthorized" };
  }

  const deleted = await deleteItemQuery(session.user.id, itemId);

  if (!deleted) {
    return { success: false as const, error: "Item not found" };
  }

  return { success: true as const };
}
