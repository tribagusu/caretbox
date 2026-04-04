import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getProfileData, getProfileStats } from "@/lib/db/profile";
import { ProfileContent } from "@/components/profile/ProfileContent";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const [profile, stats] = await Promise.all([
    getProfileData(session.user.id),
    getProfileStats(session.user.id),
  ]);

  if (!profile) {
    redirect("/sign-in");
  }

  return (
    <div className="flex min-h-screen items-start justify-center bg-background px-4 py-12">
      <div className="w-full max-w-2xl space-y-8">
        <ProfileContent profile={profile} stats={stats} />
      </div>
    </div>
  );
}
