"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ArrowLeft, Calendar, Loader2, Mail, Shield } from "lucide-react";
import { getIcon } from "@/lib/icons";
import Link from "next/link";
import type { ProfileData, ProfileStats } from "@/lib/db/profile";

interface ProfileContentProps {
  profile: ProfileData;
  stats: ProfileStats;
}

export function ProfileContent({ profile, stats }: ProfileContentProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setIsChangingPassword(true);

    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (res.ok) {
      toast.success("Password changed successfully");
      setShowChangePassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      const data = await res.json();
      setPasswordError(data.error || "Failed to change password");
    }

    setIsChangingPassword(false);
  }

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

      {/* Usage Stats */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Usage
        </h3>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="rounded-md border border-border bg-background p-4 text-center">
            <div className="text-2xl font-bold text-foreground">
              {stats.totalItems}
            </div>
            <div className="text-sm text-muted-foreground">Items</div>
          </div>
          <div className="rounded-md border border-border bg-background p-4 text-center">
            <div className="text-2xl font-bold text-foreground">
              {stats.totalCollections}
            </div>
            <div className="text-sm text-muted-foreground">Collections</div>
          </div>
        </div>

        {stats.itemsByType.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              By Type
            </h4>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {stats.itemsByType.map((type) => {
                const Icon = getIcon(type.icon || "file");
                return (
                  <div
                    key={type.name}
                    className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2"
                  >
                    <Icon
                      className="h-4 w-4 shrink-0"
                      style={{ color: type.color || undefined }}
                    />
                    <span className="truncate text-sm text-foreground">
                      {type.name}
                    </span>
                    <span className="ml-auto text-sm font-medium text-muted-foreground">
                      {type.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Change Password */}
      {profile.hasPassword && (
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Security
            </h3>
          </div>

          {!showChangePassword ? (
            <Button
              variant="outline"
              onClick={() => setShowChangePassword(true)}
            >
              Change password
            </Button>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-4">
              {passwordError && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {passwordError}
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="currentPassword"
                  className="text-sm font-medium text-foreground"
                >
                  Current password
                </label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="newPassword"
                  className="text-sm font-medium text-foreground"
                >
                  New password
                </label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="confirmNewPassword"
                  className="text-sm font-medium text-foreground"
                >
                  Confirm new password
                </label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isChangingPassword}>
                  {isChangingPassword ? "Changing..." : "Change password"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowChangePassword(false);
                    setPasswordError("");
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

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
