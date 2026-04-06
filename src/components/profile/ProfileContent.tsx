"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Calendar, Loader2, Mail } from "lucide-react";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { UsageStats } from "@/components/profile/UsageStats";
import Link from "next/link";
import type { ProfileData, ProfileStats } from "@/lib/db/profile";

interface ProfileContentProps {
  profile: ProfileData;
  stats: ProfileStats;
}

export function ProfileContent({ profile, stats }: ProfileContentProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDeleteAccount() {
    setIsDeleting(true);

    const res = await fetch("/api/auth/account", { method: "DELETE" });

    if (res.ok) {
      signOut({ callbackUrl: "/sign-in" });
    } else {
      toast.error("Failed to delete account. Please try again.");
      setIsDeleting(false);
    }
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
      </div>

      {/* User Info */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <UserAvatar name={profile.name} image={profile.image} size="lg" />
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-foreground">
              {profile.name || "User"}
            </h2>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              <span className="truncate">{profile.email}</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                Joined{" "}
                {new Date(profile.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <UsageStats stats={stats} />

      {profile.hasPassword && <ChangePasswordForm />}

      {/* Danger Zone */}
      <div className="rounded-lg border border-destructive/30 bg-card p-6">
        <h3 className="mb-2 text-sm font-medium uppercase tracking-wider text-destructive">
          Danger Zone
        </h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Permanently delete your account and all associated data. This action
          cannot be undone.
        </p>

        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button variant="destructive" disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete account"}
              </Button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete your account, all your items,
                collections, and tags. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isDeleting ? "Deleting..." : "Delete my account"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
