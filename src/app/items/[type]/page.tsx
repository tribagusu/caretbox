import { notFound } from "next/navigation";
import { getItemsByType, getSystemItemTypes } from "@/lib/db/items";
import { getIcon } from "@/lib/icons";
import { ItemCard } from "@/components/items/ItemCard";
import { ImageCard } from "@/components/items/ImageCard";
import { TypePageHeader } from "@/components/items/TypePageHeader";
import { auth } from "@/auth";

interface ItemsPageProps {
  params: Promise<{ type: string }>;
}

export default async function ItemsPage({ params }: ItemsPageProps) {
  const { type } = await params;

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const itemTypes = await getSystemItemTypes(userId);
  const itemType = itemTypes.find(
    (t) => t.name.toLowerCase() === type.toLowerCase()
  );

  if (!itemType) notFound();

  const items = await getItemsByType(userId, itemType.name);
  const TypeIcon = getIcon(itemType.icon ?? "file");
  const isImageType = itemType.name.toLowerCase() === "image";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <TypePageHeader
        itemType={itemType}
        itemTypes={itemTypes}
        itemCount={items.length}
      />

      {items.length > 0 ? (
        <div
          className={
            isImageType
              ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              : "grid gap-4 md:grid-cols-2"
          }
        >
          {items.map((item) =>
            isImageType ? (
              <ImageCard key={item.id} item={item} />
            ) : (
              <ItemCard key={item.id} item={item} />
            )
          )}
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
