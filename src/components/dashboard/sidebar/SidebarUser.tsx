"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { UserAvatar } from "@/components/shared/UserAvatar";
import Link from "next/link";

interface SidebarUserProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function SidebarUser({ user }: SidebarUserProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={menuRef} className="relative">
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-1 w-full rounded-lg border border-border bg-popover p-1 shadow-lg">
          <button
            onClick={() => signOut({ callbackUrl: "/sign-in" })}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}

      <div className="flex items-center gap-3 rounded-md px-2 py-2">
        <Link href="/profile" className="shrink-0">
          <UserAvatar name={user.name} image={user.image} size="sm" />
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex min-w-0 flex-1 cursor-pointer flex-col text-left"
        >
          <span className="truncate text-sm font-medium text-sidebar-foreground">
            {user.name || "User"}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {user.email}
          </span>
        </button>
      </div>
    </div>
  );
}
