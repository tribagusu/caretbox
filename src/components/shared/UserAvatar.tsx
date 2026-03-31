import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name: string | null | undefined;
  image?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function UserAvatar({
  name,
  image,
  size = "sm",
  className,
}: UserAvatarProps) {
  if (image) {
    return (
      <img
        src={image}
        alt={name ?? "User avatar"}
        className={cn(
          "shrink-0 rounded-full object-cover",
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-sidebar-accent font-semibold text-sidebar-accent-foreground",
        sizeClasses[size],
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}
