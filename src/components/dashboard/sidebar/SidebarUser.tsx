import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { User } from "@/lib/mock-data";

interface SidebarUserProps {
  user: User;
}

export function SidebarUser({ user }: SidebarUserProps) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-3 rounded-md px-2 py-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground">
        {initials}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium text-sidebar-foreground">
          {user.name}
        </span>
        <span className="truncate text-xs text-muted-foreground">
          {user.email}
        </span>
      </div>
      <Button variant="ghost" size="icon-xs" className="shrink-0 text-muted-foreground">
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  );
}
