"use client";

import { Sidebar } from "@/components/dashboard/Sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
