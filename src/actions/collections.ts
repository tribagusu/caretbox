"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { createCollection as createCollectionQuery } from "@/lib/db/collections";

const createCollectionSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().nullable().optional().default(null),
});

export type CreateCollectionInput = z.input<typeof createCollectionSchema>;

export async function createCollection(data: CreateCollectionInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Unauthorized" };
  }

  const parsed = createCollectionSchema.safeParse(data);
  if (!parsed.success) {
    const tree = z.treeifyError(parsed.error) as {
      properties?: Record<string, { errors?: string[] }>;
    };
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

  const created = await createCollectionQuery(session.user.id, {
    name: parsed.data.name,
    description: parsed.data.description ?? null,
  });

  return { success: true as const, data: created };
}
