"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { updateItem as updateItemQuery } from "@/lib/db/items";

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
