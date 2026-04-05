import { notFound } from "next/navigation";
import { getItemsByType, getSystemItemTypes } from "@/lib/db/items";
import { getIcon } from "@/lib/icons";
import { ItemCard } from "@/components/items/ItemCard";

interface ItemsPageProps {
  params: Promise<{ type: string }>;
}

export default async function ItemsPage({ params }: ItemsPageProps) {
  const { type } = await params;

  const itemTypes = await getSystemItemTypes();
  const itemType = itemTypes.find(
    (t) => t.name.toLowerCase() === type.toLowerCase()
  );

  if (!itemType) notFound();

  const items = await getItemsByType(itemType.name);
  const TypeIcon = getIcon(itemType.icon ?? "file");
  const color = itemType.color ?? "#6366f1";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${color}20` }}
        >
          <TypeIcon className="h-5 w-5" style={{ color }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{itemType.name}</h1>
          <p className="text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "items"}
          </p>
        </div>
      </div>

      {items.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border py-12 text-center">
          <TypeIcon className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 text-muted-foreground">
            No {itemType.name.toLowerCase()} items yet
          </p>
        </div>
      )}
    </div>
  );
}
