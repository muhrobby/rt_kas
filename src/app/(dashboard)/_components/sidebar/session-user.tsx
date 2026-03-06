import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

interface SessionUserProps {
  readonly user: {
    readonly name: string;
    readonly role: string;
  };
}

export function SessionUser({ user }: SessionUserProps) {
  const roleLabel = user.role === "admin" ? "Admin" : "Warga";

  return (
    <div className="flex items-center gap-2">
      <div className="hidden text-right text-sm leading-tight sm:block">
        <p className="truncate font-medium">{user.name}</p>
        <p className="truncate text-muted-foreground text-xs">{roleLabel}</p>
      </div>
      <Avatar className="h-8 w-8 rounded-lg">
        <AvatarFallback className="rounded-lg text-xs">{getInitials(user.name)}</AvatarFallback>
      </Avatar>
    </div>
  );
}
