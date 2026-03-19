import { Pin } from "lucide-react";
import { items } from "@/lib/mock-data";
import { getRecentCollections, getCollectionStats } from "@/lib/db/collections";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { CollectionCard } from "@/components/dashboard/CollectionCard";
import { ItemRow } from "@/components/dashboard/ItemRow";

export default async function DashboardPage() {
  const [collections, collectionStats] = await Promise.all([
    getRecentCollections(6),
    getCollectionStats(),
  ]);

  const pinnedItems = items.filter((item) => item.isPinned);
  const recentItems = items
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 10);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Your developer knowledge hub</p>
      </div>

      <StatsCards
        items={items}
        totalCollections={collectionStats.totalCollections}
        favoriteCollections={collectionStats.favoriteCollections}
      />

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Collections</h2>
          <button className="text-sm text-muted-foreground hover:text-foreground">
            View all
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      </section>

      {pinnedItems.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Pin className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Pinned</h2>
          </div>
          <div className="space-y-2">
            {pinnedItems.map((item) => (
              <ItemRow key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-lg font-semibold">Recent</h2>
        <div className="space-y-2">
          {recentItems.map((item) => (
            <ItemRow key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
