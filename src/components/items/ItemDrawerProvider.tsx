"use client";

import { createContext, useContext, useState, useCallback } from "react";
import type { ItemDetail } from "@/lib/db/items";
import { ItemDrawer } from "@/components/items/ItemDrawer";

interface ItemDrawerContextValue {
  openItem: (itemId: string) => void;
}

const ItemDrawerContext = createContext<ItemDrawerContextValue | null>(null);

export function useItemDrawer() {
  const ctx = useContext(ItemDrawerContext);
  if (!ctx) throw new Error("useItemDrawer must be used within ItemDrawerProvider");
  return ctx;
}

export function ItemDrawerProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const openItem = useCallback(async (itemId: string) => {
    setOpen(true);
    setLoading(true);
    setItem(null);

    try {
      const res = await fetch(`/api/items/${itemId}`);
      if (!res.ok) throw new Error("Failed to fetch item");
      const data = await res.json();
      setItem(data);
    } catch {
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <ItemDrawerContext.Provider value={{ openItem }}>
      {children}
      <ItemDrawer
        open={open}
        onOpenChange={setOpen}
        item={item}
        loading={loading}
      />
    </ItemDrawerContext.Provider>
  );
}
