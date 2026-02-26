import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { PencilSquare } from "@/components/icons/PencilSquare"
import { AuthUser } from "@/server/auth.ts"

interface ProfileHeaderProps {
  user: AuthUser
  avatarUrl?: string
  onEdit?: () => void
}

function getInitials(displayName?: string) {
  if (!displayName) return "U"

  const parts = displayName.split(" ")
  return parts.length === 1
    ? parts[0][0]
    : `${parts[0][0]}${parts[1][0]}`
}

export function ProfileHeader({
  user,
  avatarUrl,
}: ProfileHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-lg bg-card px-6 py-6 flex border-3 border-kfk-light-blue gap-6 items-center">
      <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
        <AvatarImage src={avatarUrl} />
        <AvatarFallback className="bg-kfk-blue text-white text-[50px] font-semibold">
          {getInitials(user?.displayName)}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <div className="flex flex-row items-center gap-4">
          <h2 className="text-3xl font-semibold text-foreground">
            {user?.displayName || "User Name"}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="group hover:bg-muted rounded-md"
          >
            <PencilSquare className="text-muted-foreground transition-colors size-6 group-hover:text-foreground" />
          </Button>
        </div>
        <p className="text-muted-foreground">
          {user?.role}
        </p>
      </div>
    </div>
  )
}